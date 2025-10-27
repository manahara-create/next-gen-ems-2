import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Alert,
  Spin,
  Tabs,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Tooltip,
  Popconfirm,
  InputNumber,
  Dropdown,
  Progress
} from 'antd';
import {
  DollarOutlined,
  CalculatorOutlined,
  FileExcelOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  TeamOutlined,
  CreditCardOutlined
} from '@ant-design/icons';
import { supabase } from './supabase';
import { adminCrud } from './adminCrud';
import { excelReportGenerator } from './excelReportGenerator';
import { roleTableConfigs } from './roleTableConfigs';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const AccountantDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [activeTable, setActiveTable] = useState('salary');
  const [tableData, setTableData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const tableConfigs = roleTableConfigs.accountant;
  const allTables = Object.keys(tableConfigs);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    console.log('💰 Fetching accountant dashboard statistics...');
    setLoading(true);

    try {
      const [salary, bonus, loans, epf, financial] = await Promise.all([
        adminCrud.getAll('salary'),
        adminCrud.getAll('bonus'),
        adminCrud.getAll('loanrequest'),
        adminCrud.getAll('epf_contributions'),
        adminCrud.getAll('financialreports')
      ]);

      const totalSalary = salary.data?.reduce((sum, item) => sum + (item.totalsalary || 0), 0) || 0;
      const totalBonus = bonus.data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
      const pendingLoans = loans.data?.filter(loan => loan.status === 'pending').length || 0;

      setStats({
        totalSalary: totalSalary,
        totalBonus: totalBonus,
        pendingLoans: pendingLoans,
        totalEPF: epf.data?.length || 0,
        financialReports: financial.data?.length || 0
      });

    } catch (error) {
      console.error('💥 Error loading accountant stats:', error);
      message.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for active table
  const fetchTableData = async (tableName) => {
    console.log(`📋 Fetching data for table: ${tableName}`);
    try {
      const result = await adminCrud.getAll(tableName);
      if (result.success) {
        setTableData(prev => ({ ...prev, [tableName]: result.data || [] }));
      }
    } catch (error) {
      console.error(`💥 Error loading ${tableName}:`, error);
      message.error(`Failed to load ${tableConfigs[tableName]?.displayName}`);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    allTables.forEach(table => fetchTableData(table));
  }, []);

  // Report generation
  const handleGenerateReport = async (reportType) => {
    setGeneratingReport(true);
    try {
      let result;
      if (reportType === 'summary') {
        result = await excelReportGenerator.generateSummaryExcel(tableData, 'accountant');
      } else {
        const currentData = tableData[activeTable] || [];
        result = await excelReportGenerator.generateExcel(activeTable, currentData, { tableConfigs });
      }

      if (result.success) {
        message.success('Excel report generated successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      message.error(`Report generation failed: ${error.message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  // CRUD Operations (similar to AdminDashboard but simplified)
  const showCreateModal = () => {
    setModalType('create');
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (record) => {
    setModalType('edit');
    setEditingRecord(record);
    const formData = { ...record };
    Object.keys(formData).forEach(key => {
      if (formData[key] && key.includes('date')) formData[key] = dayjs(formData[key]);
    });
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleFormSubmit = async (values) => {
    setSubmitting(true);
    try {
      const processedValues = { ...values };
      Object.keys(processedValues).forEach(key => {
        if (dayjs.isDayjs(processedValues[key])) {
          processedValues[key] = processedValues[key].format('YYYY-MM-DD');
        }
      });

      let result;
      if (modalType === 'create') {
        result = await adminCrud.create(activeTable, processedValues);
      } else {
        const idColumn = getTableIdColumn(activeTable);
        const recordId = editingRecord[idColumn];
        result = await adminCrud.update(activeTable, recordId, processedValues, idColumn);
      }

      if (result.success) {
        message.success(`Record ${modalType === 'create' ? 'created' : 'updated'} successfully!`);
        handleModalCancel();
        await fetchTableData(activeTable);
        await fetchDashboardStats();
      }
    } catch (error) {
      message.error(`Operation failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (record) => {
    const idColumn = getTableIdColumn(activeTable);
    const recordId = record[idColumn];
    try {
      const result = await adminCrud.delete(activeTable, recordId, idColumn);
      if (result.success) {
        message.success('Record deleted successfully!');
        await fetchTableData(activeTable);
        await fetchDashboardStats();
      }
    } catch (error) {
      message.error(`Delete failed: ${error.message}`);
    }
  };

  const getTableIdColumn = (tableName) => {
    const idColumns = {
      salary: 'salaryid',
      bonus: 'bonusid',
      loanrequest: 'loanrequestid',
      epf_contributions: 'id',
      financialreports: 'reportid',
      employee: 'empid',
      ot: 'otid'
    };
    return idColumns[tableName] || 'id';
  };

  const getTableColumns = (tableName) => {
    const config = tableConfigs[tableName];
    if (!config) return [];

    const baseColumns = config.columns.map(col => ({
      title: col.replace(/_/g, ' ').toUpperCase(),
      dataIndex: col,
      key: col,
      render: (value) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (value instanceof Date) return dayjs(value).format('DD MMM YYYY');
        return String(value);
      }
    }));

    const actionColumn = {
      title: 'ACTIONS',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button type="link" icon={<EditOutlined />} onClick={() => showEditModal(record)} />
          </Tooltip>
          <Popconfirm title="Delete this record?" onConfirm={() => handleDeleteRecord(record)}>
            <Tooltip title="Delete">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    };

    return [...baseColumns, actionColumn];
  };

  const renderFormFields = () => {
    const config = tableConfigs[activeTable];
    if (!config) return null;

    return config.formFields.map(field => {
      const commonProps = {
        key: field.name,
        name: field.name,
        label: field.label,
        rules: field.required ? [{ required: true, message: `Please enter ${field.label}` }] : []
      };

      switch (field.type) {
        case 'text': return <Input {...commonProps} />;
        case 'email': return <Input type="email" {...commonProps} />;
        case 'number': return <InputNumber {...commonProps} style={{ width: '100%' }} />;
        case 'select': return (
          <Select {...commonProps}>
            {field.options?.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
          </Select>
        );
        case 'date': return <DatePicker {...commonProps} style={{ width: '100%' }} />;
        case 'textarea': return <TextArea rows={4} {...commonProps} />;
        default: return <Input {...commonProps} />;
      }
    });
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  // Statistics for Accountant
  const statsData = [
    {
      title: 'Total Salary Paid',
      value: stats.totalSalary ? `$${(stats.totalSalary).toLocaleString()}` : '$0',
      prefix: <DollarOutlined />,
      valueStyle: { color: '#52c41a' }
    },
    {
      title: 'Total Bonus Paid',
      value: stats.totalBonus ? `$${stats.totalBonus.toLocaleString()}` : '$0',
      prefix: <CalculatorOutlined />,
      valueStyle: { color: '#1890ff' }
    },
    {
      title: 'Pending Loans',
      value: stats.pendingLoans || 0,
      prefix: <CreditCardOutlined />,
      valueStyle: { color: '#faad14' }
    },
    {
      title: 'EPF Records',
      value: stats.totalEPF || 0,
      prefix: <TeamOutlined />,
      valueStyle: { color: '#722ed1' }
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <Text>Loading accountant dashboard...</Text>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Accountant Dashboard</Title>
        <Text type="secondary">Financial management and payroll operations</Text>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {statsData.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic title={stat.title} value={stat.value} prefix={stat.prefix} valueStyle={stat.valueStyle} />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="Financial Management" style={{ marginBottom: 24 }}>
        <Space wrap>
          <Button type="primary" icon={<PlusOutlined />} onClick={showCreateModal}>Add Record</Button>
          <Button icon={<ReloadOutlined />} onClick={() => fetchTableData(activeTable)}>Refresh</Button>
          <Button 
            icon={<FileExcelOutlined />} 
            loading={generatingReport}
            onClick={() => handleGenerateReport('table')}
          >
            Export Excel
          </Button>
          <Button 
            icon={<BarChartOutlined />}
            onClick={() => handleGenerateReport('summary')}
            disabled={generatingReport}
          >
            Summary Report
          </Button>
        </Space>
      </Card>

      <Card>
        <Tabs activeKey={activeTable} onChange={setActiveTable}>
          {allTables.map(tableName => (
            <TabPane 
              key={tableName}
              tab={
                <span>
                  <DatabaseOutlined />
                  {tableConfigs[tableName]?.displayName}
                </span>
              }
            >
              <Table 
                dataSource={tableData[tableName] || []}
                columns={getTableColumns(tableName)}
                rowKey={getTableIdColumn(tableName)}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 800 }}
              />
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <Modal
        title={`${modalType === 'create' ? 'Create' : 'Edit'} ${tableConfigs[activeTable]?.displayName}`}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
          {renderFormFields()}
          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {modalType === 'create' ? 'Create' : 'Update'}
              </Button>
              <Button onClick={handleModalCancel}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountantDashboard;