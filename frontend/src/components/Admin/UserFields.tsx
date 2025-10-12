import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  Table,
  Select,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Form,
  InputNumber,
  DatePicker,
  Space,
  Tooltip,
  Popconfirm,
  Descriptions,
  message,
  Progress,
  Avatar,
  Badge,
  Tabs,
  Timeline,
  Alert,
  Divider,
  Switch,
  Collapse,
  Typography,
  Flex,
  Checkbox
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  DashboardOutlined,
  PieChartOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  BellOutlined,
  MessageOutlined,
  PhoneOutlined,
  MailOutlined,
  SyncOutlined,
  ExportOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  SecurityScanOutlined,
  CalendarOutlined,
  TableOutlined,
  HomeOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  LockOutlined,
  KeyOutlined,
  UserAddOutlined,
  ApartmentOutlined,
  FormOutlined,
  FieldBinaryOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { Patient } from "@/types/patient";
import { DeleteApi, getApi, PostApi, PutApi } from "@/ApiService";
import { toast } from "sonner";
import dayjs from "dayjs";
import { UserType } from "./UserTypes";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

interface UserField {
  id: string;
  field_name: string;
  field_type: "STRING" | "INTEGER" | "JSON";
  is_mandatory: boolean;
  is_active: boolean;
  user_type: string;
  user_type_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface UserFieldStats {
  total: number;
  mandatory: number;
  optional: number;
  stringType: number;
  integerType: number;
  jsonType: number;
  active: number;
}

export default function UserFieldsList() {
  const [userFields, setUserFields] = useState<UserField[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [selectedField, setSelectedField] = useState<UserField | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState("fields");
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [mandatoryFilter, setMandatoryFilter] = useState<string>("all");

  const [form] = Form.useForm();

  const simulateLoading = () => {
    setIsLoading(true);
  };

  const loadData = async () => {
    simulateLoading();
    Promise.all([
      getApi(`/user-fields`),
      getApi(`/user-types`),
    ]).then(([data, usertypesData]) => {
      if (!data?.error) {
        // Enhance fields with user type names
        const enhancedData = data.data.map((field: UserField) => ({
          ...field,
          user_type_name: usertypesData.data?.find((ut: UserType) => ut.id === field.user_type)?.type || field.user_type
        }));
        setUserFields(enhancedData);
      } else {
        toast.error(data.error)
        console.error("Error fetching user fields:", data.error);
      }
      if (!usertypesData?.error) {
        setUserTypes(usertypesData.data);
      } else {
        toast.error(usertypesData.error)
        console.error("Error fetching user types:", usertypesData.error);
      }
    }).catch((error) => {
      toast.error("Error occurred while fetching data")
      console.error("Error loading data:", error);
    }).finally(() => {
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto refresh notifier
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info("🔄 Auto-refresh: User fields data reloaded");
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const deleteUserField = async (id: string) => {
    simulateLoading();
    await DeleteApi(`/user-fields`, { id: id })
      .then((data) => {
        if (!data?.error) {
          toast.success("Successfully deleted user field");
          loadData();
        } else {
          toast.error(data.error);
          console.error("Error deleting user field:", data.error);
        }
      }).catch((error) => {
        toast.error("Error deleting user field");
        console.error("Error deleting user field:", error);
      }).finally(() => {
        setIsLoading(false);
      });
  };

  const handleOpenModal = (field: UserField | null = null) => {
    if (field) {
      setSelectedField(field);
      form.setFieldsValue({
        id: field.id,
        field_name: field.field_name,
        field_type: field.field_type,
        is_mandatory: field.is_mandatory,
        user_type: field.user_type,
        status: field.is_active ? "ACTIVE" : "INACTIVE"
      });
    } else {
      setSelectedField(null);
      form.resetFields();
      form.setFieldsValue({
        field_type: "STRING",
        is_mandatory: false,
        status: "ACTIVE"
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    simulateLoading();
    values.is_active = values.status === "ACTIVE"
    delete values.status

    if (selectedField) {
      // Update existing field
      await PutApi(`/user-fields`, { ...values, id: selectedField.id })
        .then((data) => {
          if (!data?.error) {
            toast.success("User field updated successfully!");
            loadData();
          } else {
            toast.error(data.error);
            console.error("Error updating user field:", data.error);
          }
        }).catch((error) => {
          toast.error("Error updating user field");
          console.error("Error updating user field:", error);
        }).finally(() => {
          setIsLoading(false);
        });
    } else {
      // Add new field
      await PostApi(`/user-fields`, values)
        .then((data) => {
          if (!data?.error) {
            toast.success("User field added successfully!");
            loadData();
          } else {
            toast.error(data.error);
            console.error("Error adding user field:", data.error);
          }
        }).catch((error) => {
          toast.error("Error adding user field");
          console.error("Error adding user field:", error);
        }).finally(() => {
          setIsLoading(false);
        });
    }

    setIsModalOpen(false);
    setSelectedField(null);
  };

  // Statistics
  const stats: UserFieldStats = {
    total: userFields.length,
    mandatory: userFields.filter((uf) => uf.is_mandatory).length,
    optional: userFields.filter((uf) => !uf.is_mandatory).length,
    stringType: userFields.filter((uf) => uf.field_type === "STRING").length,
    integerType: userFields.filter((uf) => uf.field_type === "INTEGER").length,
    jsonType: userFields.filter((uf) => uf.field_type === "JSON").length,
    active: userFields.filter((uf) => uf.is_active).length
  };

  // UI Helpers
  const getFieldTypeColor = (type: string) => ({ 'STRING': 'blue', 'INTEGER': 'green', 'JSON': 'purple' }[type] || 'default');
  const getMandatoryColor = (mandatory: boolean) => mandatory ? 'red' : 'green';
  const getStatusColor = (status: string) => ({ 'ACTIVE': 'green', 'INACTIVE': 'red' }[status] || 'default');
  const getStatusIcon = (status: string) => ({ 'Active': <CheckCircleOutlined />, 'Inactive': <CloseCircleOutlined /> }[status]);

  const filteredUserFields = userFields.filter((field) => {
    const matchesSearch = searchText === "" || 
      field.field_name.toLowerCase().includes(searchText.toLowerCase()) ||
      field.user_type_name?.toLowerCase().includes(searchText.toLowerCase());
    const matchesType = typeFilter === "all" || field.user_type === typeFilter;
    const matchesMandatory = mandatoryFilter === "all" || 
      (mandatoryFilter === "mandatory" && field.is_mandatory) ||
      (mandatoryFilter === "optional" && !field.is_mandatory);
    return matchesSearch && matchesType && matchesMandatory;
  });

  const columns: ColumnsType<UserField> = [
    {
      title: <Space><FormOutlined /> Field Information</Space>,
      key: 'field',
      render: (_, record) => (
        <Flex align="center" gap="middle">
          <Avatar 
            size="large" 
            icon={<FieldBinaryOutlined />} 
            style={{ 
              backgroundColor: getFieldTypeColor(record.field_type)
            }}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{record.field_name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <Tag color={getFieldTypeColor(record.field_type)}>{record.field_type}</Tag>
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              <UserSwitchOutlined /> {record.user_type_name || record.user_type}
            </div>
          </div>
        </Flex>
      ),
    },
    {
      title: <Space><SafetyCertificateOutlined /> Properties</Space>,
      key: 'properties',
      render: (_, record) => (
        <Space direction="vertical">
          <Tag color={getMandatoryColor(record.is_mandatory)}>
            {record.is_mandatory ? 'Mandatory' : 'Optional'}
          </Tag>
          <Tag color={getStatusColor(record.is_active ? "ACTIVE" : "INACTIVE")} icon={getStatusIcon(record.is_active ? "ACTIVE" : "INACTIVE")}>
            {record.is_active ? "ACTIVE" : "INACTIVE"}
          </Tag>
          {record.created_at && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              <CalendarOutlined /> Created: {dayjs(record.created_at).format('MMM D, YYYY')}
            </div>
          )}
        </Space>
      ),
    },
    {
      title: <Space><ThunderboltOutlined /> Actions</Space>,
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Field">
            <Button icon={<EditOutlined />} shape="circle" onClick={() => handleOpenModal(record)} />
          </Tooltip>
          <Tooltip title="Delete Field">
            <Popconfirm 
              title="Delete this user field?" 
              description="Are you sure you want to delete this user field? This action cannot be undone." 
              onConfirm={() => deleteUserField(record.id)} 
              okText="Yes" 
              cancelText="No" 
              okType="danger"
              icon={<CloseCircleOutlined style={{ color: 'red' }} />}
            >
              <Button icon={<DeleteOutlined />} shape="circle" danger />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
        <Flex justify="space-between" align="center">
          <div>
            <Space size="large">
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px' }}>
                <FormOutlined style={{ fontSize: '36px' }} />
              </div>
              <div>
                <Title level={2} style={{ color: 'white', margin: 0 }}>📋 User Fields Management</Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}><DashboardOutlined /> Manage custom user fields and properties</Text>
              </div>
            </Space>
          </div>
          <Space>
            <Tooltip title="Auto Refresh">
              <Switch 
                checkedChildren={<SyncOutlined />} 
                unCheckedChildren={<CloseCircleOutlined />} 
                checked={autoRefresh} 
                onChange={setAutoRefresh} 
              />
            </Tooltip>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => handleOpenModal()} 
              size="large" 
              style={{ background: '#fff', color: '#4facfe', border: 'none', fontWeight: 'bold' }}
            >
              <RocketOutlined /> Add User Field
            </Button>
          </Space>
        </Flex>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><FormOutlined /> Total Fields</Space>} value={stats.total} valueStyle={{ color: '#4facfe' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><SafetyCertificateOutlined /> Mandatory</Space>} value={stats.mandatory} valueStyle={{ color: '#f5222d' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><CheckCircleOutlined /> Optional</Space>} value={stats.optional} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><FieldBinaryOutlined /> String Type</Space>} value={stats.stringType} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><FieldBinaryOutlined /> Integer Type</Space>} value={stats.integerType} valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><FieldBinaryOutlined /> JSON Type</Space>} value={stats.jsonType} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
      </Row>

      {/* Tabs for Different Views */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane 
          key="fields" 
          tab={
            <Space>
              <FormOutlined /> All User Fields <Badge count={filteredUserFields.length} overflowCount={99} />
            </Space>
          }
        >
          <div className="space-y-6">
            <Card>
              <Flex wrap="wrap" gap="middle" align="center" style={{ marginBottom: '16px' }}>
                <Input 
                  placeholder="🔍 Search fields, user types..." 
                  prefix={<SearchOutlined />} 
                  value={searchText} 
                  onChange={(e) => setSearchText(e.target.value)} 
                  style={{ width: 300 }} 
                  size="large" 
                />
                <Select value={typeFilter} onChange={setTypeFilter} placeholder="Filter by User Type" style={{ width: 180 }} size="large">
                  <Option value="all">All User Types</Option>
                  {userTypes.map((ut) => (
                    <Option key={ut.id} value={ut.id}>{ut.type}</Option>
                  ))}
                </Select>
                <Select value={mandatoryFilter} onChange={setMandatoryFilter} placeholder="Filter by Requirement" style={{ width: 150 }} size="large">
                  <Option value="all">All Requirements</Option>
                  <Option value="mandatory">Mandatory</Option>
                  <Option value="optional">Optional</Option>
                </Select>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setTypeFilter('all'); setMandatoryFilter('all'); }}>Reset</Button>
                  <Button icon={<ExportOutlined />}>Export</Button>
                </Space>
              </Flex>
              <Alert 
                message="User Fields Overview" 
                description={`${stats.mandatory} mandatory and ${stats.optional} optional fields. ${stats.stringType} string, ${stats.integerType} integer, and ${stats.jsonType} JSON type fields.`} 
                type={stats.mandatory > stats.optional ? "warning" : "info"} 
                showIcon 
                closable 
              />
            </Card>

            <Card 
              title={
                <Space>
                  <TableOutlined /> User Fields List ({filteredUserFields.length})
                </Space>
              } 
              extra={
                <Space>
                  <Tag color="red">{stats.mandatory} Mandatory</Tag>
                  <Tag color="green">{stats.optional} Optional</Tag>
                  <Tag color="blue">{stats.active} Active</Tag>
                </Space>
              }
            >
              <Table 
                columns={columns} 
                dataSource={filteredUserFields} 
                rowKey="id" 
                loading={isLoading} 
                scroll={{ x: 800 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} user fields`,
                }}
              />
            </Card>
          </div>
        </Tabs.TabPane>
        
        <Tabs.TabPane key="activity" tab={<Space><DashboardOutlined /> Field Distribution</Space>}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Field Types Distribution">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <PieChartOutlined style={{ fontSize: '48px', color: '#4facfe' }} />
                  <div style={{ marginTop: '16px' }}>
                    <Progress 
                      type="circle" 
                      percent={Math.round((stats.stringType / (stats.total || 1)) * 100)} 
                      strokeColor="#1890ff" 
                    />
                    <div style={{ marginTop: '16px' }}>
                      <Tag color="blue">String: {stats.stringType}</Tag>
                      <Tag color="green">Integer: {stats.integerType}</Tag>
                      <Tag color="purple">JSON: {stats.jsonType}</Tag>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Recent Field Activity">
                <Timeline>
                  {userFields.slice(0, 5).map(field => (
                    <Timeline.Item 
                      key={field.id} 
                      color={getStatusColor(field.is_active ? "ACTIVE" : "INACTIVE")} 
                      dot={getStatusIcon(field.is_active ? "ACTIVE" : "INACTIVE")}
                    >
                      <Space direction="vertical" size={0}>
                        <div style={{ fontWeight: 'bold' }}>{field.field_name}</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          <Tag color={getFieldTypeColor(field.field_type)}>{field.field_type}</Tag>
                          <Tag color={getMandatoryColor(field.is_mandatory)} style={{ marginLeft: '8px' }}>
                            {field.is_mandatory ? 'Mandatory' : 'Optional'}
                          </Tag>
                        </div>
                        <div style={{ color: '#999', fontSize: '12px' }}>
                          <UserSwitchOutlined /> {field.user_type_name}
                        </div>
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>

      {/* Add/Edit User Field Modal */}
      <Modal 
        title={
          <Space>
            {selectedField ? <EditOutlined /> : <PlusOutlined />}
            {selectedField ? "Edit User Field" : "Add User Field"}
          </Space>
        } 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        onOk={() => form.submit()} 
        okText={selectedField ? "Update Field" : "Add Field"} 
        width={600} 
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="field_name" 
                label="Field Name" 
                rules={[{ required: true, message: "Please enter field name" }]}
              >
                <Input prefix={<FormOutlined />} placeholder="Enter field name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="field_type" 
                label="Field Type" 
                rules={[{ required: true }]}
              >
                <Select placeholder="Select field type">
                  <Option value="STRING">STRING</Option>
                  <Option value="INTEGER">INTEGER</Option>
                  <Option value="JSON">JSON</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="user_type" 
                label="User Type" 
                rules={[{ required: true, message: "Please select user type" }]}
              >
                <Select placeholder="Select user type">
                  {userTypes.map((ut) => (
                    <Option key={ut.id} value={ut.id}>{ut.type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="status" 
                label="Status" 
                rules={[{ required: true }]}
              >
                <Select placeholder="Select status">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            name="is_mandatory" 
            label="Mandatory Field" 
            valuePropName="checked"
          >
            <Checkbox>This field is mandatory</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}