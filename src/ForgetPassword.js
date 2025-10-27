import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Divider,
  Image,
  Alert,
  Space,
  Steps
} from 'antd';
import {
  MailOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { supabase } from './supabase';

const { Title, Text } = Typography;
const { Step } = Steps;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // ✅ Forgot Password handler
  const handleForgotPassword = async (values) => {
    console.log('🎬 ===== FORGOT PASSWORD PROCESS STARTED =====');
    console.log('📧 Email submitted:', values.email);

    setLoading(true);

    try {
      console.log('📤 Sending password reset request to Supabase...');
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        console.error('❌ Password reset request failed:', error);
        console.log('📋 Error details:', {
          message: error.message,
          code: error.code,
          status: error.status
        });
        throw error;
      }

      console.log('✅ Password reset email sent successfully');
      console.log('📧 Email sent to:', values.email);
      console.log('🔗 Redirect URL:', `${window.location.origin}/reset-password`);

      setEmailSent(true);
      setCurrentStep(1);
      message.success('Password reset instructions sent to your email!');
      
    } catch (error) {
      console.error('💥 Forgot password process failed:', error);
      message.error(error.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      console.log('🏁 ===== FORGOT PASSWORD PROCESS COMPLETED =====');
      setLoading(false);
    }
  };

  // ✅ Handle validation failure
  const onFinishFailed = (errorInfo) => {
    console.log('Form validation failed:', errorInfo);
    message.error('Please check your email address and try again.');
  };

  // ✅ Reset form
  const handleReset = () => {
    form.resetFields();
    console.log('🔄 Form reset');
  };

  // ✅ Resend email
  const handleResendEmail = () => {
    const email = form.getFieldValue('email');
    if (email) {
      console.log('🔄 Resending password reset email to:', email);
      form.submit();
    } else {
      message.warning('Please enter your email address first.');
    }
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
          url('/image2.avif')
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
        {/* Back to Login */}
        <div style={{ marginBottom: 20 }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', color: '#3498db', fontWeight: '500' }}>
            <ArrowLeftOutlined style={{ marginRight: 8 }} />
            Back to Login
          </Link>
        </div>

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
            Reset Your Password
          </Title>
          <Text
            style={{
              fontSize: '14px',
              color: '#7f8c8d',
              fontWeight: '500'
            }}
          >
            We'll send you instructions to reset your password
          </Text>
        </div>

        {/* Progress Steps */}
        <div style={{ marginBottom: 32 }}>
          <Steps
            current={currentStep}
            size="small"
            items={[
              {
                title: 'Enter Email',
              },
              {
                title: 'Check Email',
              },
              {
                title: 'Reset Password',
              },
            ]}
          />
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
          <SafetyCertificateOutlined /> Password Recovery
        </Divider>

        {/* Success Message */}
        {emailSent && (
          <Alert
            message="Check Your Email"
            description={
              <div>
                <p>We've sent password reset instructions to your email address.</p>
                <ul style={{ textAlign: 'left', margin: '8px 0' }}>
                  <li>Check your inbox (and spam folder)</li>
                  <li>Click the reset link in the email</li>
                  <li>Create your new password</li>
                </ul>
              </div>
            }
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Forgot Password Form */}
        {!emailSent ? (
          <Form
            form={form}
            name="forgotPassword"
            onFinish={handleForgotPassword}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
          >
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
                placeholder="Enter your registered email address"
                size="large"
                onChange={(e) => console.log('📧 Email input:', e.target.value)}
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
                  icon={<MailOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                    border: 'none',
                    fontWeight: '600'
                  }}
                >
                  Send Reset Instructions
                </Button>
                <Button 
                  onClick={handleReset} 
                  block 
                  size="large"
                  style={{ fontWeight: '500' }}
                >
                  Clear Form
                </Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          /* After Email Sent */
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 24 }}>
              <CheckCircleOutlined 
                style={{ 
                  fontSize: 48, 
                  color: '#52c41a',
                  marginBottom: 16 
                }} 
              />
              <Title level={4} style={{ color: '#2c3e50', marginBottom: 8 }}>
                Check Your Email
              </Title>
              <Text style={{ color: '#7f8c8d' }}>
                We've sent password reset instructions to your email address.
              </Text>
            </div>

            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Button
                type="primary"
                onClick={handleResendEmail}
                loading={loading}
                block
                size="large"
                icon={<MailOutlined />}
                style={{
                  background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                  border: 'none',
                  fontWeight: '600'
                }}
              >
                Resend Email
              </Button>
              <Button 
                onClick={() => {
                  setEmailSent(false);
                  setCurrentStep(0);
                  handleReset();
                }}
                block 
                size="large"
                style={{ fontWeight: '500' }}
              >
                Use Different Email
              </Button>
            </Space>
          </div>
        )}

        {/* Additional Help Links */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Space direction="vertical" size="small">
            <Text style={{ fontSize: '14px', color: '#7f8c8d' }}>
              Remember your password?{' '}
              <Link to="/login" style={{ fontWeight: '600', color: '#3498db' }}>
                Sign in here
              </Link>
            </Text>
            <Text style={{ fontSize: '14px', color: '#7f8c8d' }}>
              Need a new account?{' '}
              <Link to="/register" style={{ fontWeight: '600', color: '#e74c3c' }}>
                Create account here
              </Link>
            </Text>
          </Space>
        </div>

        {/* Developer Info */}
        <div style={{ 
          marginTop: 24, 
          padding: '16px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <Text style={{ fontSize: '12px', color: '#6c757d' }}>
            💡 <strong>Developer Info:</strong> Check browser console for detailed process logging
          </Text>
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

export default ForgotPassword;