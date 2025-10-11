import React, { useState, useEffect } from "react";
import {
  LockOutlined,
  BellOutlined,
  GlobalOutlined,
  SaveOutlined,
  ReloadOutlined,
  SecurityScanOutlined,
  DatabaseOutlined,
  UserSwitchOutlined,
  TeamOutlined,
  SettingOutlined,
  AuditOutlined,
  CloudServerOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  BarChartOutlined,
  MonitorOutlined,
  CodeOutlined,
  MailOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  ControlOutlined,
  ApiOutlined,
  CloudSyncOutlined,
  FileProtectOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Card,
  Tabs,
  Form,
  Input,
  Switch,
  Button,
  Select,
  Divider,
  Space,
  Row,
  Col,
  Alert,
  message,
  InputNumber,
  TimePicker,
  Upload,
  Statistic,
} from "antd";

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const defaultSettings = {
  security: {
    passwordPolicy: "Min 8 chars, uppercase, number, special",
    sessionTimeout: 30,
    twoFactor: false,
    loginNotifications: true,
    ipWhitelisting: false,
    defaultRole: "User",
    securityPolicy: "All users must follow security protocols.",
    maxLoginAttempts: 5,
    passwordExpiry: 90,
    enableAuditLog: true,
    forceLogout: false,
    encryptionLevel: "high",
  },
  
  userManagement: {
    selfRegistration: false,
    newUserRole: "User",
    rolePermissions: "",
    enableUserActivityLog: true,
    autoApproveUsers: false,
    userSessionLimit: 3,
    enableProfileUpdates: true,
    allowRoleChanges: true,
    userQuota: 1000,
    enableBulkOperations: false,
  },
  
  notifications: {
    emailNotif: true,
    smsNotif: false,
    pushNotif: true,
    adminAlerts: true,
    systemAlerts: true,
    securityAlerts: true,
    lowStorageAlerts: true,
    performanceAlerts: false,
    auditAlerts: true,
    userActivityAlerts: false,
  },
  
  backup: {
    autoBackup: true,
    backupFrequency: "daily",
    backupLocation: "/backups/system",
    backupRetention: 30,
    enableCloudBackup: false,
    compressBackups: true,
    backupEncryption: true,
    maintenanceMode: false,
    autoUpdate: false,
    backupVerification: true,
    incrementalBackup: false,
  },
  
  system: {
    appName: "Hospital Management System",
    appVersion: "1.0.0",
    theme: "light",
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    enableApi: true,
    apiRateLimit: 1000,
    enableCaching: true,
    cacheDuration: 3600,
    maxUploadSize: 50,
    enableMaintenance: false,
    logLevel: "info",
  },
  
  email: {
    smtpHost: "smtp.example.com",
    smtpPort: 587,
    smtpUsername: "admin@example.com",
    smtpPassword: "",
    fromEmail: "noreply@example.com",
    fromName: "Hospital System",
    enableTLS: true,
    emailTemplate: "default",
  },

  api: {
    enableApi: true,
    apiVersion: "v1",
    rateLimit: 1000,
    enableSwagger: true,
    corsEnabled: true,
    apiTimeout: 30,
    enableWebhooks: false,
    webhookUrl: "",
    apiKeysEnabled: true,
  },

  monitoring: {
    enableMonitoring: true,
    performanceTracking: true,
    errorTracking: true,
    uptimeMonitoring: true,
    resourceUsage: true,
    alertThreshold: 80,
    logRetention: 30,
    enableReports: true,
  }
};

export default function AdminSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        const flattenedSettings = flattenSettings(parsedSettings);
        form.setFieldsValue(flattenedSettings);
      } catch (error) {
        console.error("Error loading saved settings:", error);
        message.error("Error loading saved settings. Using defaults.");
        form.setFieldsValue(flattenSettings(defaultSettings));
      }
    } else {
      localStorage.setItem("adminSettings", JSON.stringify(defaultSettings));
      form.setFieldsValue(flattenSettings(defaultSettings));
    }
  }, [form]);

  const flattenSettings = (nestedSettings: any) => {
    const flattened: any = {};
    Object.keys(nestedSettings).forEach(category => {
      Object.keys(nestedSettings[category]).forEach(key => {
        flattened[key] = nestedSettings[category][key];
      });
    });
    return flattened;
  };

  const nestSettings = (flatSettings: any) => {
    const nested: any = {};
    Object.keys(defaultSettings).forEach(category => {
      nested[category] = {};
      Object.keys(defaultSettings[category]).forEach(key => {
        if (flatSettings[key] !== undefined) {
          nested[category][key] = flatSettings[key];
        } else {
          nested[category][key] = defaultSettings[category][key];
        }
      });
    });
    return nested;
  };

  const handleSave = () => {
    setLoading(true);
    form
      .validateFields()
      .then((values) => {
        setTimeout(() => {
          const nestedSettings = nestSettings(values);
          setSettings(nestedSettings);
          localStorage.setItem("adminSettings", JSON.stringify(nestedSettings));
          localStorage.setItem('adminSettingsLastSaved', new Date().toLocaleString());
          console.log("Settings saved:", nestedSettings);
          message.success("Settings saved successfully!");
          setLoading(false);
        }, 1000);
      })
      .catch((error) => {
        console.error("Validation failed:", error);
        message.error("Please fix the errors before saving.");
        setLoading(false);
      });
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    form.setFieldsValue(flattenSettings(defaultSettings));
    localStorage.setItem("adminSettings", JSON.stringify(defaultSettings));
    message.info("All settings have been reset to default values.");
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const handleExportSettings = () => {
    try {
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'admin-settings-backup.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success("Settings exported successfully!");
    } catch (error) {
      message.error("Failed to export settings.");
    }
  };

  const handleImportSettings = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (e.target && typeof e.target.result === 'string') {
          const importedSettings = JSON.parse(e.target.result);
          
          // Validate imported settings structure
          if (typeof importedSettings === 'object' && importedSettings !== null) {
            setSettings(importedSettings);
            form.setFieldsValue(flattenSettings(importedSettings));
            localStorage.setItem("adminSettings", JSON.stringify(importedSettings));
            message.success("Settings imported successfully!");
          } else {
            throw new Error("Invalid settings format");
          }
        }
      } catch (error) {
        console.error("Import error:", error);
        message.error("Invalid settings file format. Please check the file.");
      }
    };
    reader.onerror = () => {
      message.error("Failed to read the file.");
    };
    reader.readAsText(file);
    
    // Prevent default upload behavior
    return false;
  };

  const getSystemStats = () => {
    try {
      return {
        totalSettings: Object.keys(settings).reduce((acc, key) => acc + Object.keys(settings[key] || {}).length, 0),
        enabledFeatures: Object.values(settings).flatMap(obj => 
          Object.values(obj || {}).filter(val => val === true)
        ).length,
        lastSaved: localStorage.getItem('adminSettingsLastSaved') || 'Never',
      };
    } catch (error) {
      return {
        totalSettings: 0,
        enabledFeatures: 0,
        lastSaved: 'Never',
      };
    }
  };

  const systemStats = getSystemStats();

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel Settings</h1>
          <p className="text-gray-500 mt-1">Manage system administration settings</p>
        </div>
        <div className="flex space-x-2">
          <Button danger icon={<ReloadOutlined />} onClick={handleReset} size="large">
            Reset to Default
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave} 
            loading={loading} 
            size="large"
          >
            Save Settings
          </Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Settings" value={systemStats.totalSettings} prefix={<SettingOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Enabled Features" 
              value={systemStats.enabledFeatures} 
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <div className="space-y-2">
              <div className="text-gray-600">Last Saved</div>
              <div className="font-semibold">{systemStats.lastSaved}</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button icon={<FileTextOutlined />} onClick={handleExportSettings}>
                Export Settings
              </Button>
              <Upload 
                beforeUpload={handleImportSettings}
                showUploadList={false}
                accept=".json"
                maxCount={1}
              >
                <Button icon={<CloudServerOutlined />}>
                  Import Settings
                </Button>
              </Upload>
            </Space>
          </Card>
        </Col>
      </Row>

      <Alert
        message="Admin Settings Configuration"
        description="Configure system administration, security, roles, and notifications. All settings are automatically saved to your browser's local storage."
        type="info"
        showIcon
        closable
      />

      <Card className="shadow-lg border-0" bodyStyle={{ padding: 0 }}>
        <Tabs
          defaultActiveKey="1"
          activeKey={activeTab}
          onChange={handleTabChange}
          tabPosition="left"
          size="large"
          style={{ minHeight: 600 }}
        >
          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <LockOutlined className="text-red-500" />
                <span>Security</span>
              </span>
            }
            key="1"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-6 text-gray-800">Security Settings</h2>
              <Form form={form} layout="vertical">
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Password Policy" name="passwordPolicy">
                      <Input
                        placeholder="Min 8 chars, uppercase, number, special"
                        size="large"
                        prefix={<SecurityScanOutlined className="text-gray-400" />}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Session Timeout (minutes)" name="sessionTimeout">
                      <InputNumber 
                        min={5} 
                        max={480} 
                        size="large" 
                        style={{ width: "100%" }}
                        placeholder="30"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={8}>
                    <Form.Item label="Two-Factor Authentication" name="twoFactor" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Force Logout" name="forceLogout" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="IP Whitelisting" name="ipWhitelisting" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Max Login Attempts" name="maxLoginAttempts">
                      <InputNumber 
                        min={1} 
                        max={10} 
                        size="large" 
                        style={{ width: "100%" }}
                        placeholder="5"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Password Expiry (days)" name="passwordExpiry">
                      <InputNumber 
                        min={1} 
                        max={365} 
                        size="large" 
                        style={{ width: "100%" }}
                        placeholder="90"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Default User Role" name="defaultRole">
                      <Select size="large" placeholder="Select default role">
                        <Option value="Super Admin">Super Admin</Option>
                        <Option value="Admin">Admin</Option>
                        <Option value="Doctor">Doctor</Option>
                        <Option value="Nurse">Nurse</Option>
                        <Option value="User">User</Option>
                        <Option value="Viewer">Viewer</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Encryption Level" name="encryptionLevel">
                      <Select size="large" placeholder="Select encryption level">
                        <Option value="low">Low</Option>
                        <Option value="medium">Medium</Option>
                        <Option value="high">High</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Enable Audit Logging" name="enableAuditLog" valuePropName="checked">
                  <Switch />
                </Form.Item>

                <Form.Item label="Security Policy Description" name="securityPolicy">
                  <TextArea 
                    placeholder="Describe security policies and requirements..."
                    rows={3} 
                    showCount 
                    maxLength={500} 
                  />
                </Form.Item>
              </Form>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <UserSwitchOutlined className="text-purple-500" />
                <span>User Management</span>
              </span>
            }
            key="2"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-6 text-gray-800">User Management</h2>
              <Form form={form} layout="vertical">
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Enable Self-Registration" name="selfRegistration" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Auto Approve Users" name="autoApproveUsers" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Default User Role" name="newUserRole">
                      <Select size="large" placeholder="Select default role">
                        <Option value="Admin">Admin</Option>
                        <Option value="Doctor">Doctor</Option>
                        <Option value="Nurse">Nurse</Option>
                        <Option value="User">User</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="User Session Limit" name="userSessionLimit">
                      <InputNumber 
                        min={1} 
                        max={10} 
                        size="large" 
                        style={{ width: "100%" }}
                        placeholder="3"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Enable Activity Log" name="enableUserActivityLog" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Allow Role Changes" name="allowRoleChanges" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Enable Profile Updates" name="enableProfileUpdates" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Enable Bulk Operations" name="enableBulkOperations" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="User Storage Quota (MB)" name="userQuota">
                  <InputNumber 
                    min={100} 
                    max={10000} 
                    size="large" 
                    style={{ width: "100%" }}
                    placeholder="1000"
                  />
                </Form.Item>

                <Form.Item label="Role Permissions" name="rolePermissions">
                  <TextArea 
                    placeholder="Define role permissions and access levels..."
                    rows={4} 
                    showCount 
                    maxLength={1000} 
                  />
                </Form.Item>
              </Form>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <DatabaseOutlined className="text-orange-500" />
                <span>Backup & Maintenance</span>
              </span>
            }
            key="3"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-6 text-gray-800">Backup & Maintenance</h2>
              <Form form={form} layout="vertical">
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Auto Backup" name="autoBackup" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Backup Frequency" name="backupFrequency">
                      <Select size="large" placeholder="Select frequency">
                        <Option value="hourly">Hourly</Option>
                        <Option value="daily">Daily</Option>
                        <Option value="weekly">Weekly</Option>
                        <Option value="monthly">Monthly</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Backup Retention (days)" name="backupRetention">
                      <InputNumber 
                        min={1} 
                        max={365} 
                        size="large" 
                        style={{ width: "100%" }}
                        placeholder="30"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Enable Cloud Backup" name="enableCloudBackup" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Backup Encryption" name="backupEncryption" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Incremental Backup" name="incrementalBackup" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Compress Backups" name="compressBackups" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Backup Verification" name="backupVerification" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Backup Location" name="backupLocation">
                  <Input 
                    placeholder="/backups/system"
                    size="large"
                  />
                </Form.Item>
              </Form>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <ApiOutlined className="text-blue-500" />
                <span>API Settings</span>
              </span>
            }
            key="4"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-6 text-gray-800">API Configuration</h2>
              <Form form={form} layout="vertical">
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Enable API" name="enableApi" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="API Version" name="apiVersion">
                      <Select size="large" placeholder="Select API version">
                        <Option value="v1">v1</Option>
                        <Option value="v2">v2</Option>
                        <Option value="beta">Beta</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Rate Limit (req/hour)" name="rateLimit">
                      <InputNumber 
                        min={100} 
                        max={10000} 
                        size="large" 
                        style={{ width: "100%" }}
                        placeholder="1000"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="API Timeout (seconds)" name="apiTimeout">
                      <InputNumber 
                        min={5} 
                        max={300} 
                        size="large" 
                        style={{ width: "100%" }}
                        placeholder="30"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Enable Swagger" name="enableSwagger" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Enable CORS" name="corsEnabled" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Enable Webhooks" name="enableWebhooks" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="API Keys Enabled" name="apiKeysEnabled" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Webhook URL" name="webhookUrl">
                  <Input 
                    placeholder="https://example.com/webhook"
                    size="large"
                  />
                </Form.Item>
              </Form>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <MonitorOutlined className="text-green-500" />
                <span>Monitoring</span>
              </span>
            }
            key="5"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-6 text-gray-800">System Monitoring</h2>
              <Form form={form} layout="vertical">
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Enable Monitoring" name="enableMonitoring" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Performance Tracking" name="performanceTracking" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Error Tracking" name="errorTracking" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Uptime Monitoring" name="uptimeMonitoring" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Resource Usage" name="resourceUsage" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Enable Reports" name="enableReports" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Alert Threshold (%)" name="alertThreshold">
                  <InputNumber 
                    min={50} 
                    max={95} 
                    size="large" 
                    style={{ width: "100%" }}
                    placeholder="80"
                  />
                </Form.Item>

                <Form.Item label="Log Retention (days)" name="logRetention">
                  <InputNumber 
                    min={7} 
                    max={365} 
                    size="large" 
                    style={{ width: "100%" }}
                    placeholder="30"
                  />
                </Form.Item>
              </Form>
            </div>
          </TabPane>

          <TabPane
            tab={
              <span className="flex items-center space-x-2">
                <MailOutlined className="text-cyan-500" />
                <span>Email</span>
              </span>
            }
            key="6"
          >
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-6 text-gray-800">Email Configuration</h2>
              <Form form={form} layout="vertical">
                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="SMTP Host" name="smtpHost">
                      <Input 
                        placeholder="smtp.example.com"
                        size="large" 
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="SMTP Port" name="smtpPort">
                      <InputNumber 
                        min={1} 
                        max={65535} 
                        size="large" 
                        style={{ width: "100%" }}
                        placeholder="587"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="SMTP Username" name="smtpUsername">
                      <Input 
                        placeholder="admin@example.com"
                        size="large" 
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="SMTP Password" name="smtpPassword">
                      <Input.Password 
                        placeholder="Enter SMTP password"
                        size="large" 
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="From Email" name="fromEmail">
                      <Input 
                        placeholder="noreply@example.com"
                        size="large" 
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="From Name" name="fromName">
                      <Input 
                        placeholder="Hospital System"
                        size="large" 
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col span={12}>
                    <Form.Item label="Enable TLS" name="enableTLS" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Email Template" name="emailTemplate">
                      <Select size="large" placeholder="Select template">
                        <Option value="default">Default</Option>
                        <Option value="modern">Modern</Option>
                        <Option value="minimal">Minimal</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </TabPane>
        </Tabs>

        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">
              Current Tab: {activeTab === "1" ? "Security" : activeTab === "2" ? "User Management" : activeTab === "3" ? "Backup" : activeTab === "4" ? "API" : activeTab === "5" ? "Monitoring" : "Email"}
            </span>
            <Space>
              <Button onClick={handleReset} disabled={loading}>
                Reset
              </Button>
              <Button type="primary" onClick={handleSave} loading={loading} icon={<SaveOutlined />}>
                Save Changes
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
}