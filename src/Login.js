import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, Alert, Spin, Row, Col } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Function to get employee by email with detailed logging
  const getEmployeeByEmail = async (email) => {
    console.log('🔍 Starting employee lookup process...');
    console.log('📧 Email being queried:', email);
    
    try {
      console.log('🚀 Executing Supabase query...');
      console.log('📊 Query details:');
      console.log('  - Table: employee');
      console.log('  - Select: * (all columns)');
      console.log('  - Where: email =', email);
      console.log('  - Method: single()');

      const { data, error } = await supabase
        .from('employee')
        .select('*')
        .eq('email', email)
        .single();

      console.log('✅ Supabase query completed');
      
      if (error) {
        console.error('❌ Supabase query error:', error);
        console.log('📋 Error details:');
        console.log('  - Message:', error.message);
        console.log('  - Code:', error.code);
        console.log('  - Details:', error.details);
        throw error;
      }

      console.log('🎯 Employee data retrieved successfully');
      console.log('📦 Raw employee data:', data);
      
      // Handle null/NaN values with defaults
      console.log('🛠️ Processing employee data - setting defaults for null/NaN values...');
      
      const employeeData = {
        ...data,
        basicsalary: data.basicsalary || 0,
        kpiscore: data.kpiscore || 0,
        satisfaction_score: data.satisfaction_score || 0,
        department: data.department || 'AUTOMOTIVE',
        status: data.status || 'Active',
        is_active: data.is_active !== null ? data.is_active : true
      };

      console.log('✅ Employee data processing completed');
      console.log('📋 Processed employee data:', employeeData);
      console.log('🔍 Key fields check:');
      console.log('  - Full Name:', employeeData.full_name);
      console.log('  - Role:', employeeData.role);
      console.log('  - Department:', employeeData.department);
      console.log('  - Status:', employeeData.status);
      console.log('  - Is Active:', employeeData.is_active);
      console.log('  - Basic Salary:', employeeData.basicsalary);
      console.log('  - KPI Score:', employeeData.kpiscore);
      console.log('  - Satisfaction Score:', employeeData.satisfaction_score);

      return { success: true, data: employeeData };
    } catch (error) {
      console.error('💥 Employee lookup failed:', error);
      return { success: false, error: error.message };
    }
  };

  // Function to navigate based on role with logging
  const navigateByRole = (role, employeeData) => {
    console.log('🧭 Starting role-based navigation...');
    console.log('🎯 User role:', role);
    console.log('👤 Employee details for navigation:', {
      name: employeeData.full_name,
      email: employeeData.email,
      department: employeeData.department
    });

    const rolePathMap = {
      'admin': '/admin/dashboard',
      'employee': '/employee/dashboard',
      'ceo': '/ceo/dashboard',
      'manager': '/manager/dashboard',
      'accountant': '/accountant/dashboard',
      'hr': '/hr/dashboard'
    };

    // Normalize role to lowercase for case-insensitive matching
    const normalizedRole = role?.toLowerCase();
    console.log('🔠 Normalized role:', normalizedRole);

    const path = rolePathMap[normalizedRole] || '/employee/dashboard';
    
    console.log('📍 Determined navigation path:', path);
    console.log('🚀 Navigating to:', path);
    
    navigate(path);
  };

  const onFinish = async (values) => {
    console.log('🎬 ===== LOGIN PROCESS STARTED =====');
    console.log('📝 Form values received:', values);
    console.log('📧 Email input:', values.email);
    console.log('🔑 Password input length:', values.password.length);

    setLoading(true);
    setError('');
    setStatusMessage('');

    try {
      // Step 1: Sign in with Supabase
      console.log('🔐 Step 1: Starting Supabase authentication...');
      setStatusMessage('Authenticating...');
      
      console.log('📤 Sending authentication request to Supabase...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      console.log('📥 Authentication response received');
      
      if (authError) {
        console.error('❌ Authentication failed:', authError);
        console.log('📋 Auth error details:');
        console.log('  - Message:', authError.message);
        console.log('  - Code:', authError.code);
        console.log('  - Status:', authError.status);
        throw authError;
      }

      console.log('✅ Authentication successful');
      console.log('👤 Auth user data:', {
        id: authData.user?.id,
        email: authData.user?.email,
        confirmed: authData.user?.confirmed_at ? 'Yes' : 'No'
      });
      console.log('🔑 Session details:', authData.session ? 'Valid session' : 'No session');

      if (authData.user) {
        // Step 2: Get employee details after short delay
        console.log('⏳ Step 2: Preparing to fetch employee profile...');
        setStatusMessage('Getting details about your profile...');
        
        console.log('⏰ Adding 2-second delay for better UX...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('👨‍💼 Step 3: Fetching employee details from database...');
        const employeeResult = await getEmployeeByEmail(values.email);
        
        console.log('📊 Employee lookup result:', employeeResult);
        
        if (!employeeResult.success) {
          console.error('❌ Employee profile not found in database');
          throw new Error('Employee profile not found. Please contact administrator.');
        }

        console.log('✅ Employee profile found successfully');

        // Step 4: Check if employee is active
        console.log('🔍 Step 4: Checking employee account status...');
        console.log('📊 Employee active status:', employeeResult.data.is_active);
        
        if (!employeeResult.data.is_active) {
          console.error('❌ Employee account is deactivated');
          throw new Error('Your account is deactivated. Please contact administrator.');
        }

        console.log('✅ Employee account is active');

        // Step 5: Navigate based on role
        console.log('🎯 Step 5: Determining dashboard based on role...');
        console.log('📋 Role information:', {
          rawRole: employeeResult.data.role,
          normalizedRole: employeeResult.data.role?.toLowerCase()
        });

        setStatusMessage(`Welcome ${employeeResult.data.full_name}! Redirecting to ${employeeResult.data.role} dashboard...`);
        
        console.log('⏰ Adding 1-second delay before navigation...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🚀 Step 6: Starting navigation...');
        navigateByRole(employeeResult.data.role, employeeResult.data);

      } else {
        console.error('❌ No user data in auth response');
        throw new Error('Authentication failed. Please try again.');
      }

    } catch (error) {
      console.error('💥 ===== LOGIN PROCESS FAILED =====');
      console.error('📋 Error details:', error);
      console.error('🚨 Error message:', error.message);
      setError(error.message);
      setStatusMessage('');
    } finally {
      console.log('🏁 ===== LOGIN PROCESS COMPLETED =====');
      console.log('📊 Final status:', error ? 'Failed' : 'Success');
      setLoading(false);
    }
  };

  // Email parsing and validation logging
  const handleEmailChange = (e) => {
    const email = e.target.value;
    console.log('📧 Email input changed:', email);
    console.log('🔍 Email validation check:');
    console.log('  - Contains @:', email.includes('@'));
    console.log('  - Contains .:', email.includes('.'));
    console.log('  - Length:', email.length);
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    console.log('🔑 Password input changed, length:', password.length);
    // Don't log actual password for security
  };

  return (
    <Row style={{ minHeight: '100vh' }}>
      {/* Left Side - Form */}
      <Col xs={24} lg={12}>
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
          <Card 
            style={{ 
              width: '100%',
              maxWidth: 450,
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              borderRadius: '16px',
              border: 'none'
            }}
            bodyStyle={{ padding: '40px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <Title level={2} style={{ 
                color: '#1890ff', 
                marginBottom: 8,
                fontWeight: 600 
              }}>
                Welcome Back
              </Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                Sign in to Next Gen EMS
              </Text>
            </div>

            {error && (
              <Alert
                message="Login Failed"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}

            {statusMessage && (
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Text type="secondary">{statusMessage}</Text>
                </div>
              </div>
            )}

            {!statusMessage && (
              <Form
                name="login"
                onFinish={onFinish}
                layout="vertical"
                size="large"
                disabled={loading}
              >
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="Enter your email"
                    style={{ borderRadius: '8px' }}
                    onChange={handleEmailChange}
                    onBlur={(e) => console.log('📧 Email field blurred:', e.target.value)}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined />} 
                    placeholder="Enter your password"
                    style={{ borderRadius: '8px' }}
                    onChange={handlePasswordChange}
                    onBlur={(e) => console.log('🔑 Password field blurred, length:', e.target.value.length)}
                  />
                </Form.Item>

                <Form.Item style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to="/register">
                      <Text style={{ fontSize: '14px', color: '#1890ff' }}>
                        Create Account
                      </Text>
                    </Link>
                    <Link to="/forgot-password">
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        Forgot Password?
                      </Text>
                    </Link>
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    block
                    style={{ 
                      height: '48px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600
                    }}
                    onClick={() => console.log('🖱️ Login button clicked')}
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Form>
            )}

            {!statusMessage && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Check browser console for detailed login process
                </Text>
              </div>
            )}
          </Card>
        </div>
      </Col>

      {/* Right Side - Background Image */}
      <Col xs={0} lg={12} style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          padding: '40px',
          textAlign: 'center'
        }}>
          <Title level={1} style={{ color: 'white', marginBottom: 20 }}>
            Next Gen EMS
          </Title>
          <Title level={3} style={{ color: 'white', fontWeight: 300 }}>
            Enterprise Management System
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginTop: 20 }}>
            Streamline your business operations with our comprehensive management solution
          </Text>
          <div style={{ marginTop: 30, background: 'rgba(255,255,255,0.1)', padding: 20, borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: '14px' }}>
              💡 <strong>Developer Note:</strong> Check browser console for detailed login process logging
            </Text>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default Login;