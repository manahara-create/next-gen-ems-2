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
  Badge
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ReloadOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { supabase } from './supabase';
import { adminCrud, tableConfigs } from './adminCrud';
import { reportGenerator } from './reportGenerator';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [activeTable, setActiveTable] = useState('employee');
  const [tableData, setTableData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportProgress, setReportProgress] = useState(0);

  // All available tables from schema
  const allTables = Object.keys(tableConfigs);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    console.log('📊 Fetching admin dashboard statistics...');
    setLoading(true);

    try {
      const [
        employees,
        attendance,
        leaves,
        loans,
        feedback,
        departments
      ] = await Promise.all([
        adminCrud.getAll('employee'),
        adminCrud.getAll('attendance'),
        adminCrud.getAll('employeeleave'),
        adminCrud.getAll('loanrequest'),
        adminCrud.getAll('employee_feedback'),
        adminCrud.getAll('departments')
      ]);

      const statsData = {
        totalEmployees: employees.data?.length || 0,
        totalAttendance: attendance.data?.length || 0,
        pendingLeaves: leaves.data?.filter(l => l.leavestatus === 'pending')?.length || 0,
        pendingLoans: loans.data?.filter(l => l.status === 'pending')?.length || 0,
        totalFeedback: feedback.data?.length || 0,
        activeEmployees: employees.data?.filter(e => e.status === 'Active')?.length || 0,
        totalDepartments: departments.data?.length || 0
      };

      setStats(statsData);
      console.log('✅ Dashboard stats loaded:', statsData);

    } catch (error) {
      console.error('💥 Error loading dashboard stats:', error);
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
      message.error(`Failed to load ${tableConfigs[tableName]?.displayName || tableName}`);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchTableData(activeTable);
  }, [activeTable]);

  // Enhanced Report Generation with Progress
  const handleGenerateReport = async (reportType, format = 'both') => {
    console.log(`📈 Generating ${reportType} report in ${format} format...`);
    setGeneratingReport(true);
    setReportProgress(0);

    try {
      let result;
      
      if (reportType === 'summary') {
        // Generate summary report with all tables
        setReportProgress(30);
        result = await reportGenerator.generateSummaryReport(tableData);
      } else {
        // Generate specific table report
        const currentData = tableData[activeTable] || [];
        
        if (currentData.length === 0) {
          message.warning('No data available to generate report');
          return;
        }

        setReportProgress(30);
        result = await reportGenerator.generateComprehensiveReport(
          activeTable, 
          currentData, 
          format
        );
      }

      setReportProgress(100);

      if (result.success) {
        message.success(`Report generated successfully! Check your downloads.`);
        
        // Log the report generation
        await adminCrud.create('reports', {
          name: `${activeTable}_${reportType}_report`,
          type: reportType,
          format: format,
          status: 'completed',
          created_by: 'admin',
          email: 'admin@system',
          report_date: new Date().toISOString()
        });

      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('💥 Report generation failed:', error);
      message.error(`Report generation failed: ${error.message}`);
    } finally {
      setGeneratingReport(false);
      setReportProgress(0);
    }
  };

  // Quick export functions
  const handleQuickExport = async (format) => {
    const currentData = tableData[activeTable] || [];
    
    if (currentData.length === 0) {
      message.warning('No data available to export');
      return;
    }

    setGeneratingReport(true);
    setReportProgress(50);

    try {
      let result;
      
      if (format === 'pdf') {
        result = await reportGenerator.generatePDF(activeTable, currentData, { tableConfigs });
      } else if (format === 'excel') {
        result = await reportGenerator.generateExcel(activeTable, currentData, { tableConfigs });
      }

      setReportProgress(100);

      if (result.success) {
        message.success(`${format.toUpperCase()} exported successfully!`);
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error(`💥 ${format.toUpperCase()} export failed:`, error);
      message.error(`Export failed: ${error.message}`);
    } finally {
      setGeneratingReport(false);
      setReportProgress(0);
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
    
    // Convert date fields to dayjs objects
    const formData = { ...record };
    Object.keys(formData).forEach(key => {
      if (formData[key] && (key.includes('date') || key.includes('Date'))) {
        formData[key] = dayjs(formData[key]);
      }
      // Handle boolean fields for switch
      if (key === 'is_active') {
        formData[key] = Boolean(formData[key]);
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
    console.log(`📝 Submitting ${modalType} form for ${activeTable}:`, values);
    setSubmitting(true);

    try {
      // Convert dayjs objects back to strings
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
        message.success(
          `${tableConfigs[activeTable]?.displayName} ${modalType === 'create' ? 'created' : 'updated'} successfully!`
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
    console.log(`🗑️ Deleting record from ${activeTable}:`, record);
    
    const idColumn = getTableIdColumn(activeTable);
    const recordId = record[idColumn];

    try {
      const result = await adminCrud.delete(activeTable, recordId, idColumn);

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

  // Get ID column for table
  const getTableIdColumn = (tableName) => {
    const idColumns = {
      employee: 'empid',
      attendance: 'attendanceid',
      employeeleave: 'leaveid',
      loanrequest: 'loanrequestid',
      employee_feedback: 'id',
      departments: 'departmentid',
      salary: 'salaryid'
    };
    return idColumns[tableName] || 'id';
  };

  // Get columns for table with actions
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
        if (typeof value === 'string' && value.includes('T')) {
          return dayjs(value).format('DD MMM YYYY HH:mm');
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
        </Space>
      ),
    };

    return [...baseColumns, actionColumn];
  };

  // Render form fields based on table configuration
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
    },
    {
      type: 'divider'
    },
  ];

  // Statistics cards data
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
      prefix: <UserOutlined />,
      valueStyle: { color: '#52c41a' }
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves || 0,
      prefix: <FileTextOutlined />,
      valueStyle: { color: '#faad14' }
    },
    {
      title: 'Total Departments',
      value: stats.totalDepartments || 0,
      prefix: <DatabaseOutlined />,
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
          <Text>Loading admin dashboard...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Admin Dashboard</Title>
        <Text type="secondary">
          Complete system administration with automated report generation
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

      {/* Quick Actions */}
      <Card title="Quick Actions" style={{ marginBottom: 24 }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            Add Record
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
              Export Reports
            </Button>
          </Dropdown>
          <Button 
            icon={<BarChartOutlined />}
            onClick={() => handleGenerateReport('analytics')}
            disabled={generatingReport}
          >
            Analytics Report
          </Button>
        </Space>

        {/* Report Generation Progress */}
        {generatingReport && (
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">Generating report... </Text>
            <Progress 
              percent={reportProgress} 
              size="small" 
              status="active"
              style={{ marginTop: 8 }}
            />
          </div>
        )}
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
                placeholder={`Search ${tableConfigs[activeTable]?.displayName}...`}
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
                  {tableConfigs[tableName]?.displayName || tableName}
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
        title={`${modalType === 'create' ? 'Create' : 'Edit'} ${tableConfigs[activeTable]?.displayName}`}
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
        title="Admin Debug & Report Information" 
        style={{ marginTop: 24 }}
        size="small"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Text type="secondary">
              💡 <strong>Admin Info:</strong> Full CRUD operations with comprehensive logging
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text code>Active Table: {activeTable}</Text>
            </div>
            <div>
              <Text code>Records Loaded: {tableData[activeTable]?.length || 0}</Text>
            </div>
            <div>
              <Text code>Search Filter: {searchText || 'None'}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">
              📊 <strong>Report Capabilities:</strong>
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text code>PDF Generation: ✅ Available</Text>
            </div>
            <div>
              <Text code>Excel Export: ✅ Available</Text>
            </div>
            <div>
              <Text code>Summary Reports: ✅ Available</Text>
            </div>
            <div>
              <Text code>Auto Download: ✅ Enabled</Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AdminDashboard;