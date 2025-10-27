import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Dropdown, 
  Avatar, 
  Button, 
  Typography, 
  Card, 
  Row, 
  Col,
  Badge,
  Space,
  Divider,
  theme
} from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  SettingOutlined,
  BellOutlined,
  MailOutlined,
  ProfileOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const DashboardLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Get current user and employee data
  useEffect(() => {
    const getUserData = async () => {
      try {
        console.log('🔍 Fetching user data for dashboard...');
        
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 Auth user:', user);
        
        if (user) {
          setUser(user);
          
          // Get employee data
          const { data: employee, error } = await supabase
            .from('employee')
            .select('*')
            .eq('email', user.email)
            .single();

          if (error) {
            console.error('❌ Error fetching employee data:', error);
          } else {
            console.log('✅ Employee data:', employee);
            setEmployeeData(employee);
          }
        }
      } catch (error) {
        console.error('💥 Error in getUserData:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    console.log('🚪 Logging out user...');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('✅ Logout successful');
      navigate('/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  // User menu dropdown items
  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
    },
  ];

  // Navigation menu items
  const menuItems = [
    {
      key: '/profile',
      icon: <ProfileOutlined />,
      label: 'Profile',
    },
  ];

  // Handle menu click
  const handleMenuClick = ({ key }) => {
    console.log('📱 Menu item clicked:', key);
    navigate(key);
    // You can add navigation logic here based on the key
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
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  // Get welcome message based on time
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ marginBottom: 20 }}>
            <Avatar size={64} icon={<UserOutlined />} />
          </div>
          <Title level={3}>Loading Dashboard...</Title>
          <Text type="secondary">Please wait while we load your information</Text>
        </Card>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: 'linear-gradient(180deg, #001529 0%, #002140 100%)',
          boxShadow: '4px 0 12px rgba(0, 0, 0, 0.1)',
        }}
        width={280}
      >
        {/* Logo Section */}
        <div 
          style={{ 
            height: 64, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: 16
          }}
        >
          {!collapsed ? (
            <Space>
              <div style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Title level={4} style={{ color: 'white', margin: 0, fontSize: 16 }}>N</Title>
              </div>
              <div>
                <Title level={5} style={{ color: 'white', margin: 0, lineHeight: 1.2 }}>
                  Next Gen EMS
                </Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}>
                  {employeeData?.role || 'User'}
                </Text>
              </div>
            </Space>
          ) : (
            <div style={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Title level={4} style={{ color: 'white', margin: 0, fontSize: 16 }}>N</Title>
            </div>
          )}
        </div>

        {/* User Info Section */}
        {!collapsed && (
          <div style={{ 
            padding: '16px 24px', 
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: 16
          }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Badge dot status="success">
                  <Avatar 
                    size="large" 
                    style={{ 
                      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                      fontWeight: 'bold'
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </Badge>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text strong style={{ color: 'white', display: 'block', fontSize: 14 }}>
                    {employeeData?.full_name || user?.email?.split('@')[0] || 'User'}
                  </Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 12, display: 'block' }}>
                    {employeeData?.department || 'Department'}
                  </Text>
                </div>
              </div>
            </Space>
          </div>
        )}

        {/* Navigation Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ 
            background: 'transparent',
            border: 'none'
          }}
        />
      </Sider>

      <Layout>
        {/* Header */}
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            />
            
            <div>
              <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                {getWelcomeMessage()}
              </Title>
              <Text type="secondary">
                Welcome back, {employeeData?.full_name?.split(' ')[0] || 'User'}!
              </Text>
            </div>
          </div>

          <Space size="middle">
            {/* Notifications */}
            <Badge count={3} size="small">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                shape="circle"
                style={{ fontSize: '16px' }}
              />
            </Badge>

            {/* Messages */}
            <Badge dot size="small">
              <Button 
                type="text" 
                icon={<MailOutlined />} 
                shape="circle"
                style={{ fontSize: '16px' }}
              />
            </Badge>

            {/* User Profile Dropdown */}
            <Dropdown 
              menu={{ items: userMenuItems }} 
              placement="bottomRight"
              trigger={['click']}
            >
              <Button 
                type="text" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8,
                  height: 48,
                  padding: '0 12px',
                  borderRadius: 8
                }}
              >
                <Avatar 
                  size="small" 
                  style={{ 
                    background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                    fontWeight: 'bold'
                  }}
                >
                  {getUserInitials()}
                </Avatar>
                {!collapsed && (
                  <div style={{ textAlign: 'left' }}>
                    <Text strong style={{ display: 'block', fontSize: 14, lineHeight: 1.2 }}>
                      {employeeData?.full_name?.split(' ')[0] || 'User'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.2 }}>
                      {employeeData?.role || 'Role'}
                    </Text>
                  </div>
                )}
              </Button>
            </Dropdown>
          </Space>
        </Header>

        {/* Main Content */}
        <Content
          style={{
            margin: '24px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'auto'
          }}
        >
          {/* User Info Card */}
          <Card 
            style={{ 
              marginBottom: 24,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Row gutter={16} align="middle">
              <Col>
                <Avatar 
                  size={64} 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    fontWeight: 'bold',
                    fontSize: 20
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </Col>
              <Col flex={1}>
                <Title level={3} style={{ color: 'white', margin: 0 }}>
                  {employeeData?.full_name || 'User Name'}
                </Title>
                <Space size="middle" style={{ marginTop: 8 }}>
                  <Badge status="success" text={employeeData?.status || 'Active'} />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {employeeData?.role || 'Role'} • {employeeData?.department || 'Department'}
                  </Text>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button 
                    type="primary" 
                    ghost
                    icon={<UserOutlined />}
                    onClick={() => console.log('Edit Profile')}
                  >
                    Edit Profile
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Main Content Area */}
          <div style={{ background: 'transparent' }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;