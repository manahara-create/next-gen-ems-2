import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Typography,
  Row,
  Col,
  Avatar,
  Divider,
  message,
  Spin,
  Alert,
  Tag,
  Space,
  Descriptions,
  Switch
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TeamOutlined,
  SaveOutlined,
  EditOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { supabase } from './supabase';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Update employee function with retry logic
export const updateEmployee = async (empid, email, updates) => {
  console.log('🎬 ===== UPDATE EMPLOYEE PROCESS STARTED =====');
  console.log('📋 Update details:', {
    empid,
    email,
    updates,
    timestamp: new Date().toISOString()
  });

  try {
    // First attempt: Try with empid
    console.log('🔄 Attempt 1: Updating with empid...');
    let query = supabase
      .from('employee')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      });

    if (empid) {
      query = query.eq('empid', empid);
    } else {
      console.log('⚠️ No empid provided, trying with email...');
      throw new Error('No empid provided');
    }

    const { data, error } = await query.select();

    if (error) {
      console.error('❌ Attempt 1 failed with empid:', error);
      throw error;
    }

    console.log('✅ Update successful with empid');
    console.log('📦 Updated data:', data);
    return { success: true, data };

  } catch (firstError) {
    console.log('🔄 Attempt 2: Trying update with email...');
    
    try {
      if (!email) {
        throw new Error('No email provided for second attempt');
      }

      const { data, error } = await supabase
        .from('employee')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('email', email)
        .select();

      if (error) {
        console.error('❌ Attempt 2 failed with email:', error);
        throw error;
      }

      console.log('✅ Update successful with email');
      console.log('📦 Updated data:', data);
      return { success: true, data };

    } catch (secondError) {
      console.error('💥 Both update attempts failed:');
      console.error('   First error:', firstError.message);
      console.error('   Second error:', secondError.message);
      
      return { 
        success: false, 
        error: `Update failed: ${firstError.message}. Fallback also failed: ${secondError.message}` 
      };
    }
  } finally {
    console.log('🏁 ===== UPDATE EMPLOYEE PROCESS COMPLETED =====');
  }
};

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [error, setError] = useState('');

  // Departments data
  const departments = [
    'AUTOMOTIVE',
    'ENGINEERING',
    'SALES',
    'MARKETING',
    'HR',
    'FINANCE',
    'IT',
    'OPERATIONS'
  ];

  // Roles data
  const roles = [
    'admin',
    'manager',
    'ceo',
    'accountant',
    'employee',
    'hr'
  ];

  // Genders data
  const genders = [
    'Male',
    'Female',
    'Other'
  ];

  // Fetch employee data
  const fetchEmployeeData = async () => {
    console.log('🔍 Fetching employee data...');
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 Current auth user:', user);

      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Try to get employee data by auth_user_id first
      let { data: employee, error } = await supabase
        .from('employee')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      console.log('📊 Employee data by auth_user_id:', employee);

      if (error) {
        console.log('🔄 Trying to fetch by email...');
        // If not found by auth_user_id, try by email
        const { data: employeeByEmail, error: emailError } = await supabase
          .from('employee')
          .select('*')
          .eq('email', user.email)
          .single();

        if (emailError) {
          throw emailError;
        }

        employee = employeeByEmail;
        console.log('✅ Employee data found by email:', employee);
      }

      if (employee) {
        setEmployeeData(employee);
        form.setFieldsValue({
          ...employee,
          dob: employee.dob ? dayjs(employee.dob) : null
        });
      } else {
        throw new Error('Employee profile not found');
      }

    } catch (error) {
      console.error('💥 Error fetching employee data:', error);
      setError(error.message);
      message.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  // Handle form submission
  const handleUpdateProfile = async (values) => {
    console.log('📝 Form submission started with values:', values);
    setUpdating(true);
    setError('');

    try {
      const updates = {
        full_name: values.full_name,
        phone: values.phone,
        role: values.role,
        department: values.department,
        gender: values.gender,
        empaddress: values.empaddress,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
        tenure: values.tenure,
        basicsalary: values.basicsalary || 0,
        kpiscore: values.kpiscore || 0,
        satisfaction_score: values.satisfaction_score || 0
      };

      console.log('🔄 Preparing updates:', updates);

      const result = await updateEmployee(
        employeeData?.empid,
        employeeData?.email,
        updates
      );

      if (result.success) {
        console.log('✅ Profile update successful');
        setEmployeeData(result.data[0]);
        setEditMode(false);
        message.success('Profile updated successfully!');
        
        // Refresh data
        await fetchEmployeeData();
      } else {
        console.error('❌ Profile update failed:', result.error);
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('💥 Update process failed:', error);
      setError(error.message);
      message.error(`Update failed: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    form.setFieldsValue({
      ...employeeData,
      dob: employeeData?.dob ? dayjs(employeeData.dob) : null
    });
    setEditMode(false);
    setError('');
    console.log('❌ Edit mode cancelled');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (employeeData?.full_name) {
      return employeeData.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    return employeeData?.email?.[0]?.toUpperCase() || 'U';
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'pending': return 'orange';
      default: return 'blue';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Loading your profile...</Text>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Row gutter={24} align="middle">
              <Col>
                <Avatar 
                  size={80} 
                  style={{ 
                    backgroundColor: '#1890ff',
                    fontSize: '24px',
                    fontWeight: 'bold'
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </Col>
              <Col flex={1}>
                <Title level={2} style={{ margin: 0 }}>
                  {employeeData?.full_name || 'No Name'}
                </Title>
                <Space size="middle" style={{ marginTop: 8 }}>
                  <Tag color={getStatusColor(employeeData?.status)}>
                    {employeeData?.status || 'Unknown'}
                  </Tag>
                  <Text type="secondary">{employeeData?.role}</Text>
                  <Text type="secondary">•</Text>
                  <Text type="secondary">{employeeData?.department}</Text>
                </Space>
              </Col>
              <Col>
                <Space>
                  {!editMode ? (
                    <Button 
                      type="primary" 
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditMode(true);
                        console.log('✏️ Entered edit mode');
                      }}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Button 
                      icon={<CloseOutlined />}
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 24 }}
          closable
          onClose={() => setError('')}
        />
      )}

      <Row gutter={[24, 24]}>
        {/* Personal Information */}
        <Col span={24}>
          <Card 
            title={
              <Space>
                <UserOutlined />
                <span>Personal Information</span>
                {editMode && <Tag color="blue">Editing</Tag>}
              </Space>
            }
            extra={
              editMode && (
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />}
                  loading={updating}
                  onClick={() => form.submit()}
                >
                  Save Changes
                </Button>
              )
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
              disabled={!editMode || updating}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="full_name"
                    label="Full Name"
                    rules={[
                      { required: true, message: 'Please enter your full name' }
                    ]}
                  >
                    <Input 
                      prefix={<UserOutlined />}
                      placeholder="Enter your full name"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email Address"
                  >
                    <Input 
                      prefix={<MailOutlined />}
                      placeholder="Email address"
                      size="large"
                      disabled
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                  >
                    <Input 
                      prefix={<PhoneOutlined />}
                      placeholder="Enter your phone number"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="gender"
                    label="Gender"
                  >
                    <Select placeholder="Select gender" size="large">
                      {genders.map(gender => (
                        <Option key={gender} value={gender}>{gender}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="dob"
                    label="Date of Birth"
                  >
                    <DatePicker 
                      style={{ width: '100%' }}
                      size="large"
                      format="YYYY-MM-DD"
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    name="tenure"
                    label="Tenure"
                  >
                    <Input 
                      placeholder="e.g., 2 years"
                      size="large"
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    name="empaddress"
                    label="Address"
                  >
                    <TextArea 
                      rows={3}
                      placeholder="Enter your address"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {/* Professional Information */}
        <Col span={24}>
          <Card 
            title={
              <Space>
                <TeamOutlined />
                <span>Professional Information</span>
              </Space>
            }
          >
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="role"
                  label="Role"
                >
                  <Select 
                    placeholder="Select role" 
                    size="large"
                    disabled={!editMode}
                  >
                    {roles.map(role => (
                      <Option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="department"
                  label="Department"
                >
                  <Select 
                    placeholder="Select department" 
                    size="large"
                    disabled={!editMode}
                  >
                    {departments.map(dept => (
                      <Option key={dept} value={dept}>{dept}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="basicsalary"
                  label="Basic Salary"
                >
                  <Input 
                    type="number"
                    prefix="$"
                    placeholder="0.00"
                    size="large"
                    disabled={!editMode}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="kpiscore"
                  label="KPI Score"
                >
                  <Input 
                    type="number"
                    placeholder="0-100"
                    size="large"
                    disabled={!editMode}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  name="satisfaction_score"
                  label="Satisfaction Score"
                >
                  <Input 
                    type="number"
                    placeholder="0-100"
                    size="large"
                    disabled={!editMode}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Read-only Information */}
        {!editMode && employeeData && (
          <Col span={24}>
            <Card title="System Information">
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Employee ID">
                  {employeeData.empid}
                </Descriptions.Item>
                <Descriptions.Item label="Auth User ID">
                  {employeeData.auth_user_id || 'Not linked'}
                </Descriptions.Item>
                <Descriptions.Item label="Manager ID">
                  {employeeData.managerid || 'Not assigned'}
                </Descriptions.Item>
                <Descriptions.Item label="Account Status">
                  <Switch 
                    checked={employeeData.is_active} 
                    disabled
                  />
                  <Text style={{ marginLeft: 8 }}>
                    {employeeData.is_active ? 'Active' : 'Inactive'}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {dayjs(employeeData.created_at).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {dayjs(employeeData.updated_at).format('YYYY-MM-DD HH:mm')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        )}
      </Row>

      {/* Developer Debug Info */}
      <Card 
        title="Debug Information" 
        style={{ marginTop: 24 }}
        size="small"
      >
        <Text type="secondary">
          💡 <strong>Developer Info:</strong> Check browser console for detailed update process logging
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

export default ProfilePage;