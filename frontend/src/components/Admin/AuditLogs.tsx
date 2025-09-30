// HMSAuditLogs.tsx
import React, { useState, useEffect, useRef } from "react";
import {
    Table,
    Button,
    Space,
    Tag,
    Modal,
    Input,
    Select,
    Card,
    Row,
    Col,
    Badge,
    Typography,
    Tooltip,
    Popconfirm,
    Statistic,
    message,
    DatePicker,
    Timeline,
    Progress,
    Alert,
    Divider,
    List,
    Avatar,
    Switch,
    Form,
    Descriptions,
    Collapse,
    Tabs,
    Empty,
    Spin,
    Breadcrumb,
    Dropdown,
    MenuProps,
    Grid,
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
} from "@ant-design/icons";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import isBetween from 'dayjs/plugin/isBetween';

// Extend dayjs with isBetween plugin
dayjs.extend(isBetween);

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

/** Enhanced Roles & permissions */
const roles = [
    { id: 1, name: "Super Admin", color: "red", canView: true, canDelete: true, canExport: true, level: 1 },
    { id: 2, name: "Admin", color: "volcano", canView: true, canDelete: true, canExport: true, level: 2 },
    { id: 3, name: "Doctor", color: "blue", canView: true, canDelete: false, canExport: false, level: 3 },
    { id: 4, name: "Nurse", color: "green", canView: true, canDelete: false, canExport: false, level: 4 },
    { id: 5, name: "Receptionist", color: "orange", canView: true, canDelete: false, canExport: false, level: 4 },
    { id: 6, name: "Staff", color: "purple", canView: true, canDelete: false, canExport: false, level: 5 },
    { id: 7, name: "Viewer", color: "cyan", canView: true, canDelete: false, canExport: false, level: 6 },
];

/** Action types with colors and icons */
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

/** Generate enhanced sample audit logs */
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

/** Quick Stats Component */
const QuickStats = ({ logs, filteredLogs }: { logs: any[], filteredLogs: any[] }) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const stats = [
        {
            title: "Total Logs",
            value: logs.length,
            filteredValue: filteredLogs.length,
            icon: <FileTextOutlined />,
            color: '#1890ff',
            change: ((filteredLogs.length / logs.length) * 100).toFixed(1) + '%'
        },
        {
            title: "Success Rate",
            value: ((logs.filter(log => log.status === "Success").length / logs.length) * 100).toFixed(1) + '%',
            filteredValue: ((filteredLogs.filter(log => log.status === "Success").length / filteredLogs.length) * 100).toFixed(1) + '%',
            icon: <SafetyCertificateOutlined />,
            color: '#52c41a'
        },
        {
            title: "High Severity",
            value: logs.filter(log => log.severity === "High").length,
            filteredValue: filteredLogs.filter(log => log.severity === "High").length,
            icon: <ExclamationCircleOutlined />,
            color: '#ff4d4f'
        },
        {
            title: "Active Users",
            value: Array.from(new Set(logs.map((log) => log.performedBy))).length,
            filteredValue: Array.from(new Set(filteredLogs.map((log) => log.performedBy))).length,
            icon: <TeamOutlined />,
            color: '#722ed1'
        },
    ];

    return (
        <Row gutter={[16, 16]} className="mb-6">
            {stats.map((stat, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                    <Card className="quick-stat-card" hoverable>
                        <div className="stat-content">
                            <div className="stat-icon" style={{ backgroundColor: stat.color + '20', color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="stat-info">
                                <Text className="stat-title">{stat.title}</Text>
                                <div className="stat-values">
                                    <Text className="stat-value">{stat.filteredValue}</Text>
                                    <Text className="stat-total">/ {stat.value}</Text>
                                </div>
                                {stat.change && (
                                    <Text className="stat-change" style={{ color: stat.color }}>
                                        {stat.change} of total
                                    </Text>
                                )}
                            </div>
                        </div>
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

/** Enhanced Filters Component with Collapse */
const AuditFilters = ({
    filters,
    onFiltersChange,
    onClearFilters,
}: {
    filters: any;
    onFiltersChange: (filters: any) => void;
    onClearFilters: () => void;
}) => {
    const [expanded, setExpanded] = useState(false);
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const handleFilterChange = (key: string, value: any) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const filterContent = (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
                <div className="filter-group">
                    <Text strong>Search</Text>
                    <Input
                        placeholder="Search by user, IP, or details..."
                        prefix={<SearchOutlined />}
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        allowClear
                        size={isMobile ? "middle" : "large"}
                    />
                </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <div className="filter-group">
                    <Text strong>Date Range</Text>
                    <RangePicker
                        style={{ width: "100%" }}
                        value={filters.dateRange}
                        onChange={(value) => handleFilterChange('dateRange', value)}
                        showTime
                        format="YYYY-MM-DD HH:mm:ss"
                        size={isMobile ? "middle" : "large"}
                    />
                </div>
            </Col>
            <Col xs={24} sm={12} md={8}>
                <div className="filter-group">
                    <Text strong>Role</Text>
                    <Select
                        placeholder="Filter by Role"
                        value={filters.roleFilter}
                        onChange={(value) => handleFilterChange('roleFilter', value)}
                        style={{ width: "100%" }}
                        allowClear
                        suffixIcon={<TeamOutlined />}
                        size={isMobile ? "middle" : "large"}
                    >
                        {roles.map((role) => (
                            <Option key={role.id} value={role.name}>
                                <Tag color={role.color}>{role.name}</Tag>
                            </Option>
                        ))}
                    </Select>
                </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <div className="filter-group">
                    <Text strong>Module</Text>
                    <Select
                        placeholder="Filter by Module"
                        value={filters.moduleFilter}
                        onChange={(value) => handleFilterChange('moduleFilter', value)}
                        style={{ width: "100%" }}
                        allowClear
                        suffixIcon={<DashboardOutlined />}
                        size={isMobile ? "middle" : "large"}
                    >
                        {Array.from(new Set(generateLogs().map(log => log.module))).map((mod) => (
                            <Option key={mod} value={mod}>
                                {mod}
                            </Option>
                        ))}
                    </Select>
                </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <div className="filter-group">
                    <Text strong>Status</Text>
                    <Select
                        placeholder="Filter by Status"
                        value={filters.statusFilter}
                        onChange={(value) => handleFilterChange('statusFilter', value)}
                        style={{ width: "100%" }}
                        allowClear
                        size={isMobile ? "middle" : "large"}
                    >
                        <Option value="Success">Success</Option>
                        <Option value="Failed">Failed</Option>
                        <Option value="Pending">Pending</Option>
                    </Select>
                </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <div className="filter-group">
                    <Text strong>Severity</Text>
                    <Select
                        placeholder="Filter by Severity"
                        value={filters.severityFilter}
                        onChange={(value) => handleFilterChange('severityFilter', value)}
                        style={{ width: "100%" }}
                        allowClear
                        size={isMobile ? "middle" : "large"}
                    >
                        <Option value="High">High</Option>
                        <Option value="Medium">Medium</Option>
                        <Option value="Low">Low</Option>
                    </Select>
                </div>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <div className="filter-group">
                    <Text strong>Action Type</Text>
                    <Select
                        placeholder="Filter by Action"
                        value={filters.actionFilter}
                        onChange={(value) => handleFilterChange('actionFilter', value)}
                        style={{ width: "100%" }}
                        allowClear
                        size={isMobile ? "middle" : "large"}
                    >
                        {Object.keys(actionTypes).map((action) => (
                            <Option key={action} value={action}>
                                {action}
                            </Option>
                        ))}
                    </Select>
                </div>
            </Col>
        </Row>
    );

    return (
        <Card className="filters-card mb-6">
            <div className="filters-header">
                <Space>
                    <FilterOutlined />
                    <Text strong>Filters</Text>
                    <Badge count={Object.values(filters).filter(v => v && (typeof v !== 'string' || v.length > 0)).length} />
                </Space>
                <Space>
                    <Button
                        type="link"
                        onClick={onClearFilters}
                        icon={<ReloadOutlined />}
                        size="small"
                    >
                        Clear All
                    </Button>
                    {isMobile && (
                        <Button
                            type="link"
                            onClick={() => setExpanded(!expanded)}
                            icon={<FilterOutlined />}
                            size="small"
                        >
                            {expanded ? 'Collapse' : 'Expand'}
                        </Button>
                    )}
                </Space>
            </div>

            {isMobile ? (
                <Collapse activeKey={expanded ? ['1'] : []} ghost>
                    <Panel key="1" header={null} showArrow={false}>
                        {filterContent}
                    </Panel>
                </Collapse>
            ) : (
                filterContent
            )}
        </Card>
    );
};

/** Quick Actions Component */
const QuickActions = ({
    onExport,
    onRefresh,
    onBulkDelete,
    selectedCount,
    currentRole,
    autoRefresh,
    onAutoRefreshChange
}: any) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const exportItems: MenuProps['items'] = [
        {
            key: '1',
            label: 'Export as Excel',
            icon: <FileTextOutlined />,
            onClick: () => onExport({ format: 'xlsx' }),
        },
        {
            key: '2',
            label: 'Export as CSV',
            icon: <FileTextOutlined />,
            onClick: () => onExport({ format: 'csv' }),
        },
        {
            key: '3',
            label: 'Export as JSON',
            icon: <FileTextOutlined />,
            onClick: () => onExport({ format: 'json' }),
        },
    ];

    return (
        <Card className="quick-actions-card mb-6">
            <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={12}>
                    <Space direction={isMobile ? "vertical" : "horizontal"} style={{ width: '100%' }}>
                        <Text strong>Quick Actions:</Text>
                        <Space wrap>
                            <Tooltip title="Refresh Data">
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={onRefresh}
                                    size={isMobile ? "small" : "middle"}
                                >
                                    Refresh
                                </Button>
                            </Tooltip>

                            <Tooltip title="Auto Refresh">
                                <Switch
                                    checked={autoRefresh}
                                    onChange={onAutoRefreshChange}
                                    checkedChildren="Auto On"
                                    unCheckedChildren="Auto Off"
                                    size={isMobile ? "small" : "default"}
                                />
                            </Tooltip>

                            {currentRole.canExport && (
                                <Dropdown menu={{ items: exportItems }} placement="bottomLeft">
                                    <Button
                                        icon={<ExportOutlined />}
                                        size={isMobile ? "small" : "middle"}
                                    >
                                        Export
                                    </Button>
                                </Dropdown>
                            )}

                            {currentRole.canDelete && (
                                <Tooltip title={selectedCount === 0 ? "Select logs to delete" : ""}>
                                    <Button
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={onBulkDelete}
                                        disabled={selectedCount === 0}
                                        size={isMobile ? "small" : "middle"}
                                    >
                                        Delete ({selectedCount})
                                    </Button>
                                </Tooltip>
                            )}
                        </Space>
                    </Space>
                </Col>
                <Col xs={24} md={12}>
                    <div className="selection-info">
                        <Text type="secondary">
                            {selectedCount > 0 ? `${selectedCount} logs selected` : 'No logs selected'}
                        </Text>
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

/** Enhanced Logs Table Component */
const LogsTable = ({
    logs,
    onView,
    onDelete,
    currentRole,
    selectedRows,
    setSelectedRows,
    loading,
}: {
    logs: any[];
    onView: (log: any) => void;
    onDelete: (id: number) => void;
    currentRole: any;
    selectedRows: any[];
    setSelectedRows: (rows: any[]) => void;
    loading: boolean;
}) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 70,
            sorter: (a: any, b: any) => a.id - b.id,
            responsive: ['md'] as any,
        },
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            render: (action: string) => (
                <Space>
                    <span style={{ fontSize: '16px' }}>
                        {actionTypes[action as keyof typeof actionTypes]?.icon}
                    </span>
                    <Tag color={actionTypes[action as keyof typeof actionTypes]?.color}>
                        {action}
                    </Tag>
                </Space>
            ),
            filters: Object.keys(actionTypes).map(action => ({ text: action, value: action })),
            onFilter: (value: any, record: any) => record.action === value,
        },
        {
            title: "Module",
            dataIndex: "module",
            key: "module",
            responsive: ['md'] as any,
        },
        {
            title: "User",
            dataIndex: "performedBy",
            key: "performedBy",
            render: (user: string) => (
                <Space>
                    <UserOutlined />
                    <Text style={{ maxWidth: isMobile ? 100 : 150 }} ellipsis={{ tooltip: user }}>
                        {user.split('@')[0]}
                    </Text>
                </Space>
            ),
        },
        {
            title: "Timestamp",
            dataIndex: "timestamp",
            key: "timestamp",
            render: (timestamp: string) => (
                <Tooltip title={dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')}>
                    <Space>
                        <ClockCircleOutlined />
                        {dayjs(timestamp).fromNow()}
                    </Space>
                </Tooltip>
            ),
            sorter: (a: any, b: any) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
            responsive: ['lg'] as any,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Badge
                    status={status === "Success" ? "success" : status === "Failed" ? "error" : "processing"}
                    text={status}
                />
            ),
            filters: [
                { text: 'Success', value: 'Success' },
                { text: 'Failed', value: 'Failed' },
                { text: 'Pending', value: 'Pending' },
            ],
            onFilter: (value: any, record: any) => record.status === value,
        },
        {
            title: "Actions",
            key: "actions",
            width: 100,
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            type="primary"
                            ghost
                            size="small"
                            onClick={() => onView(record)}
                        />
                    </Tooltip>
                    {currentRole.canDelete && record.severity !== "High" && (
                        <Popconfirm
                            title="Delete this audit log?"
                            description="This action cannot be undone."
                            onConfirm={() => onDelete(record.id)}
                            okText="Yes"
                            cancelText="No"
                            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                        >
                            <Tooltip title="Delete Log">
                                <Button icon={<DeleteOutlined />} danger size="small" />
                            </Tooltip>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <Card className="table-card">
            <div className="table-header">
                <Title level={4} style={{ margin: 0 }}>
                    Audit Logs ({logs.length})
                </Title>
            </div>
            <Table
                loading={loading}
                rowSelection={{
                    selectedRowKeys: selectedRows.map((r) => r.id),
                    onChange: (_, rows) => setSelectedRows(rows),
                    getCheckboxProps: (record: any) => ({
                        disabled: !currentRole.canDelete || record.severity === "High"
                    }),
                }}
                columns={columns}
                dataSource={logs}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                    size: isMobile ? 'small' : 'default',
                }}
                scroll={{ x: 800 }}
                size={isMobile ? "small" : "middle"}
                className="audit-logs-table"
            />
        </Card>
    );
};

/** Enhanced View Modal Component */
const LogViewModal = ({
    log,
    visible,
    onClose,
}: {
    log: any;
    visible: boolean;
    onClose: () => void;
}) => (
    <Modal
        title={
            <Space>
                <FileTextOutlined />
                Audit Log Details
            </Space>
        }
        open={visible}
        onCancel={onClose}
        footer={[
            <Button key="close" onClick={onClose}>
                Close
            </Button>,
        ]}
        width={700}
        className="log-detail-modal"
    >
        {log && (
            <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="ID" span={1}>{log.id}</Descriptions.Item>
                <Descriptions.Item label="Timestamp" span={1}>
                    {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="Action" span={1}>
                    <Tag color={actionTypes[log.action as keyof typeof actionTypes]?.color}>
                        {actionTypes[log.action as keyof typeof actionTypes]?.icon} {log.action}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Module" span={1}>{log.module}</Descriptions.Item>
                <Descriptions.Item label="Performed By" span={1}>{log.performedBy}</Descriptions.Item>
                <Descriptions.Item label="User Role" span={1}>
                    <Tag color={roles.find(r => r.name === log.role)?.color}>{log.role}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Status" span={1}>
                    <Badge
                        status={log.status === "Success" ? "success" : log.status === "Failed" ? "error" : "processing"}
                        text={log.status}
                    />
                </Descriptions.Item>
                <Descriptions.Item label="Severity" span={1}>
                    <Tag color={log.severity === "High" ? "red" : log.severity === "Medium" ? "orange" : "green"}>
                        {log.severity}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="IP Address" span={1}>{log.ipAddress}</Descriptions.Item>
                <Descriptions.Item label="Session ID" span={1}>{log.sessionId}</Descriptions.Item>
                <Descriptions.Item label="Duration" span={1}>{log.duration}ms</Descriptions.Item>
                <Descriptions.Item label="User Agent" span={2}>{log.userAgent}</Descriptions.Item>
                <Descriptions.Item label="Details" span={2}>
                    {log.details}
                </Descriptions.Item>
            </Descriptions>
        )}
    </Modal>
);

/** Main Enhanced HMS Audit Logs Component */
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
    const screens = useBreakpoint();

    // Initialize logs
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setLogs(generateLogs());
            setLoading(false);
        }, 1000);
    }, []);

    // Auto-refresh functionality
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            const newLogs = generateLogs().slice(0, 5);
            setLogs(prev => [...newLogs, ...prev.slice(0, 145)]);
            message.info('New logs loaded automatically');
        }, 30000);

        return () => clearInterval(interval);
    }, [autoRefresh]);

    // Enhanced filter logic with isBetween fix
    const filteredLogs = logs.filter((log) => {
        const matchesSearch =
            log.performedBy.toLowerCase().includes(filters.search.toLowerCase()) ||
            log.ipAddress.includes(filters.search) ||
            log.details.toLowerCase().includes(filters.search.toLowerCase());

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

    const handleView = (log: any) => {
        setSelectedLog(log);
        setIsViewModalVisible(true);
    };

    const handleDelete = (id: number) => {
        setLogs(logs.filter((log) => log.id !== id));
        message.success('Log deleted successfully');
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
        message.success(`${selectedRows.length} logs deleted successfully`);
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

    const handleExport = (settings: any) => {
        const dataToExport = filteredLogs.map(log => ({
            ID: log.id,
            Action: log.action,
            Module: log.module,
            Role: log.role,
            'Performed By': log.performedBy,
            Timestamp: dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss'),
            Status: log.status,
            Severity: log.severity,
            'IP Address': log.ipAddress,
            'Session ID': log.sessionId,
            Details: log.details,
        }));

        if (settings.format === 'json') {
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
                type: "application/json"
            });
            saveAs(blob, `AuditLogs_${dayjs().format('YYYY-MM-DD')}.json`);
        } else if (settings.format === 'csv') {
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const csv = XLSX.utils.sheet_to_csv(ws);
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            saveAs(blob, `AuditLogs_${dayjs().format('YYYY-MM-DD')}.csv`);
        } else {
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "AuditLogs");
            const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
            const blob = new Blob([buf], { type: "application/octet-stream" });
            saveAs(blob, `AuditLogs_${dayjs().format('YYYY-MM-DD')}.xlsx`);
        }

        message.success(`Logs exported successfully as ${settings.format.toUpperCase()}`);
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setLogs(generateLogs());
            setLoading(false);
            message.success('Logs refreshed successfully');
        }, 1000);
    };

    return (
        <div className="hms-audit-logs">
            <style>{`
  /* General Page */
  .hms-audit-logs {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #f5f7fa;
    min-height: 100vh;
    color: #333;
  }

  /* Header */
  .audit-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: -24px -24px 0 -24px;
    padding: 24px;
    color: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  /* Quick Stats Cards */
  .quick-stat-card {
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
    background: white;
  }

  .quick-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  .stat-info {
    flex: 1;
  }

  .stat-title {
    display: block;
    color: #666;
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 4px;
  }

  .stat-values {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #333;
    line-height: 1;
  }

  .stat-total {
    font-size: 12px;
    color: #999;
  }

  .stat-change {
    font-size: 11px;
    font-weight: 500;
    display: block;
    margin-top: 2px;
  }

  /* Filters Card */
  .filters-card {
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    background: white;
  }

  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  /* Quick Actions Card */
  .quick-actions-card {
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    background: white;
  }

  .selection-info {
    text-align: right;
    padding: 8px 0;
  }

  /* Table Card */
  .table-card {
    border-radius: 12px;
    border: none;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    background: white;
  }

  .table-header {
    padding: 16px 0;
    margin-bottom: 8px;
    border-bottom: 1px solid #f0f0f0;
  }

  .audit-logs-table .ant-table-thead > tr > th {
    background: #fafafa;
    font-weight: 600;
  }

  /* Modal */
  .log-detail-modal .ant-descriptions-item-label {
    font-weight: 600;
    background: #fafafa;
  }

  /* Mobile Optimizations */
  @media (max-width: 768px) {
    .audit-header {
      padding: 16px;
      margin: -16px -16px 0 -16px;
    }

    .stat-content {
      gap: 12px;
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      font-size: 18px;
    }

    .stat-value {
      font-size: 20px;
    }
  }
`}</style>


            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="audit-header">

                    <div style={{ marginTop: 16 }}>
                        <Title level={2} style={{ color: 'white', margin: 0 }}>
                            <SecurityScanOutlined /> Audit Logs
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                            Monitor and track all system activities and user actions
                        </Text>
                    </div>
                </div>

                {/* Quick Stats */}
                <QuickStats logs={logs} filteredLogs={filteredLogs} />

                {/* Quick Actions */}
                <QuickActions
                    onExport={handleExport}
                    onRefresh={handleRefresh}
                    onBulkDelete={handleBulkDelete}
                    selectedCount={selectedRows.length}
                    currentRole={currentRole}
                    autoRefresh={autoRefresh}
                    onAutoRefreshChange={setAutoRefresh}
                />

                {/* Filters */}
                <AuditFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClearFilters={handleClearFilters}
                />

                {/* Main Table */}
                <LogsTable
                    logs={filteredLogs}
                    onView={handleView}
                    onDelete={handleDelete}
                    currentRole={currentRole}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    loading={loading}
                />

                {/* Log Detail Modal */}
                <LogViewModal
                    log={selectedLog}
                    visible={isViewModalVisible}
                    onClose={() => setIsViewModalVisible(false)}
                />
            </div>
        </div>
    );
}