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
  Switch,
  Progress
} from 'antd';
import {
  TeamOutlined,
  FileExcelOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  UserAddOutlined,
  CalendarOutlined,
  MessageOutlined,
  TrophyOutlined,
  StarOutlined
} from '@ant-design/icons';
import { supabase } from './supabase';
import { hrCrud } from './hrCrud';
import { excelReportGenerator } from './excelReportGenerator';
import { roleTableConfigs } from './roleTableConfigs';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const HRDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [activeTable, setActiveTable] = useState('employee');
  const [tableData, setTableData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const tableConfigs = roleTableConfigs.hr;
  const allTables = Object.keys(tableConfigs);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    console.log('👥 Fetching HR dashboard statistics...');
    setLoading(true);

    try {
      const [employees, leaves, attendance, feedback, positions, kpi] = await Promise.all([
        hrCrud.getAll('employee'),
        hrCrud.getAll('employeeleave'),
        hrCrud.getAll('attendance'),
        hrCrud.getAll('employee_feedback'),
        hrCrud.getAll('positions'),
        hrCrud.getAll('kpi')
      ]);

      const pendingLeaves = leaves.data?.filter(leave => leave.leavestatus === 'pending').length || 0;
      const activeEmployees = employees.data?.filter(emp => emp.status === 'Active').length || 0;
      const avgKPI = employees.data?.reduce((sum, emp) => sum + (emp.kpiscore || 0), 0) / (employees.data?.length || 1);

      setStats({
        totalEmployees: employees.data?.length || 0,
        activeEmployees: activeEmployees,
        pendingLeaves: pendingLeaves,
        totalFeedback: feedback.data?.length || 0,
        openPositions: positions.data?.filter(pos => pos.status === 'open').length || 0,
        averageKPI: Math.round(avgKPI * 10) / 10,
        totalKPIRecords: kpi.data?.length || 0
      });

    } catch (error) {
      console.error('💥 Error loading HR stats:', error);
      message.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for active table
  const fetchTableData = async (tableName) => {
    console.log(`📋 Fetching data for table: ${tableName}`);
    try {
      const result = await hrCrud.getAll(tableName);
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
        result = await excelReportGenerator.generateSummaryExcel(tableData, 'hr');
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

  // CRUD Operations
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
      if (key === 'is_active') formData[key] = Boolean(formData[key]);
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
        result = await hrCrud.create(activeTable, processedValues);
      } else {
        const idColumn = getTableIdColumn(activeTable);
        const recordId = editingRecord[idColumn];
        result = await hrCrud.update(activeTable, recordId, processedValues, idColumn);
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

  // Special KPI update function
  const handleKPIUpdate = async (empid, kpiScore) => {
    try {
      const employee = tableData.employee?.find(emp => emp.empid === empid);
      if (!employee) {
        message.error('Employee not found');
        return;
      }

      const result = await hrCrud.updateEmployeeKPI(empid, {
        kpiscore: kpiScore,
        email: employee.email
      });

      if (result.success) {
        message.success('KPI updated successfully!');
        await fetchTableData('employee');
        await fetchTableData('kpi');
        await fetchDashboardStats();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      message.error(`KPI update failed: ${error.message}`);
    }
  };

  const handleDeleteRecord = async (record) => {
    const idColumn = getTableIdColumn(activeTable);
    const recordId = record[idColumn];
    try {
      const result = await hrCrud.delete(activeTable, recordId, idColumn);
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
      employee: 'empid',
      employeeleave: 'leaveid',
      attendance: 'attendanceid',
      employee_feedback: 'id',
      departments: 'departmentid',
      positions: 'position_id',
      promotion: 'promotionid',
      kpi: 'kpiid',
      kpi_categories: 'id',
      kpi_details: 'id',
      performance_rating: 'ratingid'
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
      render: (value, record) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (value instanceof Date) return dayjs(value).format('DD MMM YYYY');
        
        // Special rendering for KPI score
        if (col === 'kpiscore' || col === 'kpivalue') {
          const score = Number(value);
          let color = 'red';
          if (score >= 80) color = 'green';
          else if (score >= 60) color = 'orange';
          
          return (
            <Space>
              <Progress 
                type="circle" 
                percent={score} 
                size={30} 
                format={percent => `${percent}`}
                strokeColor={color}
              />
              {tableName === 'employee' && (
                <Button 
                  size="small" 
                  type="link"
                  onClick={() => {
                    Modal.confirm({
                      title: 'Update KPI Score',
                      content: (
                        <InputNumber 
                          min={0} 
                          max={100} 
                          defaultValue={score}
                          onChange={(newScore) => {
                            if (newScore !== null) {
                              handleKPIUpdate(record.empid, newScore);
                              Modal.destroyAll();
                            }
                          }}
                        />
                      ),
                      onOk: () => Modal.destroyAll(),
                      onCancel: () => Modal.destroyAll()
                    });
                  }}
                >
                  Update
                </Button>
              )}
            </Space>
          );
        }
        
        if (col === 'leavestatus' || col === 'status') {
          const color = value === 'approved' ? 'green' : value === 'pending' ? 'orange' : 'red';
          return <Tag color={color}>{value?.toUpperCase()}</Tag>;
        }
        
        if (col === 'rating') {
          return <span>{'⭐'.repeat(value)} ({value}/5)</span>;
        }
        
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
          <Popconfirm 
            title="Are you sure to delete this record?" 
            onConfirm={() => handleDeleteRecord(record)}
            okText="Yes" 
            cancelText="No"
          >
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
        case 'number': return <InputNumber {...commonProps} style={{ width: '100%' }} min={field.min} max={field.max} />;
        case 'select': return (
          <Select {...commonProps}>
            {field.options?.map(opt => <Option key={opt} value={opt}>{opt}</Option>)}
          </Select>
        );
        case 'date': return <DatePicker {...commonProps} style={{ width: '100%' }} />;
        case 'textarea': return <TextArea rows={4} {...commonProps} />;
        case 'switch': return (
          <Form.Item {...commonProps} valuePropName="checked">
            <Switch />
          </Form.Item>
        );
        default: return <Input {...commonProps} />;
      }
    });
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  // Statistics for HR with KPI
  const statsData = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees || 0,
      prefix: <TeamOutlined />,
      valueStyle: { color: '#1890ff' }
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees || 0,
      prefix: <UserAddOutlined />,
      valueStyle: { color: '#52c41a' }
    },
    {
      title: 'Average KPI',
      value: stats.averageKPI || 0,
      suffix: '/100',
      prefix: <TrophyOutlined />,
      valueStyle: { color: '#faad14' }
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves || 0,
      prefix: <CalendarOutlined />,
      valueStyle: { color: '#722ed1' }
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <Text>Loading HR dashboard...</Text>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>HR Dashboard</Title>
        <Text type="secondary">Human resources management with KPI tracking</Text>
      </div>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {statsData.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic 
                title={stat.title} 
                value={stat.value} 
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={stat.valueStyle} 
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="HR Management" style={{ marginBottom: 24 }}>
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
                  <Tag style={{ marginLeft: 8 }}>{tableData[tableName]?.length || 0}</Tag>
                </span>
              }
            >
              <Table 
                dataSource={tableData[tableName] || []}
                columns={getTableColumns(tableName)}
                rowKey={getTableIdColumn(tableName)}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1000 }}
                size="middle"
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
        destroyOnClose
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

export default HRDashboard;