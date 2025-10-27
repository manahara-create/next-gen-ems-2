import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  message,
  Space,
  Typography,
  Divider,
  Image
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { supabase } from './supabase';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'ceo', label: 'CEO' },
    { value: 'accountant', label: 'Accountant' },
    { value: 'employee', label: 'Employee' },
    { value: 'hr', label: 'HR' }
  ];

  // ✅ Registration handler
  const handleRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.full_name,
            role: values.role
          }
        }
      });

      if (authError) throw authError;

      // 2️⃣ Add user record to employee table
      if (authData?.user) {
        const { error: employeeError } = await supabase
          .from('employee')
          .insert([
            {
              full_name: values.full_name,
              email: values.email,
              role: values.role,
              auth_user_id: authData.user.id
            }
          ]);

        if (employeeError) throw employeeError;

        message.success(
          'Registration successful! Please check your email for verification.'
        );
        form.resetFields();
      }
    } catch (error) {
      console.error('Registration error:', error);
      message.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle validation failure
  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Please check the form and try again.');
  };

  // ✅ Reset form
  const handleReset = () => {
    form.resetFields();
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#ACAC9B',
        backgroundImage: `
          linear-gradient(135deg, rgba(172, 172, 155, 0.9) 0%, rgba(172, 172, 155, 0.9) 100%),
          url('/image1.avif')
        `,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'overlay',
        padding: '20px'
      }}
    >
      <Card
        style={{
          width: 520,
          maxWidth: '90vw',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          borderRadius: '16px',
          border: 'none',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 100%)'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              marginBottom: 20,
              padding: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <Image
              src="/main-app-logo.png"
              alt="NextGenEMS"
              preview={false}
              style={{
                height: '80px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>
          <Title level={3} style={{ color: '#2c3e50', margin: 0 }}>
            Create Your Account
          </Title>
          <Text
            style={{
              fontSize: '14px',
              color: '#7f8c8d',
              fontWeight: '500'
            }}
          >
            Join the Employee Management System
          </Text>
        </div>

        {/* Company Info Section */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 28,
            padding: '16px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '2px solid #e74c3c'
          }}
        >
          <Text
            strong
            style={{
              display: 'block',
              marginBottom: 8,
              fontSize: '14px',
              color: '#2c3e50'
            }}
          >
            EMS For
          </Text>
          <Text
            strong
            style={{
              display: 'block',
              marginBottom: 8,
              fontSize: '20px',
              color: '#2c3e50'
            }}
          >
            Sixth Gear Automotive Pvt Ltd
          </Text>
          <Text
            style={{
              fontSize: '12px',
              color: '#7f8c8d'
            }}
          >
            Default Department: AUTOMOTIVE
          </Text>
        </div>

        <Divider
          style={{
            margin: '24px 0',
            borderColor: '#bdc3c7',
            color: '#34495e',
            fontSize: '15px',
            fontWeight: '600'
          }}
        >
          <IdcardOutlined /> Registration Details
        </Divider>

        {/* Registration Form */}
        <Form
          form={form}
          name="register"
          onFinish={handleRegister}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
          initialValues={{ role: 'employee' }}
        >
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[
              {
                required: true,
                message: 'Please input your full name!',
                whitespace: true
              }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#3498db' }} />}
              placeholder="Enter your full name"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please input your email address!' },
              { type: 'email', message: 'Please enter a valid email address!' }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#3498db' }} />}
              placeholder="Enter your email address"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select your role!' }]}
          >
            <Select
              placeholder="Select role"
              size="large"
              suffixIcon={<TeamOutlined />}
            >
              {roles.map((role) => (
                <Option key={role.value} value={role.value}>
                  {role.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#3498db' }} />}
              placeholder="Create a strong password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match!'));
                }
              })
            ]}
          >
            <Input.Password
              prefix={<SafetyCertificateOutlined style={{ color: '#3498db' }} />}
              placeholder="Confirm your password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                icon={<UserOutlined />}
              >
                Create Account
              </Button>
              <Button onClick={handleReset} block size="large">
                Clear Form
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {/* Login Link */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text style={{ fontSize: '14px', color: '#7f8c8d' }}>
            Already have an account?{' '}
          </Text>
          <Link to="/login" style={{ fontWeight: '600', color: '#3498db' }}>
            Sign in here
          </Link>
        </div>

        {/* Footer */}
        <Divider style={{ margin: '24px 0' }} />
        <div style={{ textAlign: 'center' }}>
          <Text style={{ fontSize: '12px', color: '#7f8c8d' }}>
            Powered by
          </Text>
          <div style={{ margin: '8px 0' }}></div>
          <Image
            src="/logo.png"
            alt="YISN"
            preview={false}
            style={{
              height: '60px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default RegisterForm;