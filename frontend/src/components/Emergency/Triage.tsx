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
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  UserOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  FireOutlined,
  DashboardOutlined,
  PieChartOutlined,
  ExportOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  RocketOutlined,
  BellOutlined,
  MessageOutlined,
  PhoneOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  TableOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import TabPane from "antd/es/tabs/TabPane";

dayjs.extend(relativeTime);

const { Option } = Select;
const { TextArea } = Input;

// Interfaces
interface TriagePatient {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  condition: string;
  status: "Critical" | "Stable" | "Observation";
  priority: "Immediate" | "Emergency" | "Urgent" | "Semi-Urgent" | "Non-Urgent";
  arrivalTime: string;
  vitalSigns: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygenSaturation: number;
    respiratoryRate: number;
  };
  symptoms: string[];
  allergies: string[];
  assignedNurse: string;
  triageNotes: string;
  estimatedWaitTime: number;
  contactNumber: string;
  lastAssessment: string;
  bloodGroup: string;
}

interface TriageStats {
  total: number;
  critical: number;
  stable: number;
  observation: number;
  averageWaitTime: number;
  todayArrivals: number;
  immediatePriority: number;
}

export default function Triage() {
  const [patients, setPatients] = useState<TriagePatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditAddModalOpen, setIsEditAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<TriagePatient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<TriagePatient | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState("triage");

  const [form] = Form.useForm();

  // Initial Data
  const initialPatients: TriagePatient[] = [
    {
      id: "1",
      patientName: "Alice Johnson",
      age: 28,
      gender: "Female",
      condition: "Severe Laceration with Arterial Bleeding",
      status: "Critical",
      priority: "Immediate",
      arrivalTime: dayjs().subtract(15, 'minutes').format("YYYY-MM-DD HH:mm:ss"),
      vitalSigns: { heartRate: 125, bloodPressure: "90/60", temperature: 36.8, oxygenSaturation: 92, respiratoryRate: 28 },
      symptoms: ["Active bleeding", "Pale skin", "Dizziness", "Rapid pulse"],
      allergies: ["None"],
      assignedNurse: "Sarah Wilson, RN",
      triageNotes: "Active arterial bleeding from left forearm. Requires immediate surgical intervention.",
      estimatedWaitTime: 0,
      contactNumber: "+91 98765 43210",
      lastAssessment: dayjs().subtract(5, 'minutes').format("YYYY-MM-DD HH:mm:ss"),
      bloodGroup: "O+"
    },
    {
      id: "2",
      patientName: "Bob Smith",
      age: 52,
      gender: "Male",
      condition: "Suspected Myocardial Infarction",
      status: "Critical",
      priority: "Immediate",
      arrivalTime: dayjs().subtract(45, 'minutes').format("YYYY-MM-DD HH:mm:ss"),
      vitalSigns: { heartRate: 110, bloodPressure: "150/95", temperature: 37.1, oxygenSaturation: 88, respiratoryRate: 24 },
      symptoms: ["Chest pain", "Shortness of breath", "Diaphoresis", "Nausea"],
      allergies: ["Aspirin"],
      assignedNurse: "Michael Chen, RN",
      triageNotes: "STEMI suspected. ECG shows ST elevation. Cardiac enzymes pending.",
      estimatedWaitTime: 0,
      contactNumber: "+91 98765 43211",
      lastAssessment: dayjs().subtract(10, 'minutes').format("YYYY-MM-DD HH:mm:ss"),
      bloodGroup: "A+"
    },
    {
      id: "3",
      patientName: "Charlie Brown",
      age: 8,
      gender: "Male",
      condition: "High Fever and Dehydration",
      status: "Observation",
      priority: "Urgent",
      arrivalTime: dayjs().subtract(30, 'minutes').format("YYYY-MM-DD HH:mm:ss"),
      vitalSigns: { heartRate: 130, bloodPressure: "95/65", temperature: 39.8, oxygenSaturation: 96, respiratoryRate: 32 },
      symptoms: ["Fever", "Lethargy", "Dry mucous membranes", "Decreased urine output"],
      allergies: ["Penicillin"],
      assignedNurse: "Emma Rodriguez, RN",
      triageNotes: "Pediatric patient with high fever. Started IV fluids and antipyretics.",
      estimatedWaitTime: 45,
      contactNumber: "+91 98765 43212",
      lastAssessment: dayjs().subtract(15, 'minutes').format("YYYY-MM-DD HH:mm:ss"),
      bloodGroup: "B+"
    },
    {
      id: "4",
      patientName: "Diana Prince",
      age: 35,
      gender: "Female",
      condition: "Ankle Fracture",
      status: "Stable",
      priority: "Semi-Urgent",
      arrivalTime: dayjs().subtract(1, 'hour').format("YYYY-MM-DD HH:mm:ss"),
      vitalSigns: { heartRate: 85, bloodPressure: "120/80", temperature: 36.9, oxygenSaturation: 98, respiratoryRate: 16 },
      symptoms: ["Ankle swelling", "Pain", "Limited mobility"],
      allergies: ["None"],
      assignedNurse: "James Wilson, RN",
      triageNotes: "Closed fracture of right ankle. Stable vitals. Awaiting orthopedic consult.",
      estimatedWaitTime: 90,
      contactNumber: "+91 98765 43213",
      lastAssessment: dayjs().subtract(20, 'minutes').format("YYYY-MM-DD HH:mm:ss"),
      bloodGroup: "AB+"
    }
  ];

  // Effects for data loading and auto-refresh
  useEffect(() => {
    setLoading(true);
    const savedPatients = localStorage.getItem("triagePatients");
    if (savedPatients && savedPatients !== '[]') {
      setPatients(JSON.parse(savedPatients));
    } else {
      setPatients(initialPatients);
      localStorage.setItem("triagePatients", JSON.stringify(initialPatients));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info('🔄 Triage data refreshed');
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);
  
  // Helper and Handler Functions
  const savePatients = (updatedPatients: TriagePatient[]) => {
    setPatients(updatedPatients);
    localStorage.setItem("triagePatients", JSON.stringify(updatedPatients));
  };

  const openEditAddModal = (patient?: TriagePatient) => {
    setEditingPatient(patient || null);
    if (patient) {
      form.setFieldsValue({ ...patient, arrivalTime: dayjs(patient.arrivalTime) });
    } else {
      form.resetFields();
      form.setFieldsValue({
        status: 'Stable', priority: 'Urgent', arrivalTime: dayjs(), gender: 'Male',
        vitalSigns: { heartRate: 80, bloodPressure: '120/80', temperature: 37.0, oxygenSaturation: 98, respiratoryRate: 16 },
        symptoms: [], allergies: []
      });
    }
    setIsEditAddModalOpen(true);
  };

  const openViewModal = (patient: TriagePatient) => {
    setViewingPatient(patient);
    setIsViewModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsEditAddModalOpen(false);
    setIsViewModalOpen(false);
    setEditingPatient(null);
    setViewingPatient(null);
    form.resetFields();
  };

  const calculateWaitTime = (priority: string, status: string): number => {
    const waitTimes = {
      'Immediate': 0, 'Emergency': 5, 'Urgent': 15,
      'Semi-Urgent': 60, 'Non-Urgent': 120
    };
    return waitTimes[priority as keyof typeof waitTimes] || 30;
  };

  const handleAddEditPatient = (values: any) => {
    const patientData = {
      ...values,
      arrivalTime: values.arrivalTime.format("YYYY-MM-DD HH:mm:ss"),
      lastAssessment: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };

    if (editingPatient) {
      const updatedPatients = patients.map((p) =>
        p.id === editingPatient.id ? { ...editingPatient, ...patientData } : p
      );
      savePatients(updatedPatients);
      message.success(`🔄 Patient "${patientData.patientName}" updated successfully!`);
    } else {
      const newPatient: TriagePatient = {
        id: Date.now().toString(),
        ...patientData,
        symptoms: values.symptoms || [],
        allergies: values.allergies || [],
        estimatedWaitTime: calculateWaitTime(patientData.priority, patientData.status)
      };
      savePatients([...patients, newPatient]);
      message.success(`✅ Patient "${patientData.patientName}" added to triage!`);
    }
    handleCloseModals();
  };
  
  const handleDelete = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    const updatedPatients = patients.filter((p) => p.id !== patientId);
    savePatients(updatedPatients);
    message.success(`🗑️ Patient "${patient?.patientName}" removed from triage.`);
  };

  const handleStatusChange = (patientId: string, newStatus: TriagePatient['status']) => {
    const updatedPatients = patients.map(p => 
      p.id === patientId ? { ...p, status: newStatus, lastAssessment: dayjs().format("YYYY-MM-DD HH:mm:ss") } : p
    );
    savePatients(updatedPatients);
    message.success(`🔄 Patient status updated to ${newStatus}`);
  };

  // Filtering and Stats
  const filteredPatients = patients.filter((p) => {
    const searchLower = searchText.toLowerCase();
    const matchesSearch = searchText === "" || 
      p.patientName.toLowerCase().includes(searchLower) ||
      p.condition.toLowerCase().includes(searchLower) ||
      p.assignedNurse.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || p.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats: TriageStats = {
    total: patients.length,
    critical: patients.filter(p => p.status === 'Critical').length,
    stable: patients.filter(p => p.status === 'Stable').length,
    observation: patients.filter(p => p.status === 'Observation').length,
    averageWaitTime: patients.length > 0 ? patients.reduce((acc, p) => acc + p.estimatedWaitTime, 0) / patients.length : 0,
    todayArrivals: patients.filter(p => dayjs(p.arrivalTime).isSame(dayjs(), 'day')).length,
    immediatePriority: patients.filter(p => p.priority === 'Immediate').length
  };

  // UI Helpers
  const getStatusColor = (status: string) => ({ 'Critical': 'red', 'Stable': 'green', 'Observation': 'orange' }[status] || 'default');
  const getPriorityColor = (priority: string) => ({ 'Immediate': 'red', 'Emergency': 'volcano', 'Urgent': 'orange', 'Semi-Urgent': 'gold', 'Non-Urgent': 'blue' }[priority] || 'default');
  const getStatusIcon = (status: string) => ({ 'Critical': <FireOutlined />, 'Stable': <CheckCircleOutlined />, 'Observation': <ClockCircleOutlined /> }[status]);
  const getPriorityIcon = (priority: string) => ({ 'Immediate': <ThunderboltOutlined />, 'Emergency': <WarningOutlined />, 'Urgent': <ClockCircleOutlined />, 'Semi-Urgent': <InfoCircleOutlined />, 'Non-Urgent': <CheckCircleOutlined /> }[priority]);

  const columns: ColumnsType<TriagePatient> = [
    {
      title: <Space><UserOutlined /> Patient Information</Space>,
      key: 'patient',
      render: (_, record) => (
        <Space>
          <Avatar size="large" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{record.patientName}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.age}y • {record.gender} • {record.bloodGroup}</div>
            <div style={{ fontSize: '12px', color: '#999' }}><PhoneOutlined /> {record.contactNumber}</div>
          </div>
        </Space>
      ),
    },
    {
      title: <Space><MedicineBoxOutlined /> Condition & Priority</Space>,
      key: 'condition',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontWeight: '500' }}>{record.condition}</div>
          <div style={{ fontSize: '12px', color: '#666' }}><TeamOutlined /> {record.assignedNurse}</div>
          <div style={{ marginTop: '4px' }}><Tag color={getPriorityColor(record.priority)} icon={getPriorityIcon(record.priority)}>{record.priority}</Tag></div>
        </Space>
      ),
    },
    {
      title: <Space><SafetyCertificateOutlined /> Vital Signs</Space>,
      key: 'vitals',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontSize: '12px' }}>❤️ {record.vitalSigns.heartRate} bpm</div>
          <div style={{ fontSize: '12px' }}>🩸 {record.vitalSigns.bloodPressure}</div>
          <div style={{ fontSize: '12px' }}>🌡️ {record.vitalSigns.temperature}°C</div>
          <div style={{ fontSize: '12px' }}>💨 {record.vitalSigns.oxygenSaturation}% SpO₂</div>
        </Space>
      ),
    },
    {
      title: <Space><WarningOutlined /> Status</Space>,
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Space direction="vertical">
          <Tag color={getStatusColor(status)} icon={getStatusIcon(status)} style={{ fontWeight: 'bold' }}>{status}</Tag>
          <Select size="small" value={status} onChange={(value) => handleStatusChange(record.id, value)} style={{ width: 120 }}>
            <Option value="Critical">Critical</Option>
            <Option value="Stable">Stable</Option>
            <Option value="Observation">Observation</Option>
          </Select>
        </Space>
      ),
    },
    {
      title: <Space><ClockCircleOutlined /> Timeline</Space>,
      key: 'timeline',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <div style={{ fontSize: '12px' }}><CalendarOutlined /> Arrived: {dayjs(record.arrivalTime).format('HH:mm')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}><SyncOutlined /> Wait: {record.estimatedWaitTime}min</div>
          <div style={{ fontSize: '12px', color: '#999' }}>Assessed: {dayjs(record.lastAssessment).fromNow()}</div>
        </Space>
      ),
    },
    {
      title: <Space><ThunderboltOutlined /> Actions</Space>,
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details"><Button icon={<EyeOutlined />} shape="circle" type="primary" ghost onClick={() => openViewModal(record)} /></Tooltip>
          <Tooltip title="Edit Patient"><Button icon={<EditOutlined />} shape="circle" onClick={() => openEditAddModal(record)} /></Tooltip>
          <Tooltip title="Delete Patient">
            <Popconfirm title="Remove patient from triage?" description="This action cannot be undone." onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No" icon={<WarningOutlined style={{ color: 'red' }} />}>
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
      <Card style={{ background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)', color: 'white' }}>
        <div className="flex justify-between items-center">
          <div>
            <Space size="large">
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px' }}><ExperimentOutlined style={{ fontSize: '36px' }} /></div>
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'white', margin: 0 }}>🚨 Emergency Triage</h1>
                <p className="text-gray-200" style={{ margin: 0 }}><DashboardOutlined /> Real-time patient prioritization and assessment</p>
              </div>
            </Space>
          </div>
          <Space>
            <Tooltip title="Auto Refresh"><Switch checkedChildren={<SyncOutlined />} unCheckedChildren={<CloseCircleOutlined />} checked={autoRefresh} onChange={setAutoRefresh} /></Tooltip>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openEditAddModal()} size="large" style={{ background: '#fff', color: '#1890ff', border: 'none', fontWeight: 'bold' }}><RocketOutlined /> New Triage Patient</Button>
          </Space>
        </div>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><TeamOutlined /> Total Patients</Space>} value={stats.total} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><FireOutlined /> Critical</Space>} value={stats.critical} valueStyle={{ color: '#f5222d' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><CheckCircleOutlined /> Stable</Space>} value={stats.stable} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><ClockCircleOutlined /> Observation</Space>} value={stats.observation} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><ThunderboltOutlined /> Immediate</Space>} value={stats.immediatePriority} valueStyle={{ color: '#cf1322' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><ClockCircleOutlined /> Avg Wait</Space>} value={Math.round(stats.averageWaitTime)} suffix="min" valueStyle={{ color: '#722ed1' }} /></Card></Col>
      </Row>

      {/* Tabs for Different Views */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane key="triage" tab={<Space><TeamOutlined /> Triage Patients <Badge count={filteredPatients.length} overflowCount={99} /></Space>}>
          <div className="space-y-6">
            <Card>
              <div className="flex flex-wrap gap-4 items-center mb-4">
                <Input placeholder="🔍 Search patients, conditions, nurses..." prefix={<SearchOutlined />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 300 }} size="large" />
                <Select value={statusFilter} onChange={setStatusFilter} placeholder="Filter by Status" style={{ width: 150 }} size="large">
                  <Option value="all">All Status</Option>
                  <Option value="Critical">Critical</Option>
                  <Option value="Stable">Stable</Option>
                  <Option value="Observation">Observation</Option>
                </Select>
                <Select value={priorityFilter} onChange={setPriorityFilter} placeholder="Filter by Priority" style={{ width: 180 }} size="large">
                  <Option value="all">All Priority</Option>
                  <Option value="Immediate">Immediate</Option>
                  <Option value="Emergency">Emergency</Option>
                  <Option value="Urgent">Urgent</Option>
                  <Option value="Semi-Urgent">Semi-Urgent</Option>
                  <Option value="Non-Urgent">Non-Urgent</Option>
                </Select>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={() => { setSearchText(''); setStatusFilter('all'); setPriorityFilter('all'); }}>Reset</Button>
                  <Button icon={<ExportOutlined />}>Export</Button>
                </Space>
              </div>
              <Alert message="Triage Department Status" description={`${stats.critical} critical, ${stats.stable} stable, and ${stats.observation} observation patients. ${stats.immediatePriority} require immediate attention.`} type={stats.critical > 0 ? "warning" : "info"} showIcon closable />
            </Card>

            <Card title={<Space><TableOutlined /> Triage Patient List ({filteredPatients.length})</Space>} extra={<Space><Tag color="red">{stats.critical} Critical</Tag><Tag color="green">{stats.stable} Stable</Tag><Tag color="orange">{stats.observation} Observation</Tag></Space>}>
              <Table columns={columns} dataSource={filteredPatients} rowKey="id" loading={loading} scroll={{ x: 1300 }} />
            </Card>
          </div>
        </TabPane>
        <TabPane key="dashboard" tab={<Space><DashboardOutlined /> Triage Dashboard</Space>}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Patient Distribution by Status">
                <div style={{ textAlign: 'center', padding: '20px' }}><PieChartOutlined style={{ fontSize: '48px', color: '#1890ff' }} /><div style={{ marginTop: '16px' }}><Progress type="circle" percent={Math.round((stats.critical / (stats.total || 1)) * 100)} strokeColor="#f5222d" /><div style={{ marginTop: '16px' }}><Tag color="red">Critical: {stats.critical}</Tag><Tag color="green">Stable: {stats.stable}</Tag><Tag color="orange">Observation: {stats.observation}</Tag></div></div></div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Recent Triage Activity">
                <Timeline>
                  {patients.slice(0, 5).map(patient => (
                    <Timeline.Item key={patient.id} color={getStatusColor(patient.status)} dot={getStatusIcon(patient.status)}>
                      <Space direction="vertical" size={0}>
                        <div style={{ fontWeight: 'bold' }}>{patient.patientName} - {patient.condition}</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>{dayjs(patient.arrivalTime).fromNow()} • Priority: <Tag color={getPriorityColor(patient.priority)} style={{ marginLeft: '8px' }}>{patient.priority}</Tag></div>
                      </Space>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>

      {/* Add/Edit Patient Modal */}
      <Modal title={<Space>{editingPatient ? <EditOutlined /> : <PlusOutlined />}{editingPatient ? "Edit Triage Patient" : "Add Triage Patient"}</Space>} open={isEditAddModalOpen} onCancel={handleCloseModals} onOk={() => form.submit()} okText={editingPatient ? "Update Patient" : "Add Patient"} width={800} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleAddEditPatient}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="patientName" label="Patient Name" rules={[{ required: true }]}><Input prefix={<UserOutlined />} placeholder="Full patient name" /></Form.Item></Col>
            <Col span={6}><Form.Item name="age" label="Age" rules={[{ required: true }]}><InputNumber min={0} max={120} style={{ width: '100%' }} placeholder="Age" /></Form.Item></Col>
            <Col span={6}><Form.Item name="gender" label="Gender" rules={[{ required: true }]}><Select placeholder="Select gender"><Option value="Male">Male</Option><Option value="Female">Female</Option><Option value="Other">Other</Option></Select></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="condition" label="Medical Condition" rules={[{ required: true }]}><Input prefix={<MedicineBoxOutlined />} placeholder="Primary condition" /></Form.Item></Col>
            <Col span={6}><Form.Item name="status" label="Status" rules={[{ required: true }]}><Select placeholder="Select status"><Option value="Critical">Critical</Option><Option value="Stable">Stable</Option><Option value="Observation">Observation</Option></Select></Form.Item></Col>
            <Col span={6}><Form.Item name="priority" label="Priority" rules={[{ required: true }]}><Select placeholder="Select priority"><Option value="Immediate">Immediate</Option><Option value="Emergency">Emergency</Option><Option value="Urgent">Urgent</Option><Option value="Semi-Urgent">Semi-Urgent</Option><Option value="Non-Urgent">Non-Urgent</Option></Select></Form.Item></Col>
          </Row>
          <Divider orientation="left">Vital Signs</Divider>
          <Row gutter={16}>
            <Col span={6}><Form.Item name={["vitalSigns", "heartRate"]} label="Heart Rate" rules={[{ required: true }]}><InputNumber min={0} max={300} style={{ width: '100%' }} placeholder="bpm" /></Form.Item></Col>
            <Col span={6}><Form.Item name={["vitalSigns", "bloodPressure"]} label="Blood Pressure" rules={[{ required: true }]}><Input placeholder="e.g., 120/80" /></Form.Item></Col>
            <Col span={6}><Form.Item name={["vitalSigns", "temperature"]} label="Temperature" rules={[{ required: true }]}><InputNumber min={30} max={45} step={0.1} style={{ width: '100%' }} placeholder="°C" /></Form.Item></Col>
            <Col span={6}><Form.Item name={["vitalSigns", "oxygenSaturation"]} label="SpO₂" rules={[{ required: true }]}><InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="%" /></Form.Item></Col>
          </Row>
          <Form.Item name="symptoms" label="Symptoms"><Select mode="tags" placeholder="Add symptoms"><Option value="Pain">Pain</Option><Option value="Fever">Fever</Option><Option value="Bleeding">Bleeding</Option><Option value="Nausea">Nausea</Option><Option value="Shortness of breath">Shortness of breath</Option></Select></Form.Item>
          <Form.Item name="allergies" label="Allergies"><Select mode="tags" placeholder="Known allergies"><Option value="None">None</Option><Option value="Penicillin">Penicillin</Option><Option value="Aspirin">Aspirin</Option><Option value="Latex">Latex</Option><Option value="Shellfish">Shellfish</Option></Select></Form.Item>
          <Form.Item name="triageNotes" label="Triage Notes"><TextArea rows={3} placeholder="Clinical observations and assessment notes" /></Form.Item>
        </Form>
      </Modal>

      {/* View Patient Modal */}
      <Modal title={<Space><EyeOutlined /> Triage Patient Details: {viewingPatient?.patientName}</Space>} open={isViewModalOpen} onCancel={handleCloseModals} footer={[
        <Button key="close" onClick={handleCloseModals}>Close</Button>,
        //  <Button key="edit" type="primary" onClick={() => { handleCloseModals(); setTimeout(() => openEditAddModal(viewingPatient!), 300); }}><EditOutlined /> Edit Patient</Button>
         ]} width={800}>
        {viewingPatient && (
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Patient Information" span={2}>
              <Space direction="vertical">
                <div><strong>Name:</strong> {viewingPatient.patientName}</div>
                <div><strong>Age/Gender:</strong> {viewingPatient.age} years, {viewingPatient.gender}</div>
                <div><strong>Blood Group:</strong> {viewingPatient.bloodGroup}</div>
                <div><strong>Contact:</strong> {viewingPatient.contactNumber}</div>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Medical Details" span={2}>
              <Space direction="vertical">
                <div><strong>Condition:</strong> {viewingPatient.condition}</div>
                <div><strong>Status:</strong> <Tag color={getStatusColor(viewingPatient.status)} icon={getStatusIcon(viewingPatient.status)}>{viewingPatient.status}</Tag></div>
                <div><strong>Priority:</strong> <Tag color={getPriorityColor(viewingPatient.priority)} icon={getPriorityIcon(viewingPatient.priority)}>{viewingPatient.priority}</Tag></div>
                <div><strong>Symptoms:</strong> {viewingPatient.symptoms.join(', ')}</div>
                <div><strong>Allergies:</strong> {viewingPatient.allergies.join(', ') || 'None'}</div>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Vital Signs" span={2}>
              <Space wrap>
                  <Tag color="magenta">❤️ <strong>HR:</strong> {viewingPatient.vitalSigns.heartRate} bpm</Tag>
                  <Tag color="purple">🩸 <strong>BP:</strong> {viewingPatient.vitalSigns.bloodPressure}</Tag>
                  <Tag color="orange">🌡️ <strong>Temp:</strong> {viewingPatient.vitalSigns.temperature}°C</Tag>
                  <Tag color="blue">💨 <strong>SpO₂:</strong> {viewingPatient.vitalSigns.oxygenSaturation}%</Tag>
                  <Tag color="cyan">🫁 <strong>RR:</strong> {viewingPatient.vitalSigns.respiratoryRate}</Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Triage Information" span={2}>
              <Space direction="vertical">
                <div><strong>Assigned Nurse:</strong> {viewingPatient.assignedNurse}</div>
                <div><strong>Arrival Time:</strong> {dayjs(viewingPatient.arrivalTime).format('MMM D, YYYY HH:mm')} ({dayjs(viewingPatient.arrivalTime).fromNow()})</div>
                <div><strong>Last Assessment:</strong> {dayjs(viewingPatient.lastAssessment).fromNow()}</div>
                <div><strong>Estimated Wait Time:</strong> {viewingPatient.estimatedWaitTime} minutes</div>
              </Space>
            </Descriptions.Item>
            {viewingPatient.triageNotes && (
              <Descriptions.Item label="Triage Notes" span={2}>
                {viewingPatient.triageNotes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}   