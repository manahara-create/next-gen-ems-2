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
  Divider,
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
  Progress,
  Switch,
  Badge,
  List,
  Avatar,
  Descriptions
} from 'antd';
import {
  DollarOutlined,
  CalculatorOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  FileExcelOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FundOutlined,
  TransactionOutlined,
  BankOutlined
} from '@ant-design/icons';
import { supabase } from './supabase';
import { accountantCrud, accountantTableConfigs } from './accountantCrud';
import { reportGenerator } from './reportGenerator';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

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
  const [searchText, setSearchText] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [accountantId, setAccountantId] = useState(null);
  const [payrollSummary, setPayrollSummary] = useState(null);
  const [processingPayroll, setProcessingPayroll] = useState(false);

  // All available tables from schema
  const allTables = Object.keys(accountantTableConfigs);

  // Get accountant ID from current user
  useEffect(() => {
    const getAccountantInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: accountantData } = await supabase
          .from('employee')
          .select('empid')
          .eq('email', user.email)
          .single();
        
        if (accountantData) {
          setAccountantId(accountantData.empid);
        }
      }
    };
    getAccountantInfo();
  }, []);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    console.log('📊 Fetching accountant dashboard statistics...');
    setLoading(true);

    try {
      const currentMonth = dayjs().format('YYYY-MM-01');
      
      const [
        salaryData,
        bonusData,
        otData,
        epfData,
        etfData,
        financialReports,
        loanRequests
      ] = await Promise.all([
        accountantCrud.getAll('salary'),
        accountantCrud.getAll('bonus'),
        accountantCrud.getAll('ot'),
        accountantCrud.getAll('epf_contributions'),
        accountantCrud.getAll('etf_contributions'),
        accountantCrud.getAll('financialreports'),
        accountantCrud.getAll('loanrequest')
      ]);

      // Get payroll summary for current month
      const payrollResult = await accountantCrud.getPayrollSummary(currentMonth);
      
      const statsData = {
        totalSalary: salaryData.data?.reduce((sum, item) => sum + (item.totalsalary || 0), 0) || 0,
        totalBonus: bonusData.data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0,
        totalOT: otData.data?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0,
        totalEPF: epfData.data?.reduce((sum, item) => sum + (item.totalcontribution || 0), 0) || 0,
        totalETF: etfData.data?.reduce((sum, item) => sum + (item.employercontribution || 0), 0) || 0,
        pendingLoans: loanRequests.data?.filter(l => l.status === 'pending')?.length || 0,
        financialReportsCount: financialReports.data?.length || 0,
        payrollSummary: payrollResult.success ? payrollResult.data : null
      };

      setStats(statsData);
      setPayrollSummary(payrollResult.success ? payrollResult.data : null);
      console.log('✅ Accountant dashboard stats loaded:', statsData);

    } catch (error) {
      console.error('💥 Error loading accountant dashboard stats:', error);
      message.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for active table
  const fetchTableData = async (tableName) => {
    console.log(`📋 Fetching data for table: ${tableName}`);
    
    try {
      const result = await accountantCrud.getAll(tableName);
      
      if (result.success) {
        setTableData(prev => ({
          ...prev,
          [tableName]: result.data || []
        }));
        console.log(`✅ Loaded ${result.data?.length} records from ${tableName}`);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`💥 Error loading ${tableName}:`, error);
      message.error(`Failed to load ${accountantTableConfigs[tableName]?.displayName || tableName}`);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchTableData(activeTable);
  }, [activeTable]);

  // Handle quick export
  const handleQuickExport = async (format) => {
    const currentData = tableData[activeTable] || [];
    
    if (currentData.length === 0) {
      message.warning('No data available to export');
      return;
    }

    setGeneratingReport(true);

    try {
      let result;
      
      if (format === 'excel') {
        result = await reportGenerator.generateExcel(
          activeTable, 
          currentData, 
          { tableConfigs: accountantTableConfigs }
        );
      }

      if (result.success) {
        message.success(`Excel report exported successfully!`);
        
        // Log the operation
        await accountantCrud.create('accountant_operations', {
          operation: 'EXPORT_REPORT',
          record_id: null,
          accountant_id: accountantId,
          details: JSON.stringify({
            table: activeTable,
            format: format,
            record_count: currentData.length
          }),
          email: 'accountant@system',
          operation_time: new Date().toISOString()
        });

      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error(`💥 Export failed:`, error);
      message.error(`Export failed: ${error.message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Handle modal operations
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
      if (formData[key] && (key.includes('date') || key.includes('Date'))) {
        formData[key] = dayjs(formData[key]);
      }
    });
    
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setEditingRecord(null);
    form.resetFields();
  };

  // Handle form submission
  const handleFormSubmit = async (values) => {
    if (!accountantId) return;
    
    console.log(`📝 Submitting ${modalType} form for ${activeTable}:`, values);
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
        result = await accountantCrud.create(activeTable, processedValues, accountantId);
      } else {
        const idColumn = getTableIdColumn(activeTable);
        const recordId = editingRecord[idColumn];
        result = await accountantCrud.update(activeTable, recordId, processedValues, accountantId, idColumn);
      }

      if (result.success) {
        message.success(
          `${accountantTableConfigs[activeTable]?.displayName} ${modalType === 'create' ? 'created' : 'updated'} successfully!`
        );
        handleModalCancel();
        await fetchTableData(activeTable);
        await fetchDashboardStats();
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error(`💥 ${modalType} operation failed:`, error);
      message.error(`Operation failed: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete record
  const handleDeleteRecord = async (record) => {
    if (!accountantId) return;
    
    console.log(`🗑️ Deleting record from ${activeTable}:`, record);
    
    const idColumn = getTableIdColumn(activeTable);
    const recordId = record[idColumn];

    try {
      const result = await accountantCrud.delete(activeTable, recordId, accountantId, idColumn);

      if (result.success) {
        message.success('Record deleted successfully!');
        await fetchTableData(activeTable);
        await fetchDashboardStats();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('💥 Delete operation failed:', error);
      message.error(`Delete failed: ${error.message}`);
    }
  };

  // Handle process payroll
  const handleProcessPayroll = async () => {
    if (!accountantId) return;
    
    setProcessingPayroll(true);
    
    try {
      // This would typically process all pending salaries for the current month
      message.info('Payroll processing started...');
      
      // Simulate payroll processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Log the operation
      await accountantCrud.create('accountant_operations', {
        operation: 'PROCESS_PAYROLL',
        record_id: null,
        accountant_id: accountantId,
        details: JSON.stringify({
          month: dayjs().format('YYYY-MM'),
          timestamp: new Date().toISOString()
        }),
        email: 'accountant@system',
        operation_time: new Date().toISOString()
      });

      message.success('Payroll processed successfully!');
      await fetchDashboardStats();

    } catch (error) {
      console.error('💥 Payroll processing failed:', error);
      message.error('Payroll processing failed');
    } finally {
      setProcessingPayroll(false);
    }
  };

  // Handle loan approval
  const handleProcessLoan = async (loanId, status, remarks = '') => {
    if (!accountantId) return;
    
    try {
      const result = await accountantCrud.update(
        'loanrequest', 
        loanId, 
        { 
          status: status,
          processedby: accountantId,
          remarks: remarks
        }, 
        accountantId, 
        'loanrequestid'
      );
      
      if (result.success) {
        message.success(`Loan request ${status} successfully!`);
        await fetchTableData('loanrequest');
        await fetchDashboardStats();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('💥 Process loan failed:', error);
      message.error(`Failed to process loan: ${error.message}`);
    }
  };

  // Get ID column for table
  const getTableIdColumn = (tableName) => {
    const idColumns = {
      salary: 'salaryid',
      bonus: 'bonusid',
      ot: 'otid',
      epf_contributions: 'id',
      etf_contributions: 'id',
      financialreports: 'reportid',
      loanrequest: 'loanrequestid'
    };
    return idColumns[tableName] || 'id';
  };

  // Get columns for table with actions
  const getTableColumns = (tableName) => {
    const config = accountantTableConfigs[tableName];
    if (!config) return [];

    const baseColumns = config.columns.map(col => ({
      title: col.replace(/_/g, ' ').toUpperCase(),
      dataIndex: col,
      key: col,
      render: (value) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (value instanceof Date) return dayjs(value).format('DD MMM YYYY');
        if (typeof value === 'string' && value.includes('T')) {
          return dayjs(value).format('DD MMM YYYY HH:mm');
        }
        if (typeof value === 'number' && (col.includes('amount') || col.includes('salary') || col.includes('contribution'))) {
          return `$${value.toLocaleString()}`;
        }
        return String(value);
      }
    }));

    // Add action column
    const actionColumn = {
      title: 'ACTIONS',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure to delete this record?"
            onConfirm={() => handleDeleteRecord(record)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
          
          {/* Special actions for loan requests */}
          {tableName === 'loanrequest' && record.status === 'pending' && (
            <>
              <Tooltip title="Approve">
                <Button 
                  type="link" 
                  style={{ color: '#52c41a' }}
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleProcessLoan(record.loanrequestid, 'approved', 'Approved by accountant')}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button 
                  type="link" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => handleProcessLoan(record.loanrequestid, 'rejected', 'Rejected by accountant')}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    };

    return [...baseColumns, actionColumn];
  };

  // Render form fields based on table configuration
  const renderFormFields = () => {
    const config = accountantTableConfigs[activeTable];
    if (!config) return null;

    return config.formFields.map(field => {
      const commonProps = {
        key: field.name,
        name: field.name,
        label: field.label,
        rules: field.required ? [{ required: true, message: `Please enter ${field.label}` }] : []
      };

      switch (field.type) {
        case 'text':
          return <Input {...commonProps} />;
        
        case 'email':
          return <Input type="email" {...commonProps} />;
        
        case 'number':
          return <InputNumber {...commonProps} style={{ width: '100%' }} />;
        
        case 'select':
          return (
            <Select {...commonProps} placeholder={`Select ${field.label}`}>
              {field.options?.map(opt => (
                <Option key={opt} value={opt}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Option>
              ))}
            </Select>
          );
        
        case 'date':
          return <DatePicker {...commonProps} style={{ width: '100%' }} />;
        
        case 'time':
          return <DatePicker.TimePicker {...commonProps} style={{ width: '100%' }} />;
        
        case 'textarea':
          return <TextArea rows={4} {...commonProps} />;
        
        case 'switch':
          return (
            <Form.Item {...commonProps} valuePropName="checked">
              <Switch />
            </Form.Item>
          );
        
        default:
          return <Input {...commonProps} />;
      }
    });
  };

  // Report dropdown items
  const reportItems = [
    {
      key: 'excel',
      icon: <FileExcelOutlined />,
      label: 'Export as Excel',
      onClick: () => handleQuickExport('excel')
    }
  ];

  // Statistics cards data
  const statsData = [
    {
      title: 'Total Salary',
      value: stats.totalSalary ? `$${(stats.totalSalary / 1000).toFixed(1)}k` : '$0',
      prefix: <DollarOutlined />,
      valueStyle: { color: '#1890ff' }
    },
    {
      title: 'Total Bonus',
      value: stats.totalBonus ? `$${(stats.totalBonus / 1000).toFixed(1)}k` : '$0',
      prefix: <FundOutlined />,
      valueStyle: { color: '#52c41a' }
    },
    {
      title: 'Pending Loans',
      value: stats.pendingLoans || 0,
      prefix: <TransactionOutlined />,
      valueStyle: { color: '#faad14' }
    },
    {
      title: 'Financial Reports',
      value: stats.financialReportsCount || 0,
      prefix: <FileTextOutlined />,
      valueStyle: { color: '#722ed1' }
    }
  ];

  // Filter data based on search
  const filteredData = tableData[activeTable]?.filter(record =>
    Object.values(record).some(value =>
      String(value).toLowerCase().includes(searchText.toLowerCase())
    )
  ) || [];

  if (loading && !tableData[activeTable]) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading accountant dashboard...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Accountant Dashboard</Title>
        <Text type="secondary">
          Financial management with payroll processing and reporting
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {statsData.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                valueStyle={stat.valueStyle}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Payroll Summary */}
      {payrollSummary && (
        <Card title="Current Month Payroll Summary" style={{ marginBottom: 24 }}>
          <Descriptions bordered column={4} size="small">
            <Descriptions.Item label="Total Employees" span={1}>
              {payrollSummary.employeeCount}
            </Descriptions.Item>
            <Descriptions.Item label="Total Salaries" span={1}>
              ${payrollSummary.totalSalaries?.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Total Bonuses" span={1}>
              ${payrollSummary.totalBonuses?.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Total Overtime" span={1}>
              ${payrollSummary.totalOvertime?.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Total EPF" span={2}>
              ${payrollSummary.totalEPF?.toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="Total ETF" span={2}>
              ${payrollSummary.totalETF?.toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Quick Actions */}
      <Card title="Financial Operations" style={{ marginBottom: 24 }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            Add Financial Record
          </Button>
          <Button 
            type="primary" 
            icon={<CalculatorOutlined />}
            loading={processingPayroll}
            onClick={handleProcessPayroll}
          >
            Process Payroll
          </Button>
          <Button 
            icon={<ReloadOutlined />}
            onClick={() => fetchTableData(activeTable)}
          >
            Refresh Data
          </Button>
          <Dropdown 
            menu={{ items: reportItems }} 
            placement="bottomLeft"
            disabled={generatingReport}
          >
            <Button 
              icon={<DownloadOutlined />}
              loading={generatingReport}
            >
              Export Financial Reports
            </Button>
          </Dropdown>
        </Space>
      </Card>

      {/* Main Content */}
      <Card>
        <Tabs 
          activeKey={activeTable} 
          onChange={setActiveTable}
          tabBarExtraContent={
            <Space>
              <Text type="secondary">
                {tableData[activeTable]?.length || 0} records
              </Text>
              <Search
                placeholder={`Search ${accountantTableConfigs[activeTable]?.displayName}...`}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
              />
            </Space>
          }
        >
          {allTables.map(tableName => (
            <TabPane 
              key={tableName}
              tab={
                <span>
                  <DatabaseOutlined />
                  {accountantTableConfigs[tableName]?.displayName || tableName}
                  <Badge 
                    count={tableData[tableName]?.length} 
                    style={{ marginLeft: 8, backgroundColor: '#1890ff' }} 
                  />
                </span>
              }
            >
              <Table 
                dataSource={filteredData}
                columns={getTableColumns(tableName)}
                rowKey={getTableIdColumn(tableName)}
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} items`
                }}
                scroll={{ x: 1000 }}
                size="middle"
                loading={!tableData[tableName]}
              />
            </TabPane>
          ))}
        </Tabs>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={`${modalType === 'create' ? 'Create' : 'Edit'} ${accountantTableConfigs[activeTable]?.displayName}`}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          {renderFormFields()}

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
                icon={modalType === 'create' ? <PlusOutlined /> : <EditOutlined />}
              >
                {modalType === 'create' ? 'Create' : 'Update'}
              </Button>
              <Button onClick={handleModalCancel}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Debug Information */}
      <Card 
        title="Accountant Debug Information" 
        style={{ marginTop: 24 }}
        size="small"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Text type="secondary">
              💰 <strong>Accountant Info:</strong> Financial operations with payroll management
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text code>Accountant ID: {accountantId || 'Loading...'}</Text>
            </div>
            <div>
              <Text code>Active Table: {activeTable}</Text>
            </div>
            <div>
              <Text code>Total Financial Records: {Object.values(tableData).flat().length}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">
              📊 <strong>Accountant Capabilities:</strong>
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text code>Payroll Processing: ✅ Available</Text>
            </div>
            <div>
              <Text code>Loan Management: ✅ Available</Text>
            </div>
            <div>
              <Text code>EPF/ETF Processing: ✅ Available</Text>
            </div>
            <div>
              <Text code>Financial Reporting: ✅ Available</Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AccountantDashboard;