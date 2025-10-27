import React, { useState, useEffect } from 'react';
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
  Space
} from 'antd';
import {
  LockOutlined,
  SafetyCertificateOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🎬 ===== RESET PASSWORD PAGE LOADED =====');
    
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('🔐 Current session:', session ? 'Valid' : 'Invalid');
      setSession(session);
      
      if (!session) {
        console.log('❌ No valid session found, redirecting to login...');
        message.error('Invalid or expired reset link. Please request a new one.');
        navigate('/forgot-password');
      }
    };

    getSession();
  }, [navigate]);

  // ✅ Reset Password handler
  const handleResetPassword = async (values) => {
    console.log('🎬 ===== PASSWORD RESET PROCESS STARTED =====');
    console.log('🔑 New password length:', values.password.length);

    if (values.password !== values.confirmPassword) {
      console.log('❌ Password mismatch detected');
      message.error('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Updating password in Supabase...');
      
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });

      if (error) {
        console.error('❌ Password update failed:', error);
        throw error;
      }

      console.log('✅ Password updated successfully');
      setResetSuccess(true);
      message.success('Password reset successfully! You can now login with your new password.');
      
      // Redirect to login after success
      setTimeout(() => {
        console.log('🔄 Redirecting to login page...');
        navigate('/login');
      }, 3000);

    } catch (error) {
      console.error('💥 Password reset process failed:', error);
      message.error(error.message || 'Failed to reset password. Please try again.');
    } finally {
      console.log('🏁 ===== PASSWORD RESET PROCESS COMPLETED =====');
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Card style={{ width: 400, textAlign: 'center' }}>
          <Alert
            message="Invalid Reset Link"
            description="The password reset link is invalid or has expired. Please request a new one."
            type="error"
            showIcon
          />
          <div style={{ marginTop: 16 }}>
            <Link to="/forgot-password">
              <Button type="primary">Request New Reset Link</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

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
            Create New Password
          </Title>
          <Text
            style={{
              fontSize: '14px',
              color: '#7f8c8d',
              fontWeight: '500'
            }}
          >
            Enter your new password below
          </Text>
        </div>

        {/* Success Message */}
        {resetSuccess && (
          <Alert
            message="Password Reset Successful"
            description="Your password has been reset successfully. Redirecting to login..."
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Reset Password Form */}
        {!resetSuccess && (
          <>
            <Divider
              style={{
                margin: '24px 0',
                borderColor: '#bdc3c7',
                color: '#34495e',
                fontSize: '15px',
                fontWeight: '600'
              }}
            >
              <SafetyCertificateOutlined /> New Password
            </Divider>

            <Form
              form={form}
              name="resetPassword"
              onFinish={handleResetPassword}
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item
                name="password"
                label="New Password"
                rules={[
                  { required: true, message: 'Please input your new password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#3498db' }} />}
                  placeholder="Enter your new password"
                  size="large"
                  onChange={(e) => console.log('🔑 New password input length:', e.target.value.length)}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your new password!' },
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
                  placeholder="Confirm your new password"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  icon={<CheckCircleOutlined />}
                  style={{
                    background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                    border: 'none',
                    fontWeight: '600'
                  }}
                >
                  Reset Password
                </Button>
              </Form.Item>
            </Form>
          </>
        )}

        {/* Additional Links */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text style={{ fontSize: '14px', color: '#7f8c8d' }}>
            Remember your password?{' '}
            <Link to="/login" style={{ fontWeight: '600', color: '#3498db' }}>
              Sign in here
            </Link>
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

export default ResetPassword;