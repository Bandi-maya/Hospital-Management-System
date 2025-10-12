// src/pages/Settings.tsx
import { useState, useEffect, useMemo } from "react";
import { 
  Card, 
  Input, 
  Button, 
  Select, 
  Modal, 
  Form, 
  Space, 
  Tooltip, 
  Tag, 
  Row, 
  Col, 
  Statistic, 
  Avatar, 
  Descriptions, 
  Divider,
  Switch,
  message,
  Tabs
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  BellOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  IdcardOutlined,
  LockOutlined,
  KeyOutlined,
  SaveOutlined,
  SyncOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  MoonOutlined,
  SunOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { countries } from "@/components/Patients/AddPatient";
import { getApi, PostApi, PutApi } from "@/ApiService";
import { DepartmentInterface } from "@/components/Departments/Departments";
import { useAuth } from "@/hooks/useAuth";
import dayjs from "dayjs";

const { Option } = Select;

export default function Settings() {
  const [form] = Form.useForm();
  const { user }: any = useAuth();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [extraFields, setExtraFields] = useState<any>([]);
  const [activeTab, setActiveTab] = useState("profile");

  const [settings, setSettings] = useState({
    profile: {
      name: "",
      email: "",
      password: "",
    },
    preferences: {
      darkMode: false,
      notifications: true,
      autoSave: true,
      language: "en",
      timezone: "UTC",
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      sessionTimeout: 30,
    }
  });

  useEffect(() => {
    if (user) {
      const userForm = {
        address: {
          street: user?.address?.street,
          city: user?.address?.city,
          state: user?.address?.state,
          country: user?.address?.country,
          zip_code: user?.address?.zip_code,
        },
        department_id: user?.department_id,
        date_of_birth: user?.date_of_birth?.split("T")[0],
        gender: user?.gender,
        extra_fields: user?.extra_fields?.fields_data,
        email: user?.email,
        phone_no: user?.phone_no,
      };
      
      form.setFieldsValue(userForm);
      setSettings(prev => ({
        ...prev,
        profile: {
          name: user?.name || "",
          email: user?.email || "",
          password: ""
        }
      }));
    }
  }, [user, form]);

  const getExtraFields = () => {
    getApi("/user-fields")
      .then((data) => {
        if (!data?.error) {
          setExtraFields(data.data.filter((field) => field.user_type_data.type.toUpperCase() === "NURSE"));
        } else {
          message.error("Error fetching fields: " + data.error);
        }
      })
      .catch((error) => {
        message.error("Error fetching fields");
        console.error("Error:", error);
      });
  };

  const handleSubmit = () => {
    setLoading(true);
    const formValues = form.getFieldsValue();
    
    if (!formValues.gender || !formValues.date_of_birth || !formValues.address?.city || 
        !formValues.address?.state || !formValues.address?.zip_code || !formValues.address?.country || 
        !formValues.email || !formValues.phone_no) {
      message.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    formValues.name = formValues?.extra_fields?.first_name + " " + formValues?.extra_fields?.last_name;

    if (user) {
      PutApi(`/users`, { ...formValues, id: user.id, user_type_id: user.user_type_id })
        .then((data) => {
          if (!data?.error) {
            message.success("Profile updated successfully!");
          } else {
            message.error(data.error);
          }
        })
        .catch((error) => {
          message.error("Error updating profile");
          console.error("Error:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleSettingsUpdate = (section: string, values: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof typeof prev], ...values }
    }));
    message.success("Settings updated successfully!");
  };

  const getStatusTag = (enabled: boolean) => (
    <Tag color={enabled ? "green" : "red"} icon={enabled ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
      {enabled ? "Enabled" : "Disabled"}
    </Tag>
  );

  return (
    <div className="p-6 space-y-6" style={{ background: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Card
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <SettingOutlined style={{ fontSize: "36px" }} />
              <div>
                <h1 style={{ color: "white", margin: 0 }}>Settings & Preferences</h1>
                <p style={{ margin: 0, color: "#ddd" }}>
                  <DashboardOutlined /> Manage your account settings and preferences
                </p>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tooltip title="Auto Save">
                <Switch
                  checkedChildren={<CheckCircleOutlined />}
                  unCheckedChildren={<CloseCircleOutlined />}
                  checked={settings.preferences.autoSave}
                  onChange={(checked) => handleSettingsUpdate("preferences", { autoSave: checked })}
                />
              </Tooltip>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={loading}
                style={{ background: "#52c41a", borderColor: "#52c41a" }}
              >
                <RocketOutlined /> Save Changes
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Profile Completion"
              value={75}
              suffix="%"
              valueStyle={{ color: "#52c41a" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Security Score"
              value={85}
              suffix="%"
              valueStyle={{ color: "#1890ff" }}
              prefix={<SecurityScanOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="Notifications"
              value={settings.preferences.notifications ? "Enabled" : "Disabled"}
              valueStyle={{ color: settings.preferences.notifications ? "#52c41a" : "#f5222d" }}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="2FA Status"
              value={settings.security.twoFactorEnabled ? "Enabled" : "Disabled"}
              valueStyle={{ color: settings.security.twoFactorEnabled ? "#52c41a" : "#f5222d" }}
              prefix={<LockOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "profile",
            label: (
              <Space>
                <UserOutlined /> Profile Settings
              </Space>
            ),
            children: (
              <Card>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                  <Row gutter={[24, 16]}>
                    {/* Personal Information */}
                    <Col span={24}>
                      <div style={{ 
                        padding: "16px", 
                        background: "#fafafa", 
                        borderRadius: "8px",
                        marginBottom: "24px"
                      }}>
                        <Space>
                          <UserOutlined style={{ color: "#1890ff" }} />
                          <h3 style={{ margin: 0, color: "#1890ff" }}>Personal Information</h3>
                        </Space>
                      </div>
                    </Col>
                    
                    {extraFields.map((field: any) => (
                      <Col xs={24} md={12} key={field.id}>
                        <Form.Item
                          name={['extra_fields', field.field_name]}
                          label={field.field_name}
                          rules={[{ required: true, message: `Please enter ${field.field_name}` }]}
                        >
                          <Input 
                            size="large"
                            placeholder={`Enter ${field.field_name}`}
                            prefix={<UserOutlined />}
                          />
                        </Form.Item>
                      </Col>
                    ))}

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="date_of_birth"
                        label="Date of Birth"
                        rules={[{ required: true, message: "Please select date of birth" }]}
                      >
                        <Input 
                          type="date"
                          size="large"
                          prefix={<CalendarOutlined />}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="gender"
                        label="Gender"
                        rules={[{ required: true, message: "Please select gender" }]}
                      >
                        <Select
                          size="large"
                          placeholder="Select gender"
                          suffixIcon={<UserOutlined />}
                        >
                          <Option value="MALE">Male</Option>
                          <Option value="FEMALE">Female</Option>
                          <Option value="OTHER">Other</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    {/* Contact Information */}
                    <Col span={24}>
                      <div style={{ 
                        padding: "16px", 
                        background: "#fafafa", 
                        borderRadius: "8px",
                        margin: "24px 0"
                      }}>
                        <Space>
                          <MailOutlined style={{ color: "#1890ff" }} />
                          <h3 style={{ margin: 0, color: "#1890ff" }}>Contact Information</h3>
                        </Space>
                      </div>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                          { required: true, message: "Please enter email" },
                          { type: "email", message: "Please enter valid email" }
                        ]}
                      >
                        <Input 
                          size="large"
                          placeholder="Email address"
                          prefix={<MailOutlined />}
                          disabled
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="phone_no"
                        label="Phone Number"
                        rules={[{ required: true, message: "Please enter phone number" }]}
                      >
                        <Input 
                          size="large"
                          placeholder="Phone number"
                          prefix={<PhoneOutlined />}
                        />
                      </Form.Item>
                    </Col>

                    {/* Address Information */}
                    <Col span={24}>
                      <div style={{ 
                        padding: "16px", 
                        background: "#fafafa", 
                        borderRadius: "8px",
                        margin: "24px 0"
                      }}>
                        <Space>
                          <EnvironmentOutlined style={{ color: "#1890ff" }} />
                          <h3 style={{ margin: 0, color: "#1890ff" }}>Address Information</h3>
                        </Space>
                      </div>
                    </Col>

                    <Col span={24}>
                      <Form.Item
                        name={['address', 'street']}
                        label="Street Address"
                        rules={[{ required: true, message: "Please enter street address" }]}
                      >
                        <Input 
                          size="large"
                          placeholder="Street address"
                          prefix={<EnvironmentOutlined />}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name={['address', 'city']}
                        label="City"
                        rules={[{ required: true, message: "Please enter city" }]}
                      >
                        <Input 
                          size="large"
                          placeholder="City"
                        prefix={<EnvironmentOutlined />}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name={['address', 'state']}
                        label="State"
                        rules={[{ required: true, message: "Please enter state" }]}
                      >
                        <Input 
                          size="large"
                          placeholder="State"
                          prefix={<EnvironmentOutlined />}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name={['address', 'zip_code']}
                        label="ZIP Code"
                        rules={[{ required: true, message: "Please enter ZIP code" }]}
                      >
                        <Input 
                          size="large"
                          placeholder="ZIP code"
                          prefix={<EnvironmentOutlined />}
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name={['address', 'country']}
                        label="Country"
                        rules={[{ required: true, message: "Please select country" }]}
                      >
                        <Select
                          size="large"
                          placeholder="Select country"
                          showSearch
                          optionFilterProp="children"
                          suffixIcon={<EnvironmentOutlined />}
                        >
                          {countries.map((country) => (
                            <Option key={country} value={country}>
                              {country}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>
            ),
          },
          {
            key: "preferences",
            label: (
              <Space>
                <DashboardOutlined /> Preferences
              </Space>
            ),
            children: (
              <Card>
                <Row gutter={[24, 16]}>
                  <Col span={24}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div style={{ 
                        padding: "16px", 
                        background: "#fafafa", 
                        borderRadius: "8px",
                        marginBottom: "16px"
                      }}>
                        <h3 style={{ margin: 0, color: "#1890ff" }}>Appearance & Behavior</h3>
                      </div>
                      
                      <Card size="small">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                          <Space>
                            {settings.preferences.darkMode ? <MoonOutlined /> : <SunOutlined />}
                            <span>Dark Mode</span>
                          </Space>
                          <Switch
                            checked={settings.preferences.darkMode}
                            onChange={(checked) => handleSettingsUpdate("preferences", { darkMode: checked })}
                          />
                        </div>
                      </Card>

                      <Card size="small">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                          <Space>
                            <BellOutlined />
                            <span>Push Notifications</span>
                          </Space>
                          <Switch
                            checked={settings.preferences.notifications}
                            onChange={(checked) => handleSettingsUpdate("preferences", { notifications: checked })}
                          />
                        </div>
                      </Card>

                      <Card size="small">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                          <Space>
                            <SaveOutlined />
                            <span>Auto Save</span>
                          </Space>
                          <Switch
                            checked={settings.preferences.autoSave}
                            onChange={(checked) => handleSettingsUpdate("preferences", { autoSave: checked })}
                          />
                        </div>
                      </Card>
                    </Space>
                  </Col>
                </Row>
              </Card>
            ),
          },
          {
            key: "security",
            label: (
              <Space>
                <SecurityScanOutlined /> Security
              </Space>
            ),
            children: (
              <Card>
                <Row gutter={[24, 16]}>
                  <Col span={24}>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div style={{ 
                        padding: "16px", 
                        background: "#fafafa", 
                        borderRadius: "8px",
                        marginBottom: "16px"
                      }}>
                        <h3 style={{ margin: 0, color: "#1890ff" }}>Security Settings</h3>
                      </div>
                      
                      <Card size="small">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                          <Space>
                            <LockOutlined />
                            <div>
                              <div>Two-Factor Authentication</div>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                Add an extra layer of security to your account
                              </div>
                            </div>
                          </Space>
                          <Switch
                            checked={settings.security.twoFactorEnabled}
                            onChange={(checked) => handleSettingsUpdate("security", { twoFactorEnabled: checked })}
                          />
                        </div>
                      </Card>

                      <Card size="small">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                          <Space>
                            <BellOutlined />
                            <div>
                              <div>Login Alerts</div>
                              <div style={{ fontSize: "12px", color: "#666" }}>
                                Get notified of new sign-ins
                              </div>
                            </div>
                          </Space>
                          <Switch
                            checked={settings.security.loginAlerts}
                            onChange={(checked) => handleSettingsUpdate("security", { loginAlerts: checked })}
                          />
                        </div>
                      </Card>
                    </Space>
                  </Col>
                </Row>
              </Card>
            ),
          },
        ]}
      />

      {/* Action Buttons */}
      <Card>
        <Row justify="end" gutter={16}>
          <Col>
            <Button 
              size="large"
              onClick={() => form.resetFields()}
            >
              Reset Changes
            </Button>
          </Col>
          <Col>
            <Button 
              type="primary" 
              size="large"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={handleSubmit}
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
            >
              Save All Changes
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}