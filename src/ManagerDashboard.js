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
  Avatar
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
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
  TrophyOutlined
} from '@ant-design/icons';
import { supabase } from './supabase';
import { managerCrud, managerTableConfigs } from './managerCrud';
import { reportGenerator } from './reportGenerator';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

const ManagerDashboard = () => {
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
  const [managerId, setManagerId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  // All available tables from schema
  const allTables = Object.keys(managerTableConfigs);

  // Get manager ID from current user
  useEffect(() => {
    const getManagerInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: managerData } = await supabase
          .from('employee')
          .select('empid')
          .eq('email', user.email)
          .single();
        
        if (managerData) {
          setManagerId(managerData.empid);
        }
      }
    };
    getManagerInfo();
  }, []);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    if (!managerId) return;
    
    console.log('📊 Fetching manager dashboard statistics...');
    setLoading(true);

    try {
      const [
        teamMembers,
        attendance,
        leaves,
        tasks,
        performance
      ] = await Promise.all([
        managerCrud.getTeamMembers(managerId),
        managerCrud.getAll('attendance', '*', {}, managerId),
        managerCrud.getAll('employeeleave', '*', {}, managerId),
        managerCrud.getAll('tasks', '*', {}, managerId),
        managerCrud.getAll('performance_rating', '*', {}, managerId)
      ]);

      const statsData = {
        totalTeamMembers: teamMembers.data?.length || 0,
        pendingLeaves: leaves.data?.filter(l => l.leavestatus === 'pending')?.length || 0,
        pendingTasks: tasks.data?.filter(t => t.status === 'pending')?.length || 0,
        avgPerformance: performance.data?.reduce((acc, curr) => acc + (curr.rating || 0), 0) / (performance.data?.length || 1) || 0,
        completedTasks: tasks.data?.filter(t => t.status === 'completed')?.length || 0,
        todayAttendance: attendance.data?.filter(a => 
          dayjs(a.date).isSame(dayjs(), 'day') && a.status === 'present'
        )?.length || 0
      };

      setStats(statsData);
      setTeamMembers(teamMembers.data || []);
      console.log('✅ Manager dashboard stats loaded:', statsData);

    } catch (error) {
      console.error('💥 Error loading manager dashboard stats:', error);
      message.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data for active table
  const fetchTableData = async (tableName) => {
    if (!managerId) return;
    
    console.log(`📋 Fetching data for table: ${tableName}`);
    
    try {
      const result = await managerCrud.getAll(tableName, '*', {}, managerId);
      
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
      message.error(`Failed to load ${managerTableConfigs[tableName]?.displayName || tableName}`);
    }
  };

  useEffect(() => {
    if (managerId) {
      fetchDashboardStats();
      fetchTableData(activeTable);
    }
  }, [managerId, activeTable]);

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
          { tableConfigs: managerTableConfigs }
        );
      }

      if (result.success) {
        message.success(`Excel report exported successfully!`);
        
        // Log the operation
        await managerCrud.create('manager_operations', {
          operation: 'EXPORT_REPORT',
          record_id: null,
          manager_id: managerId,
          details: JSON.stringify({
            table: activeTable,
            format: format,
            record_count: currentData.length
          }),
          email: 'manager@system',
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
    if (!managerId) return;
    
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
        result = await managerCrud.create(activeTable, processedValues, managerId);
      } else {
        const idColumn = getTableIdColumn(activeTable);
        const recordId = editingRecord[idColumn];
        result = await managerCrud.update(activeTable, recordId, processedValues, managerId, idColumn);
      }

      if (result.success) {
        message.success(
          `${managerTableConfigs[activeTable]?.displayName} ${modalType === 'create' ? 'created' : 'updated'} successfully!`
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
    if (!managerId) return;
    
    console.log(`🗑️ Deleting record from ${activeTable}:`, record);
    
    const idColumn = getTableIdColumn(activeTable);
    const recordId = record[idColumn];

    try {
      const result = await managerCrud.delete(activeTable, recordId, managerId, idColumn);

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

  // Handle leave approval
  const handleProcessLeave = async (leaveId, status, remarks = '') => {
    if (!managerId) return;
    
    try {
      const result = await managerCrud.processLeaveRequest(leaveId, status, remarks, managerId);
      
      if (result.success) {
        message.success(`Leave request ${status} successfully!`);
        await fetchTableData('employeeleave');
        await fetchDashboardStats();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('💥 Process leave failed:', error);
      message.error(`Failed to process leave: ${error.message}`);
    }
  };

  // Get ID column for table
  const getTableIdColumn = (tableName) => {
    const idColumns = {
      employee: 'empid',
      attendance: 'attendanceid',
      employeeleave: 'leaveid',
      tasks: 'id',
      performance_rating: 'ratingid'
    };
    return idColumns[tableName] || 'id';
  };

  // Get columns for table with actions
  const getTableColumns = (tableName) => {
    const config = managerTableConfigs[tableName];
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
          
          {/* Special actions for leave requests */}
          {tableName === 'employeeleave' && record.leavestatus === 'pending' && (
            <>
              <Tooltip title="Approve">
                <Button 
                  type="link" 
                  style={{ color: '#52c41a' }}
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleProcessLeave(record.leaveid, 'approved', 'Approved by manager')}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button 
                  type="link" 
                  danger 
                  icon={<DeleteOutlined />}
                  onClick={() => handleProcessLeave(record.leaveid, 'rejected', 'Rejected by manager')}
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
    const config = managerTableConfigs[activeTable];
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
      title: 'Team Members',
      value: stats.totalTeamMembers || 0,
      prefix: <TeamOutlined />,
      valueStyle: { color: '#1890ff' }
    },
    {
      title: "Today's Attendance",
      value: stats.todayAttendance || 0,
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
          <Text>Loading manager dashboard...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Manager Dashboard</Title>
        <Text type="secondary">
          Team management with performance tracking and reporting
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

      {/* Quick Team Overview */}
      <Card title="Team Overview" style={{ marginBottom: 24 }}>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={teamMembers.slice(0, 4)}
          renderItem={member => (
            <List.Item>
              <Card size="small">
                <div style={{ textAlign: 'center' }}>
                  <Avatar size={64} icon={<UserOutlined />} />
                  <div style={{ marginTop: 8 }}>
                    <Text strong>{member.full_name}</Text>
                  </div>
                  <div>
                    <Text type="secondary">{member.role}</Text>
                  </div>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </Card>

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
                placeholder={`Search ${managerTableConfigs[activeTable]?.displayName}...`}
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
                  {managerTableConfigs[tableName]?.displayName || tableName}
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
        title={`${modalType === 'create' ? 'Create' : 'Edit'} ${managerTableConfigs[activeTable]?.displayName}`}
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
        title="Manager Debug Information" 
        style={{ marginTop: 24 }}
        size="small"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Text type="secondary">
              💡 <strong>Manager Info:</strong> Team-focused operations with performance tracking
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text code>Manager ID: {managerId || 'Loading...'}</Text>
            </div>
            <div>
              <Text code>Active Table: {activeTable}</Text>
            </div>
            <div>
              <Text code>Team Size: {teamMembers.length}</Text>
            </div>
          </Col>
          <Col span={12}>
            <Text type="secondary">
              📊 <strong>Manager Capabilities:</strong>
            </Text>
            <div style={{ marginTop: 8 }}>
              <Text code>Leave Approval: ✅ Available</Text>
            </div>
            <div>
              <Text code>Team Performance: ✅ Tracked</Text>
            </div>
            <div>
              <Text code>Excel Export: ✅ Available</Text>
            </div>
            <div>
              <Text code>Task Management: ✅ Enabled</Text>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ManagerDashboard;