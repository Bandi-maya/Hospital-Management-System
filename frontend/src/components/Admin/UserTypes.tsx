// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   Button,
//   Input,
//   Table,
//   Select,
//   Card,
//   Row,
//   Col,
//   Statistic,
//   Tag,
//   Form,
//   InputNumber,
//   DatePicker,
//   Space,
//   Tooltip,
//   Popconfirm,
//   Descriptions,
//   message,
//   Progress,
//   Avatar,
//   Badge,
//   Tabs,
//   Timeline,
//   Alert,
//   Divider,
//   Switch,
//   Collapse,
//   Typography,
//   Flex
// } from "antd";
// import {
//   UserOutlined,
//   TeamOutlined,
//   UserSwitchOutlined,
//   CheckCircleOutlined,
//   CloseCircleOutlined,
//   PlusOutlined,
//   EditOutlined,
//   DeleteOutlined,
//   EyeOutlined,
//   SearchOutlined,
//   SafetyCertificateOutlined,
//   MedicineBoxOutlined,
//   ExperimentOutlined,
//   DashboardOutlined,
//   PieChartOutlined,
//   ThunderboltOutlined,
//   RocketOutlined,
//   BellOutlined,
//   MessageOutlined,
//   PhoneOutlined,
//   MailOutlined,
//   SyncOutlined,
//   ExportOutlined,
//   ReloadOutlined,
//   InfoCircleOutlined,
//   ClockCircleOutlined,
//   CrownOutlined,
//   SecurityScanOutlined,
//   CalendarOutlined,
//   TableOutlined,
//   HomeOutlined,
//   IdcardOutlined,
//   EnvironmentOutlined,
//   LockOutlined,
//   KeyOutlined,
//   UserAddOutlined,
//   ApartmentOutlined
// } from "@ant-design/icons";
// import type { ColumnsType } from "antd/es/table";
// import { useNavigate } from "react-router-dom";
// import { Patient } from "@/types/patient";
// import { DeleteApi, getApi, PostApi, PutApi } from "@/ApiService";
// import { toast } from "sonner";
// import dayjs from "dayjs"; // Add this import

// const { Option } = Select;
// const { TextArea } = Input;
// const { Title, Text } = Typography;

export interface UserType {
  id: string;
  type: string;
  description: string;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
  userCount?: number;
}

// interface UserTypeStats {
//   total: number;
//   active: number;
//   inactive: number;
//   recentAdded: number;
// }

// export default function UserTypesList() {
//   const [userTypes, setUserTypes] = useState<UserType[]>([]);
//   const navigate = useNavigate();
//   const [selectedType, setSelectedType] = useState<UserType | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [autoRefresh, setAutoRefresh] = useState(true);
//   const [activeTab, setActiveTab] = useState("types");
//   const [searchText, setSearchText] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("all");

//   const [form] = Form.useForm();

//   // Initial Sample Data
//   const loadData = async () => {
//     simulateLoading();
//     await getApi(`/user-types`)
//       .then((data) => {
//         if (!data?.error) {
//           setUserTypes(data.data);
//         } else {
//           toast.error(data.error)
//           console.error("Error fetching user types:", data.error);
//         }
//       }).catch((error) => {
//         toast.error("Error occurred while fetching user types")
//         console.error("Error fetching user types:", error);
//       }).finally(() => {
//         setIsLoading(false);
//       })
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   // Auto refresh notifier
//   useEffect(() => {
//     if (autoRefresh) {
//       const interval = setInterval(() => {
//         message.info("🔄 Auto-refresh: User types data reloaded");
//       }, 30000);
//       return () => clearInterval(interval);
//     }
//   }, [autoRefresh]);

//   const deleteUserType = async (id: string) => {
//     simulateLoading();
//     await DeleteApi(`/user-types`, { id: id })
//       .then((data) => {
//         if (!data?.error) {
//           toast.success("Successfully deleted user type");
//           loadData();
//         } else {
//           toast.error(data.error);
//           console.error("Error deleting user type:", data.error);
//         }
//       }).catch((error) => {
//         toast.error("Error deleting user type");
//         console.error("Error deleting user type:", error);
//       }).finally(() => {
//         setIsLoading(false);
//       })
//   };

//   const simulateLoading = () => {
//     setIsLoading(true);
//   };

//   const handleOpenModal = (userType: UserType | null = null) => {
//     if (userType) {
//       setSelectedType(userType);
//       form.setFieldsValue({
//         id: userType.id,
//         type: userType.type,
//         description: userType.description,
//         status: userType.is_active ? "ACTIVE" : "INACTIVE"
//       });
//     } else {
//       setSelectedType(null);
//       form.resetFields();
//       form.setFieldsValue({
//         status: "ACTIVE"
//       });
//     }
//     setIsModalOpen(true);
//   };

//   const handleSubmit = async (values: any) => {
//     simulateLoading();
//     values.is_active = values.status === 'ACTIVE'
//     delete values.status;

//     if (selectedType) {
//       // Update existing user type
//       await PutApi(`/user-types`, { ...values, id: selectedType.id })
//         .then((data) => {
//           if (!data?.error) {
//             toast.success("User type updated successfully!");
//             loadData();
//           } else {
//             toast.error(data.error);
//             console.error("Error updating user type:", data.error);
//           }
//         }).catch((error) => {
//           toast.error("Error updating user type");
//           console.error("Error updating user type:", error);
//         }).finally(() => {
//           setIsLoading(false);
//         })
//     } else {
//       // Add new user type
//       await PostApi(`/user-types`, values)
//         .then((data) => {
//           if (!data?.error) {
//             toast.success("User type added successfully!");
//             loadData();
//           } else {
//             toast.error(data.error);
//             console.error("Error adding user type:", data.error);
//           }
//         }).catch((error) => {
//           toast.error("Error adding user type");
//           console.error("Error adding user type:", error);
//         }).finally(() => {
//           setIsLoading(false);
//         })
//     }

//     setIsModalOpen(false);
//     setSelectedType(null);
//   };

//   // Statistics
//   const stats: UserTypeStats = {
//     total: userTypes.length,
//     active: userTypes.filter((ut) => ut.is_active).length,
//     inactive: userTypes.filter((ut) => !ut.is_active).length,
//     recentAdded: userTypes.filter((ut) =>
//       dayjs(ut.createdAt).isAfter(dayjs().subtract(7, 'day'))
//     ).length
//   };

//   // UI Helpers
//   const getStatusColor = (status: string) => ({ 'Active': 'green', 'Inactive': 'red' }[status] || 'default');
//   const getStatusIcon = (status: string) => ({ 'Active': <CheckCircleOutlined />, 'Inactive': <CloseCircleOutlined /> }[status]);

//   const filteredUserTypes = userTypes.filter((userType) => {
//     const matchesSearch = searchText === "" ||
//       userType.type.toLowerCase().includes(searchText.toLowerCase()) ||
//       userType.description.toLowerCase().includes(searchText.toLowerCase());
//     const matchesStatus = statusFilter === "all" || (userType.is_active ? "ACTIVE" : "INACTIVE") === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   const columns: ColumnsType<UserType> = [
//     {
//       title: <Space><ApartmentOutlined /> User Type Information</Space>,
//       key: 'type',
//       render: (_, record) => (
//         <Flex align="center" gap="middle">
//           <Avatar
//             size="large"
//             icon={<UserSwitchOutlined />}
//             style={{
//               backgroundColor: record.is_active ? '#52c41a' : '#f5222d'
//             }}
//           />
//           <div>
//             <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{record.type}</div>
//             <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
//             {record.userCount && (
//               <div style={{ fontSize: '12px', color: '#999' }}>
//                 <TeamOutlined /> {record.userCount} users
//               </div>
//             )}
//           </div>
//         </Flex>
//       ),
//     },
//     {
//       title: <Space><SafetyCertificateOutlined /> Status</Space>,
//       key: 'status',
//       render: (_, record) => (
//         <Space direction="vertical">
//           <Tag color={getStatusColor(record.is_active ? "ACTIVE" : "INACTIVE")} icon={getStatusIcon(record.is_active ? "ACTIVE" : "INACTIVE")} style={{ fontWeight: 'bold' }}>
//             {record.is_active ? "ACTIVE" : "INACTIVE"}
//           </Tag>
//           {record.createdAt && (
//             <div style={{ fontSize: '12px', color: '#666' }}>
//               <CalendarOutlined /> Created: {dayjs(record.createdAt).format('MMM D, YYYY')}
//             </div>
//           )}
//         </Space>
//       ),
//     },
//     {
//       title: <Space><ThunderboltOutlined /> Actions</Space>,
//       key: 'actions',
//       render: (_, record) => (
//         <Space>
//           <Tooltip title="Edit User Type">
//             <Button icon={<EditOutlined />} shape="circle" onClick={() => handleOpenModal(record)} />
//           </Tooltip>
//           <Tooltip title="Delete User Type">
//             <Popconfirm
//               title="Delete this user type?"
//               description="Are you sure you want to delete this user type? This action cannot be undone."
//               onConfirm={() => deleteUserType(record.id)}
//               okText="Yes"
//               cancelText="No"
//               okType="danger"
//               icon={<CloseCircleOutlined style={{ color: 'red' }} />}
//             >
//               <Button icon={<DeleteOutlined />} shape="circle" danger />
//             </Popconfirm>
//           </Tooltip>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div className="p-6 space-y-6" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
//       {/* Header */}
//       <Card style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
//         <Flex justify="space-between" align="center">
//           <div>
//             <Space size="large">
//               <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px' }}>
//                 <ApartmentOutlined style={{ fontSize: '36px' }} />
//               </div>
//               <div>
//                 <Title level={2} style={{ color: 'white', margin: 0 }}>👥 User Types Management</Title>
//                 <Text style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}><DashboardOutlined /> Manage user roles and access types</Text>
//               </div>
//             </Space>
//           </div>
//           <Space>
//             <Tooltip title="Auto Refresh">
//               <Switch
//                 checkedChildren={<SyncOutlined />}
//                 unCheckedChildren={<CloseCircleOutlined />}
//                 checked={autoRefresh}
//                 onChange={setAutoRefresh}
//               />
//             </Tooltip>
//             <Button
//               type="primary"
//               icon={<PlusOutlined />}
//               onClick={() => handleOpenModal()}
//               size="large"
//               style={{ background: '#fff', color: '#f5576c', border: 'none', fontWeight: 'bold' }}
//             >
//               <RocketOutlined /> Add User Type
//             </Button>
//           </Space>
//         </Flex>
//       </Card>

//       {/* Statistics Cards */}
//       <Row gutter={[16, 16]}>
//         <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><ApartmentOutlined /> Total Types</Space>} value={stats.total} valueStyle={{ color: '#f5576c' }} /></Card></Col>
//         <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><CheckCircleOutlined /> Active</Space>} value={stats.active} valueStyle={{ color: '#52c41a' }} /></Card></Col>
//         <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><CloseCircleOutlined /> Inactive</Space>} value={stats.inactive} valueStyle={{ color: '#f5222d' }} /></Card></Col>
//         <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><TeamOutlined /> Recent Added</Space>} value={stats.recentAdded} valueStyle={{ color: '#1890ff' }} /></Card></Col>
//         <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><UserSwitchOutlined /> Avg Users/Type</Space>} value={userTypes.length > 0 ? Math.round(userTypes.reduce((acc, ut) => acc + (ut.userCount || 0), 0) / userTypes.length) : 0} valueStyle={{ color: '#722ed1' }} /></Card></Col>
//         <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><DashboardOutlined /> Utilization</Space>} value={Math.round((stats.active / (stats.total || 1)) * 100)} suffix="%" valueStyle={{ color: '#fa8c16' }} /></Card></Col>
//       </Row>

//       {/* Tabs for Different Views */}
//       <Tabs activeKey={activeTab} onChange={setActiveTab}>
//         <Tabs.TabPane
//           key="types"
//           tab={
//             <Space>
//               <ApartmentOutlined /> All User Types <Badge count={filteredUserTypes.length} overflowCount={99} />
//             </Space>
//           }
//         >
//           <div className="space-y-6">
//             <Card>
//               <Flex wrap="wrap" gap="middle" align="center" style={{ marginBottom: '16px' }}>
//                 <Input
//                   placeholder="🔍 Search user types, descriptions..."
//                   prefix={<SearchOutlined />}
//                   value={searchText}
//                   onChange={(e) => setSearchText(e.target.value)}
//                   style={{ width: 300 }}
//                   size="large"
//                 />
//                 <Select value={statusFilter} onChange={setStatusFilter} placeholder="Filter by Status" style={{ width: 150 }} size="large">
//                   <Option value="all">All Status</Option>
//                   <Option value="Active">Active</Option>
//                   <Option value="Inactive">Inactive</Option>
//                 </Select>
//                 <Space>
//                   <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setStatusFilter('all'); }}>Reset</Button>
//                   <Button icon={<ExportOutlined />}>Export</Button>
//                 </Space>
//               </Flex>
//               <Alert
//                 message="User Types Overview"
//                 description={`${stats.active} active and ${stats.inactive} inactive user types. ${stats.recentAdded} types added in the last 7 days.`}
//                 type={stats.inactive > 0 ? "warning" : "info"}
//                 showIcon
//                 closable
//               />
//             </Card>

//             <Card
//               title={
//                 <Space>
//                   <TableOutlined /> User Types List ({filteredUserTypes.length})
//                 </Space>
//               }
//               extra={
//                 <Space>
//                   <Tag color="green">{stats.active} Active</Tag>
//                   <Tag color="red">{stats.inactive} Inactive</Tag>
//                 </Space>
//               }
//             >
//               <Table
//                 columns={columns}
//                 dataSource={filteredUserTypes}
//                 rowKey="id"
//                 loading={isLoading}
//                 scroll={{ x: 800 }}
//                 pagination={{
//                   pageSize: 10,
//                   showSizeChanger: true,
//                   showQuickJumper: true,
//                   showTotal: (total, range) =>
//                     `${range[0]}-${range[1]} of ${total} user types`,
//                 }}
//               />
//             </Card>
//           </div>
//         </Tabs.TabPane>

//         <Tabs.TabPane key="activity" tab={<Space><DashboardOutlined /> Recent Activity</Space>}>
//           <Row gutter={[16, 16]}>
//             <Col span={12}>
//               <Card title="User Types Distribution">
//                 <div style={{ textAlign: 'center', padding: '20px' }}>
//                   <PieChartOutlined style={{ fontSize: '48px', color: '#f5576c' }} />
//                   <div style={{ marginTop: '16px' }}>
//                     <Progress
//                       type="circle"
//                       percent={Math.round((stats.active / (stats.total || 1)) * 100)}
//                       strokeColor="#52c41a"
//                     />
//                     <div style={{ marginTop: '16px' }}>
//                       <Tag color="green">Active: {stats.active}</Tag>
//                       <Tag color="red">Inactive: {stats.inactive}</Tag>
//                     </div>
//                   </div>
//                 </div>
//               </Card>
//             </Col>
//             <Col span={12}>
//               <Card title="Recent User Type Activity">
//                 <Timeline>
//                   {userTypes.slice(0, 5).map(userType => (
//                     <Timeline.Item
//                       key={userType.id}
//                       color={getStatusColor(userType.is_active ? "ACTIVE" : "INACTIVE")}
//                       dot={getStatusIcon(userType.is_active ? "ACTIVE" : "INACTIVE")}
//                     >
//                       <Space direction="vertical" size={0}>
//                         <div style={{ fontWeight: 'bold' }}>{userType.type}</div>
//                         <div style={{ color: '#666', fontSize: '12px' }}>
//                           {userType.description}
//                         </div>
//                         <div style={{ color: '#999', fontSize: '12px' }}>
//                           <CalendarOutlined /> Created {dayjs(userType.createdAt).fromNow()}
//                         </div>
//                       </Space>
//                     </Timeline.Item>
//                   ))}
//                 </Timeline>
//               </Card>
//             </Col>
//           </Row>
//         </Tabs.TabPane>
//       </Tabs>

//       {/* Add/Edit User Type Modal */}
//       <Modal
//         title={
//           <Space>
//             {selectedType ? <EditOutlined /> : <PlusOutlined />}
//             {selectedType ? "Edit User Type" : "Add User Type"}
//           </Space>
//         }
//         open={isModalOpen}
//         onCancel={() => setIsModalOpen(false)}
//         onOk={() => form.submit()}
//         okText={selectedType ? "Update User Type" : "Add User Type"}
//         width={600}
//         destroyOnClose
//       >
//         <Form form={form} layout="vertical" onFinish={handleSubmit}>
//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 name="type"
//                 label="User Type"
//                 rules={[{ required: true, message: "Please enter user type" }]}
//               >
//                 <Input prefix={<ApartmentOutlined />} placeholder="Enter user type" />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 name="status"
//                 label="Status"
//                 rules={[{ required: true }]}
//               >
//                 <Select placeholder="Select status">
//                   <Option value="Active">Active</Option>
//                   <Option value="Inactive">Inactive</Option>
//                 </Select>
//               </Form.Item>
//             </Col>
//           </Row>
//           <Form.Item
//             name="description"
//             label="Description"
//             rules={[{ required: true, message: "Please enter description" }]}
//           >
//             <TextArea
//               rows={3}
//               placeholder="Enter detailed description of this user type and its permissions"
//             />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// }
export default {}