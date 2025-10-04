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
  DatePicker,
  Dropdown
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  FileTextOutlined,
  UserOutlined,
  TeamOutlined,
  LockOutlined,
  NotificationOutlined,
  DashboardOutlined,
  CrownOutlined,
  CloudDownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  SafetyCertificateOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  SettingOutlined,
  ExportOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  MoreOutlined,
  HomeOutlined,
  SecurityScanOutlined,
  AuditOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  PieChartOutlined,
  TableOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';
import { getApi } from "@/ApiService";
import { toast } from "sonner";

// Extend dayjs with isBetween plugin
dayjs.extend(isBetween);

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;
const { Panel } = Collapse;

// Enhanced Roles & permissions
const roles = [
  { id: 1, name: "Super Admin", color: "red", canView: true, canDelete: true, canExport: true, level: 1 },
  { id: 2, name: "Admin", color: "volcano", canView: true, canDelete: true, canExport: true, level: 2 },
  { id: 3, name: "Doctor", color: "blue", canView: true, canDelete: false, canExport: false, level: 3 },
  { id: 4, name: "Nurse", color: "green", canView: true, canDelete: false, canExport: false, level: 4 },
  { id: 5, name: "Receptionist", color: "orange", canView: true, canDelete: false, canExport: false, level: 4 },
  { id: 6, name: "Staff", color: "purple", canView: true, canDelete: false, canExport: false, level: 5 },
  { id: 7, name: "Viewer", color: "cyan", canView: true, canDelete: false, canExport: false, level: 6 },
];

// Action types with colors and icons
const actionTypes = {
  Create: { color: "green", icon: "➕" },
  Update: { color: "blue", icon: "✏️" },
  Delete: { color: "red", icon: "🗑️" },
  Login: { color: "green", icon: "🔐" },
  Logout: { color: "orange", icon: "🚪" },
  Read: { color: "purple", icon: "👁️" },
  Export: { color: "geekblue", icon: "📤" },
  Import: { color: "cyan", icon: "📥" },
};

// Generate enhanced sample audit logs
const generateLogs = () =>
  Array.from({ length: 150 }, (_, i) => {
    const actions = Object.keys(actionTypes);
    const modules = ["Patients", "Appointments", "Lab Tests", "Pharmacy", "Billing", "Settings", "User Management"];
    const statuses = ["Success", "Failed", "Pending"];
    const ipAddresses = ["192.168.1." + (i % 255), "10.0.0." + (i % 255), "172.16.1." + (i % 255)];

    return {
      id: i + 1,
      action: actions[i % actions.length],
      module: modules[i % modules.length],
      role: roles[i % roles.length].name,
      performedBy: `user${i + 1}@hospital.com`,
      userRole: roles[i % roles.length].name,
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toISOString(),
      status: statuses[i % statuses.length],
      ipAddress: ipAddresses[i % ipAddresses.length],
      userAgent: `Browser ${i % 5}`,
      details: `Detailed description of the ${actions[i % actions.length]} action performed on ${modules[i % modules.length]} module`,
      severity: i % 10 === 0 ? "High" : i % 5 === 0 ? "Medium" : "Low",
      sessionId: `session_${i + 1}`,
      duration: Math.floor(Math.random() * 5000) + 100, // ms
    };
  });

interface AuditStats {
  total: number;
  success: number;
  failed: number;
  highSeverity: number;
  uniqueUsers: number;
  recentActivity: number;
}

export default function HMSAuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    roleFilter: "",
    moduleFilter: "",
    statusFilter: "",
    severityFilter: "",
    actionFilter: "",
    dateRange: null as any,
  });
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentRole] = useState(roles[1]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState("logs");

  // Initialize logs
  useEffect(() => {
    getApi("/activity-logs")
    .then((data) => {
      if (!data.error) {
        setLogs(data)
      }
      else {
        toast.error(data.error)
      }
    })
    .catch((err) => toast.error("Error occurred while getting logs"))
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const newLogs = generateLogs().slice(0, 5);
      setLogs(prev => [...newLogs, ...prev.slice(0, 145)]);
      message.info('🔄 New logs loaded automatically');
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Enhanced filter logic
  const filteredLogs = logs.filter((log) => {
      const matchesSearch = logs
      // log.performedBy.toLowerCase().includes(filters.search.toLowerCase()) ||
      // log.ipAddress.includes(filters.search) ||
      // log.details.toLowerCase().includes(filters.search.toLowerCase());

    const matchesRole = filters.roleFilter ? log.role === filters.roleFilter : true;
    const matchesModule = filters.moduleFilter ? log.module === filters.moduleFilter : true;
    const matchesStatus = filters.statusFilter ? log.status === filters.statusFilter : true;
    const matchesSeverity = filters.severityFilter ? log.severity === filters.severityFilter : true;
    const matchesAction = filters.actionFilter ? log.action === filters.actionFilter : true;

    const matchesDate = filters.dateRange ?
      dayjs(log.timestamp).isBetween(filters.dateRange[0], filters.dateRange[1], 'millisecond', '[]') : true;

    return matchesSearch && matchesRole && matchesModule && matchesStatus &&
      matchesSeverity && matchesAction && matchesDate;
  });

  // Statistics
  const stats: AuditStats = {
    total: logs.length,
    success: logs.filter(log => log.status === "Success").length,
    failed: logs.filter(log => log.status === "Failed").length,
    highSeverity: logs.filter(log => log.severity === "High").length,
    uniqueUsers: Array.from(new Set(logs.map(log => log.performedBy))).length,
    recentActivity: logs.filter(log => 
      dayjs(log.timestamp).isAfter(dayjs().subtract(1, 'day'))
    ).length
  };

  const handleView = (log: any) => {
    setSelectedLog(log);
    setIsViewModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setLogs(logs.filter((log) => log.id !== id));
    message.success('🗑️ Log deleted successfully');
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      message.warning('Please select logs to delete');
      return;
    }

    const hasHighSeverity = selectedRows.some(row => row.severity === "High");
    if (hasHighSeverity) {
      message.error('Cannot delete high severity logs');
      return;
    }

    setLogs(logs.filter((log) => !selectedRows.some((r) => r.id === log.id)));
    setSelectedRows([]);
    message.success(`🗑️ ${selectedRows.length} logs deleted successfully`);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      roleFilter: "",
      moduleFilter: "",
      statusFilter: "",
      severityFilter: "",
      actionFilter: "",
      dateRange: null,
    });
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLogs(generateLogs());
      setLoading(false);
      message.success('🔄 Logs refreshed successfully');
    }, 1000);
  };

  const getStatusColor = (status: string) => ({ 'Success': 'green', 'Failed': 'red', 'Pending': 'orange' }[status] || 'default');
  const getSeverityColor = (severity: string) => ({ 'High': 'red', 'Medium': 'orange', 'Low': 'green' }[severity] || 'default');

  const columns: ColumnsType<any> = [
    {
      title: <Space><AuditOutlined /> Action Details</Space>,
      key: 'action',
      render: (_, record) => (
        <Flex align="center" gap="middle">
          <Avatar 
            size="large" 
            style={{ 
              backgroundColor: getSeverityColor(record.severity),
              fontSize: '16px'
            }}
          >
            {actionTypes[record.action as keyof typeof actionTypes]?.icon}
          </Avatar>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
              <Tag color={actionTypes[record.action as keyof typeof actionTypes]?.color}>
                {record.action}
              </Tag>
              {record.module}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.performedBy}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              <ClockCircleOutlined /> {dayjs(record.timestamp).fromNow()}
            </div>
          </div>
        </Flex>
      ),
    },
    {
      title: <Space><TeamOutlined /> User & Role</Space>,
      key: 'user',
      render: (_, record) => (
        <Space direction="vertical">
          <div style={{ fontWeight: '500' }}>{record.performedBy}</div>
          <Tag color={roles.find(r => r.name === record.role)?.color}>{record.role}</Tag>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.ipAddress}</div>
        </Space>
      ),
    },
    {
      title: <Space><SafetyCertificateOutlined /> Status & Severity</Space>,
      key: 'status',
      render: (_, record) => (
        <Space direction="vertical">
          <Tag color={getStatusColor(record.status)}>{record.status}</Tag>
          <Tag color={getSeverityColor(record.severity)}>{record.severity} Severity</Tag>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.duration}ms</div>
        </Space>
      ),
    },
    {
      title: <Space><ThunderboltOutlined /> Actions</Space>,
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button icon={<EyeOutlined />} shape="circle" type="primary" ghost onClick={() => handleView(record)} />
          </Tooltip>
          {currentRole.canDelete && record.severity !== "High" && (
            <Tooltip title="Delete Log">
              <Popconfirm 
                title="Delete this audit log?" 
                description="This action cannot be undone." 
                onConfirm={() => handleDelete(record.id)} 
                okText="Yes" 
                cancelText="No" 
                okType="danger"
                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
              >
                <Button icon={<DeleteOutlined />} shape="circle" danger />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6" style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <Flex justify="space-between" align="center">
          <div>
            <Space size="large">
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '10px' }}>
                <AuditOutlined style={{ fontSize: '36px' }} />
              </div>
              <div>
                <Title level={2} style={{ color: 'white', margin: 0 }}>🔐 Audit Logs</Title>
                <Text style={{ color: 'rgba(255,255,255,0.8)', margin: 0 }}><DashboardOutlined /> Monitor and track all system activities and user actions</Text>
              </div>
            </Space>
          </div>
          <Space>
            <Tooltip title="Auto Refresh">
              <Switch 
                checkedChildren={<ReloadOutlined />} 
                unCheckedChildren={<ClockCircleOutlined />} 
                checked={autoRefresh} 
                onChange={setAutoRefresh} 
              />
            </Tooltip>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh} 
              size="large" 
              style={{ background: '#fff', color: '#667eea', border: 'none', fontWeight: 'bold' }}
            >
              <RocketOutlined /> Refresh Logs
            </Button>
          </Space>
        </Flex>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><AuditOutlined /> Total Logs</Space>} value={stats.total} valueStyle={{ color: '#667eea' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><SafetyCertificateOutlined /> Success</Space>} value={stats.success} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><ExclamationCircleOutlined /> High Severity</Space>} value={stats.highSeverity} valueStyle={{ color: '#f5222d' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><TeamOutlined /> Unique Users</Space>} value={stats.uniqueUsers} valueStyle={{ color: '#1890ff' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><ClockCircleOutlined /> Recent (24h)</Space>} value={stats.recentActivity} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col xs={24} sm={12} md={8} lg={4}><Card><Statistic title={<Space><DashboardOutlined /> Success Rate</Space>} value={Math.round((stats.success / (stats.total || 1)) * 100)} suffix="%" valueStyle={{ color: '#36cfc9' }} /></Card></Col>
      </Row>

      {/* Tabs for Different Views */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane 
          key="logs" 
          tab={
            <Space>
              <AuditOutlined /> Audit Logs <Badge count={filteredLogs.length} overflowCount={99} />
            </Space>
          }
        >
          <div className="space-y-6">
            {/* Filters Card */}
            <Card>
              <Flex wrap="wrap" gap="middle" align="center" style={{ marginBottom: '16px' }}>
                <Input 
                  placeholder="🔍 Search users, IP, details..." 
                  prefix={<SearchOutlined />} 
                  value={filters.search} 
                  onChange={(e) => setFilters({...filters, search: e.target.value})} 
                  style={{ width: 300 }} 
                  size="large" 
                />
                <Select value={filters.roleFilter} onChange={(value) => setFilters({...filters, roleFilter: value})} placeholder="Filter by Role" style={{ width: 150 }} size="large">
                  <Option value="all">All Roles</Option>
                  {roles.map((role) => (
                    <Option key={role.id} value={role.name}>
                      {role.name}
                    </Option>
                  ))}
                </Select>
                <Select value={filters.statusFilter} onChange={(value) => setFilters({...filters, statusFilter: value})} placeholder="Filter by Status" style={{ width: 150 }} size="large">
                  <Option value="all">All Status</Option>
                  <Option value="Success">Success</Option>
                  <Option value="Failed">Failed</Option>
                  <Option value="Pending">Pending</Option>
                </Select>
                <Select value={filters.severityFilter} onChange={(value) => setFilters({...filters, severityFilter: value})} placeholder="Filter by Severity" style={{ width: 150 }} size="large">
                  <Option value="all">All Severity</Option>
                  <Option value="High">High</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="Low">Low</Option>
                </Select>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={handleClearFilters}>Reset</Button>
                  <Button icon={<ExportOutlined />}>Export</Button>
                </Space>
              </Flex>
              <Alert 
                message="Audit Logs Overview" 
                description={`${stats.success} successful, ${stats.failed} failed, and ${stats.highSeverity} high severity actions. ${stats.uniqueUsers} unique users in the system.`} 
                type={stats.highSeverity > 0 ? "warning" : "info"} 
                showIcon 
                closable 
              />
            </Card>

            {/* Quick Actions */}
            <Card>
              <Flex justify="space-between" align="center">
                <Space>
                  <Text strong>Quick Actions:</Text>
                  <Button icon={<ReloadOutlined />} onClick={handleRefresh}>Refresh</Button>
                  {currentRole.canDelete && (
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                      onClick={handleBulkDelete}
                      disabled={selectedRows.length === 0}
                    >
                      Delete ({selectedRows.length})
                    </Button>
                  )}
                </Space>
                <Text type="secondary">
                  {selectedRows.length > 0 ? `${selectedRows.length} logs selected` : 'No logs selected'}
                </Text>
              </Flex>
            </Card>

            {/* Main Table */}
            <Card 
              title={
                <Space>
                  <TableOutlined /> Audit Logs List ({filteredLogs.length})
                </Space>
              } 
              extra={
                <Space>
                  <Tag color="green">{stats.success} Success</Tag>
                  <Tag color="red">{stats.failed} Failed</Tag>
                  <Tag color="orange">{stats.highSeverity} High Severity</Tag>
                </Space>
              }
            >
              <Table 
                columns={columns} 
                dataSource={filteredLogs} 
                rowKey="id" 
                loading={loading} 
                scroll={{ x: 1000 }}
                rowSelection={{
                  selectedRowKeys: selectedRows.map((r) => r.id),
                  onChange: (_, rows) => setSelectedRows(rows),
                  getCheckboxProps: (record: any) => ({
                    disabled: !currentRole.canDelete || record.severity === "High"
                  }),
                }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} audit logs`,
                }}
              />
            </Card>
          </div>
        </Tabs.TabPane>
        
        <Tabs.TabPane key="activity" tab={<Space><DashboardOutlined /> Recent Activity</Space>}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="Activity Distribution">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <PieChartOutlined style={{ fontSize: '48px', color: '#667eea' }} />
                  <div style={{ marginTop: '16px' }}>
                    <Progress 
                      type="circle" 
                      percent={Math.round((stats.success / (stats.total || 1)) * 100)} 
                      strokeColor="#52c41a" 
                    />
                    <div style={{ marginTop: '16px' }}>
                      <Tag color="green">Success: {stats.success}</Tag>
                      <Tag color="red">Failed: {stats.failed}</Tag>
                      <Tag color="orange">High Severity: {stats.highSeverity}</Tag>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Recent Audit Activity">
                <Timeline>
                  {logs.slice(0, 5).map(log => (
                    <Timeline.Item 
                      key={log.id} 
                      color={getStatusColor(log.status)} 
                      dot={
                        <Avatar 
                          size="small" 
                          style={{ backgroundColor: getSeverityColor(log.severity) }}
                        >
                          {actionTypes[log.action as keyof typeof actionTypes]?.icon}
                        </Avatar>
                      }
                    >
                      <Space direction="vertical" size={0}>
                        <div style={{ fontWeight: 'bold' }}>{log.performedBy} - {log.action}</div>
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          {log.module} • <Tag color={getSeverityColor(log.severity)} >{log.severity}</Tag>
                        </div>
                        <div style={{ color: '#999', fontSize: '12px' }}>
                          {dayjs(log.timestamp).fromNow()} • {log.ipAddress}
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

      {/* View Log Modal */}
      <Modal 
        title={
          <Space>
            <EyeOutlined /> Audit Log Details: {selectedLog?.action}
          </Space>
        } 
        open={isViewModalVisible} 
        onCancel={() => setIsViewModalVisible(false)} 
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>Close</Button>,
        ]} 
        width={700}
      >
        {selectedLog && (
          <Descriptions bordered column={2} size="middle">
            <Descriptions.Item label="Log Information" span={2}>
              <Space direction="vertical">
                <div><strong>Action:</strong> <Tag color={actionTypes[selectedLog.action as keyof typeof actionTypes]?.color}>{selectedLog.action}</Tag></div>
                <div><strong>Module:</strong> {selectedLog.module}</div>
                <div><strong>Details:</strong> {selectedLog.details}</div>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="User Information" span={2}>
              <Space direction="vertical">
                <div><strong>Performed By:</strong> {selectedLog.performedBy}</div>
                <div><strong>Role:</strong> <Tag color={roles.find(r => r.name === selectedLog.role)?.color}>{selectedLog.role}</Tag></div>
                <div><strong>IP Address:</strong> {selectedLog.ipAddress}</div>
                <div><strong>User Agent:</strong> {selectedLog.userAgent}</div>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Status & Timing" span={2}>
              <Space direction="vertical">
                <div><strong>Status:</strong> <Tag color={getStatusColor(selectedLog.status)}>{selectedLog.status}</Tag></div>
                <div><strong>Severity:</strong> <Tag color={getSeverityColor(selectedLog.severity)}>{selectedLog.severity}</Tag></div>
                <div><strong>Timestamp:</strong> {dayjs(selectedLog.timestamp).format('MMM D, YYYY HH:mm:ss')}</div>
                <div><strong>Duration:</strong> {selectedLog.duration}ms</div>
                <div><strong>Session ID:</strong> {selectedLog.sessionId}</div>
              </Space>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}