import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Progress,
  Table,
  Tag,
  Button,
  Space,
  Divider,
  Alert,
  Spin,
  Tabs,
  List,
  Timeline,
  Badge,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  CalendarOutlined,
  FileTextOutlined,
  MessageOutlined,
  CreditCardOutlined,
  EyeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { supabase } from './supabase';
import { employeeCrud } from './employeeCrud';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const EmployeeDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [loanData, setLoanData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [stats, setStats] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Fetch all employee data
  const fetchEmployeeData = async () => {
    console.log('🔍 Fetching employee dashboard data...');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get employee basic data
      const employeeResult = await employeeCrud.read(
        'employee',
        null,
        user.email,
        'empid, full_name, email, role, department, basicsalary, kpiscore, satisfaction_score, status'
      );

      if (employeeResult.success && employeeResult.data.length > 0) {
        const empData = employeeResult.data[0];
        setEmployeeData(empData);

        // Fetch all related data using dual strategy
        await Promise.all([
          fetchAttendanceData(empData.empid, empData.email),
          fetchLeaveData(empData.empid, empData.email),
          fetchLoanData(empData.empid, empData.email),
          fetchFeedbackData(empData.empid, empData.email),
          calculateStats(empData)
        ]);
      }

    } catch (error) {
      console.error('💥 Error fetching dashboard data:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance data
  const fetchAttendanceData = async (empid, email) => {
    const result = await employeeCrud.readAll(
      'attendance',
      empid,
      email,
      'attendanceid, date, intime, outtime, status, hours_worked'
    );
    if (result.success) {
      setAttendanceData(result.data.slice(0, 10)); // Last 10 records
    }
  };

  // Fetch leave data
  const fetchLeaveData = async (empid, email) => {
    const result = await employeeCrud.readAll(
      'employeeleave',
      empid,
      email,
      'leaveid, leavetype, leavefromdate, leavetodate, duration, leavestatus, applied_date'
    );
    if (result.success) {
      setLeaveData(result.data);
    }
  };

  // Fetch loan data
  const fetchLoanData = async (empid, email) => {
    const result = await employeeCrud.readAll(
      'loanrequest',
      empid,
      email,
      'loanrequestid, loantype, amount, duration, status, date, monthly_installment'
    );
    if (result.success) {
      setLoanData(result.data);
    }
  };

  // Fetch feedback data
  const fetchFeedbackData = async (empid, email) => {
    const result = await employeeCrud.readAll(
      'employee_feedback',
      empid,
      email,
      'id, feedback_type, subject, status, submitted_at, rating'
    );
    if (result.success) {
      setFeedbackData(result.data.slice(0, 5)); // Last 5 feedback
    }
  };

  // Calculate statistics
  const calculateStats = (empData) => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    
    const monthlyAttendance = attendanceData.filter(att => {
      const attDate = new Date(att.date);
      return attDate.getMonth() + 1 === currentMonth;
    }).length;

    const pendingLeaves = leaveData.filter(leave => leave.leavestatus === 'pending').length;
    const approvedLoans = loanData.filter(loan => loan.status === 'approved').length;
    const avgFeedbackRating = feedbackData.length > 0 
      ? feedbackData.reduce((sum, fb) => sum + (fb.rating || 0), 0) / feedbackData.length 
      : 0;

    setStats({
      monthlyAttendance,
      pendingLeaves,
      approvedLoans,
      avgFeedbackRating: avgFeedbackRating.toFixed(1),
      kpiScore: empData.kpiscore || 0,
      satisfactionScore: empData.satisfaction_score || 0
    });
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  // Handle modal operations
  const showModal = (type) => {
    setModalType(type);
    setModalVisible(true);
    form.resetFields();
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    setModalType('');
    form.resetFields();
  };

  // Handle form submissions
  const handleFormSubmit = async (values) => {
    console.log(`📝 Submitting ${modalType} form:`, values);
    setSubmitting(true);

    try {
      const commonData = {
        email: employeeData?.email,
        empid: employeeData?.empid
      };

      let result;

      switch (modalType) {
        case 'leave':
          result = await employeeCrud.create('employeeleave', {
            ...commonData,
            leavetype: values.leavetype,
            leavefromdate: values.dateRange[0].format('YYYY-MM-DD'),
            leavetodate: values.dateRange[1].format('YYYY-MM-DD'),
            duration: values.duration,
            leavereason: values.reason,
            leavestatus: 'pending',
            applied_date: new Date().toISOString()
          });
          break;

        case 'loan':
          result = await employeeCrud.create('loanrequest', {
            ...commonData,
            loantype: values.loantype,
            amount: values.amount,
            duration: values.duration,
            status: 'pending',
            date: new Date().toISOString(),
            monthly_installment: values.amount / values.duration
          });
          break;

        case 'feedback':
          result = await employeeCrud.create('employee_feedback', {
            ...commonData,
            feedback_type: values.feedback_type,
            subject: values.subject,
            message: values.message,
            rating: values.rating,
            status: 'submitted',
            submitted_at: new Date().toISOString()
          });
          break;

        case 'attendance':
          // Mark attendance for today
          result = await employeeCrud.create('attendance', {
            ...commonData,
            date: new Date().toISOString(),
            intime: new Date().toTimeString().split(' ')[0],
            status: 'present',
            hours_worked: 8
          });
          break;
      }

      if (result.success) {
        message.success(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} submitted successfully!`);
        handleModalCancel();
        await fetchEmployeeData(); // Refresh data
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error(`💥 ${modalType} submission failed:`, error);
      message.error(`Failed to submit ${modalType}: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Statistics cards data
  const statsData = [
    {
      title: 'Monthly Attendance',
      value: stats.monthlyAttendance || 0,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: '#52c41a' },
      suffix: '/22 days'
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves || 0,
      prefix: <CalendarOutlined />,
      valueStyle: { color: '#faad14' }
    },
    {
      title: 'KPI Score',
      value: stats.kpiScore || 0,
      prefix: <RiseOutlined />,
      valueStyle: { color: '#1890ff' },
      suffix: '/100'
    },
    {
      title: 'Satisfaction',
      value: stats.satisfactionScore || 0,
      prefix: <UserOutlined />,
      valueStyle: { color: '#722ed1' },
      suffix: '/100'
    }
  ];

  // Attendance columns
  const attendanceColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'In Time',
      dataIndex: 'intime',
      key: 'intime'
    },
    {
      title: 'Out Time',
      dataIndex: 'outtime',
      key: 'outtime'
    },
    {
      title: 'Hours',
      dataIndex: 'hours_worked',
      key: 'hours_worked',
      render: (hours) => `${hours}h`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'present' ? 'green' : 'red'}>
          {status?.toUpperCase()}
        </Tag>
      )
    }
  ];

  // Leave columns
  const leaveColumns = [
    {
      title: 'Type',
      dataIndex: 'leavetype',
      key: 'leavetype'
    },
    {
      title: 'From',
      dataIndex: 'leavefromdate',
      key: 'leavefromdate',
      render: (date) => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'To',
      dataIndex: 'leavetodate',
      key: 'leavetodate',
      render: (date) => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'Days',
      dataIndex: 'duration',
      key: 'duration'
    },
    {
      title: 'Status',
      dataIndex: 'leavestatus',
      key: 'leavestatus',
      render: (status) => {
        const color = status === 'approved' ? 'green' : 
                     status === 'rejected' ? 'red' : 'orange';
        return <Tag color={color}>{status?.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Applied On',
      dataIndex: 'applied_date',
      key: 'applied_date',
      render: (date) => dayjs(date).format('DD MMM YYYY')
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading your dashboard...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Employee Dashboard</Title>
        <Text type="secondary">
          Welcome back, {employeeData?.full_name}! Here's your overview for today.
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
                suffix={stat.suffix}
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
            icon={<CalendarOutlined />}
            onClick={() => showModal('leave')}
          >
            Apply Leave
          </Button>
          <Button 
            type="primary" 
            icon={<CreditCardOutlined />}
            onClick={() => showModal('loan')}
          >
            Request Loan
          </Button>
          <Button 
            type="primary" 
            icon={<MessageOutlined />}
            onClick={() => showModal('feedback')}
          >
            Submit Feedback
          </Button>
          <Button 
            type="default" 
            icon={<CheckCircleOutlined />}
            onClick={() => showModal('attendance')}
          >
            Mark Attendance
          </Button>
        </Space>
      </Card>

      {/* Main Content Tabs */}
      <Card>
        <Tabs defaultActiveKey="attendance">
          {/* Attendance Tab */}
          <TabPane tab={<span><CalendarOutlined /> Attendance</span>} key="attendance">
            <Table 
              dataSource={attendanceData} 
              columns={attendanceColumns}
              pagination={{ pageSize: 5 }}
              size="middle"
            />
          </TabPane>

          {/* Leave Tab */}
          <TabPane tab={<span><FileTextOutlined /> Leave</span>} key="leave">
            <Table 
              dataSource={leaveData} 
              columns={leaveColumns}
              pagination={{ pageSize: 5 }}
              size="middle"
            />
          </TabPane>

          {/* Loans Tab */}
          <TabPane tab={<span><CreditCardOutlined /> Loans</span>} key="loans">
            <List
              dataSource={loanData}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={`${item.loantype} - $${item.amount}`}
                    description={
                      <Space direction="vertical" size="small">
                        <Text>Duration: {item.duration} months</Text>
                        <Text>Monthly: ${item.monthly_installment}</Text>
                        <Tag color={item.status === 'approved' ? 'green' : 'orange'}>
                          {item.status}
                        </Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>

          {/* Feedback Tab */}
          <TabPane tab={<span><MessageOutlined /> Feedback</span>} key="feedback">
            <List
              dataSource={feedbackData}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.subject}
                    description={
                      <Space direction="vertical" size="small">
                        <Text>Type: {item.feedback_type}</Text>
                        <Text>Rating: {'⭐'.repeat(item.rating || 0)}</Text>
                        <Tag color={item.status === 'responded' ? 'green' : 'blue'}>
                          {item.status}
                        </Tag>
                        <Text type="secondary">
                          Submitted: {dayjs(item.submitted_at).format('DD MMM YYYY')}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modals for different actions */}
      <Modal
        title={`Apply for ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`}
        open={modalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
        >
          {modalType === 'leave' && (
            <>
              <Form.Item
                name="leavetype"
                label="Leave Type"
                rules={[{ required: true, message: 'Please select leave type' }]}
              >
                <Select placeholder="Select leave type">
                  <Option value="sick">Sick Leave</Option>
                  <Option value="casual">Casual Leave</Option>
                  <Option value="annual">Annual Leave</Option>
                  <Option value="emergency">Emergency Leave</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="dateRange"
                label="Date Range"
                rules={[{ required: true, message: 'Please select date range' }]}
              >
                <DatePicker.RangePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="duration"
                label="Duration (Days)"
              >
                <Input type="number" placeholder="Enter duration in days" />
              </Form.Item>

              <Form.Item
                name="reason"
                label="Reason"
                rules={[{ required: true, message: 'Please enter reason' }]}
              >
                <TextArea rows={4} placeholder="Enter reason for leave" />
              </Form.Item>
            </>
          )}

          {modalType === 'loan' && (
            <>
              <Form.Item
                name="loantype"
                label="Loan Type"
                rules={[{ required: true, message: 'Please select loan type' }]}
              >
                <Select placeholder="Select loan type">
                  <Option value="personal">Personal Loan</Option>
                  <Option value="emergency">Emergency Loan</Option>
                  <Option value="housing">Housing Loan</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="amount"
                label="Loan Amount"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <Input type="number" prefix="$" placeholder="Enter loan amount" />
              </Form.Item>

              <Form.Item
                name="duration"
                label="Duration (Months)"
                rules={[{ required: true, message: 'Please enter duration' }]}
              >
                <Input type="number" placeholder="Enter duration in months" />
              </Form.Item>
            </>
          )}

          {modalType === 'feedback' && (
            <>
              <Form.Item
                name="feedback_type"
                label="Feedback Type"
                rules={[{ required: true, message: 'Please select feedback type' }]}
              >
                <Select placeholder="Select feedback type">
                  <Option value="general">General Feedback</Option>
                  <Option value="suggestion">Suggestion</Option>
                  <Option value="complaint">Complaint</Option>
                  <Option value="appreciation">Appreciation</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="subject"
                label="Subject"
                rules={[{ required: true, message: 'Please enter subject' }]}
              >
                <Input placeholder="Enter feedback subject" />
              </Form.Item>

              <Form.Item
                name="rating"
                label="Rating"
                rules={[{ required: true, message: 'Please select rating' }]}
              >
                <Select placeholder="Select rating">
                  <Option value={1}>⭐</Option>
                  <Option value={2}>⭐⭐</Option>
                  <Option value={3}>⭐⭐⭐</Option>
                  <Option value={4}>⭐⭐⭐⭐</Option>
                  <Option value={5}>⭐⭐⭐⭐⭐</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="message"
                label="Message"
                rules={[{ required: true, message: 'Please enter message' }]}
              >
                <TextArea rows={4} placeholder="Enter your feedback message" />
              </Form.Item>
            </>
          )}

          {modalType === 'attendance' && (
            <Alert
              message="Mark Today's Attendance"
              description="This will mark your attendance for today with the current time."
              type="info"
              showIcon
            />
          )}

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting}
              >
                Submit
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
        title="Debug Information" 
        style={{ marginTop: 24 }}
        size="small"
      >
        <Text type="secondary">
          💡 <strong>Developer Info:</strong> Check browser console for detailed CRUD operations logging
        </Text>
        <div style={{ marginTop: 8 }}>
          <Text code>Employee ID: {employeeData?.empid}</Text>
        </div>
        <div>
          <Text code>Email: {employeeData?.email}</Text>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeDashboard;