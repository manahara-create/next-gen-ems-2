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
  Descriptions,
  Timeline,
  Radio
} from 'antd';
import {
  CrownOutlined,
  TeamOutlined,
  DollarOutlined,
  TrophyOutlined,
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
  FundOutlined,
  AuditOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { supabase } from './supabase';
import { ceoCrud, ceoTableConfigs } from './ceoCrud';
import { reportGenerator } from './reportGenerator';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

const CEODashboard = () => {
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
  const [ceoId, setCeoId] = useState(null);
  const [companyOverview, setCompanyOverview] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [strategicModalVisible, setStrategicModalVisible] = useState(false);

  // All available tables from schema
  const allTables = Object.keys(ceoTableConfigs);

  // Get CEO ID from current user
  useEffect(() => {
    const getCeoInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: ceoData } = await supabase
          .from('employee')
          .select('empid')
          .eq('email', user.email)
          .single();
        
        if (ceoData) {
          setCeoId(ceoData.empid);
        }
      }
    };
    getCeoInfo();
  }, []);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    console.log('📊 Fetching CEO dashboard statistics...');
    setLoading(true);

    try {
      const [
        overviewResult,
        metricsResult,
        employeeData,
        financialData,
        auditData
      ] = await Promise.all([
        ceoCrud.getCompanyOverview(),
        ceoCrud.getPerformanceMetrics(),
        ceoCrud.getAll('employee'),
        ceoCrud.getAll('financialreports'),
        ceoCrud.getAll('audit_logs')
      ]);

      const statsData = {
        totalEmployees: employeeData.data?.length || 0,
        totalRevenue: financialData.data?.reduce((sum, item) => sum + (item.totalrevenue || 0), 0) || 0,
        netProfit: financialData.data?.slice(-1)[0]?.netprofit || 0,
        avgPerformance: metricsResult.success ? metricsResult.data.avgKPI : 0,
        recentActivities: auditData.data?.slice(-10) || [],
        companyOverview: overviewResult.success ? overviewResult.data : null,
        performanceMetrics: metricsResult.success ? metricsResult.data : null
      };

      setStats(statsData);
      setCompanyOverview(overviewResult.success ? overviewResult.data : null);
      setPerformanceMetrics(metricsResult.success ? metricsResult.data : null);
      console.log('✅ CEO dashboard stats loaded:', statsData);

    } catch (error) {
      console.error('💥 Error loading CEO dashboard stats:', error);
      message.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for active table
  const fetchTableData = async (tableName) => {
    console.log(`📋 Fetching data for table: ${tableName}`);
    
    try {
      const result = await ceoCrud.getAll(tableName);
      
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
      message.error(`Failed to load ${ceoTableConfigs[tableName]?.displayName || tableName}`);
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
          { tableConfigs: ceoTableConfigs }
        );
      }

      if (result.success) {
        message.success(`Excel report exported successfully!`);
        
        // Log the operation
        await ceoCrud.create('md_operations', {
          operation: 'EXPORT_REPORT',
          record_id: null,
          md_id: ceoId,
          details: JSON.stringify({
            table: activeTable,
            format: format,
            record_count: currentData.length
          }),
          email: 'ceo@system',
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
    if (!ceoId) return;
    
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
        result = await ceoCrud.create(activeTable, processedValues, ceoId);
      } else {
        const idColumn = getTableIdColumn(activeTable);
        const recordId = editingRecord[idColumn];
        result = await ceoCrud.update(activeTable, recordId, processedValues, ceoId, idColumn);
      }

      if (result.success) {
        message.success(
          `${ceoTableConfigs[activeTable]?.displayName} ${modalType === 'create' ? 'created' : 'updated'} successfully!`
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
    if (!ceoId) return;
    
    console.log(`🗑️ Deleting record from ${activeTable}:`, record);
    
    const idColumn = getTableIdColumn(activeTable);
    const recordId = record[idColumn];

    try {
      const result = await ceoCrud.delete(activeTable, recordId, ceoId, idColumn);

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

  // Handle strategic decision approval
  const handleStrategicApproval = async (decisionData) => {
    if (!ceoId) return;
    
    try {
      const result = await ceoCrud.approveStrategicDecision(decisionData, ceoId);
      
      if (result.success) {
        message.success('Strategic decision approved successfully!');
        setStrategicModalVisible(false);
        await fetchDashboardStats();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('💥 Strategic approval failed:', error);
      message.error(`Strategic approval failed: ${error.message}`);
    }
  };

  // Get ID column for table
  const getTableIdColumn = (tableName) => {
    const idColumns = {
      employee: 'empid',
      departments: 'departmentid',
      financialreports: 'reportid',
      strategic_goals: 'goal_id',
      audit_logs: 'logid',
      reports: 'reportid'
    };
    return idColumns[tableName] || 'id';
  };

  // Get columns for table with actions
  const getTableColumns = (tableName) => {
    const config = ceoTableConfigs[tableName];
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
        if (typeof value === 'number' && (col.includes('amount') || col.includes('salary') || col.includes('revenue') || col.includes('profit'))) {
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
        </Space>
      ),
    };

    return [...baseColumns, actionColumn];
  };

  // Render form fields based on table configuration
  const renderFormFields = () => {
    const config = ceoTableConfigs[activeTable];
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
      title: 'Total Employees',
      value: stats.totalEmployees || 0,
      prefix: <TeamOutlined />,
      valueStyle: { color: '#1890ff' }
    },
    {
      title: 'Total Revenue',
      value: stats.totalRevenue ? `$${(stats.totalRevenue / 1000000).toFixed(1)}M` : '$0',
      prefix: <DollarOutlined />,
      valueStyle: { color: '#52c41a' }
    },
    {
      title: 'Net Profit',
      value: stats.netProfit ? `$${(stats.netProfit / 1000).toFixed(1)}k` : '$0',
      prefix: <FundOutlined />,
      valueStyle: { color: '#faad14' }
    },
    {
      title: 'Avg Performance',
      value: stats.avgPerformance ? stats.avgPerformance.toFixed(1) : 0,
      prefix: <TrophyOutlined />,
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
          <Text>Loading CEO dashboard...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>CEO Dashboard</Title>
        <Text type="secondary">
          Executive overview with strategic decision-making capabilities
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

      {/* Company Overview & Performance */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="Company Overview" size="small">
            {companyOverview ? (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Total Departments">
                  {companyOverview.totalDepartments}
                </Descriptions.Item>
                <Descriptions.Item label="Active Employees">
                  {companyOverview.activeEmployees}
                </Descriptions.Item>
                <Descriptions.Item label="Recent Financial Reports">
                  {companyOverview.recentFinancialReports.length}
                </Descriptions.Item>
                <Descriptions.Item label="Strategic Goals">
                  {companyOverview.strategicGoals.length}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Spin size="small" />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Performance Metrics" size="small">
            {performanceMetrics ? (
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Attendance Rate">
                  {performanceMetrics.attendanceRate.toFixed(1)}%
                </Descriptions.Item>
                <Descriptions.Item label="Avg Feedback Rating">
                  {performanceMetrics.avgFeedbackRating.toFixed(1)}/5
                </Descriptions.Item>
                <Descriptions.Item label="Recent Profit">
                  ${performanceMetrics.recentProfit?.toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="Total Revenue">
                  ${performanceMetrics.totalRevenue?.toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Spin size="small" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Executive Operations" style={{ marginBottom: 24 }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={showCreateModal}
          >
            Add Strategic Record
          </Button>
          <Button 
            type="primary" 
            icon={<SafetyCertificateOutlined />}
            onClick={() => setStrategicModalVisible(true)}
          >
            Make Strategic Decision
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
              Export Executive Reports
            </Button>
          </Dropdown>
        </Space>
      </Card>

      {/* Recent Activities */}
      <Card title="Recent Executive Activities" style={{ marginBottom: 24 }} size="small">
        <Timeline>
          {stats.recentActivities?.slice(0, 5).map((activity, index) => (
            <Timeline.Item key={index} color="blue">
              <Text strong>{activity.action}</Text> on {activity.table_name}
              <br />
              <Text type="secondary">
                {dayjs(activity.created_at).format('DD MMM YYYY HH:mm')} by {activity.email}
              </Text>
            </Timeline.Item>
          ))}
        </Timeline>
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
                placeholder={`Search ${ceoTableConfigs[activeTable]?.displayName}...`}
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
                  {ceoTableConfigs[tableName]?.displayName || tableName}
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
        title={`${modalType === 'create' ? 'Create' : 'Edit'} ${ceoTableConfigs[activeTable]?.displayName}`}
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

      {/* Strategic Decision Modal */}
      <Modal
        title="Make Strategic Decision"
        open={strategicModalVisible}
        onCancel={() => setStrategicModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          onFinish={(values) => handleStrategicApproval({
            decisionId: `decision_${Date.now()}`,
            type: values.decisionType,
            description: values.description,
            impact: values.impact,
            priority: values.priority
          })}
        >
          <Form.Item
            name="decisionType"
            label="Decision Type"
            rules={[{ required: true, message: 'Please select decision type' }]}
          >
            <Select placeholder="Select decision type">
              <Option value="financial">Financial Investment</Option>
              <Option value="hr">HR Strategy</Option>
              <Option value="operational">Operational Change</Option>
              <Option value="technology">Technology Adoption</Option>
              <Option value="expansion">Business Expansion</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority Level"
            rules={[{ required: true, message: 'Please select priority' }]}
          >
            <Radio.Group>
              <Radio value="low">Low</Radio>
              <Radio value="medium">Medium</Radio>
              <Radio value="high">High</Radio>
              <Radio value="critical">Critical</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="impact"
            label="Expected Impact"
            rules={[{ required: true, message: 'Please describe expected impact' }]}
          >
            <TextArea rows={3} placeholder="Describe the expected business impact..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Decision Description"
            rules={[{ required: true, message: 'Please provide decision description' }]}
          >
            <TextArea rows={4} placeholder="Provide detailed description of the strategic decision..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SafetyCertificateOutlined />}>
                Approve Strategic Decision
              </Button>
              <Button onClick={() => setStrategicModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Debug Information */}
      <Card 
        title="CEO Debug Information" 
        style={{ marginTop: 24 }}
        size="small"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Text type="secondary">
              👑 <strong>CEO Info:</strong> Executive overview with strategic decision-making
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text code>CEO ID: {ceoId || 'Loading...'}</Text>
            </div>
            <div>
              <Text code>Active Table: {activeTable}</Text>
            </div>
            <div>
              <Text code>Total Records: {Object.values(tableData).flat().length}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">
              📊 <strong>CEO Capabilities:</strong>
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text code>Strategic Decisions: ✅ Available</Text>
            </div>
            <div>
              <Text code>Company Overview: ✅ Available</Text>
            </div>
            <div>
              <Text code>Performance Metrics: ✅ Available</Text>
            </div>
            <div>
              <Text code>Executive Reporting: ✅ Available</Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CEODashboard;