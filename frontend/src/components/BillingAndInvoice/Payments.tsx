import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
    Table, Input, Button, Modal, Select, DatePicker,
    message, Card, Tag, Tooltip, Popconfirm,
    Space, Row, Col, Statistic, Descriptions, Divider,
    Skeleton, Switch, Dropdown, Menu, Progress, Badge,
    Avatar, List, Tabs, Form, InputNumber, Radio,
    Steps, Timeline, Result, Empty, Alert, Spin
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
    FilePdfOutlined, DollarOutlined, ReloadOutlined, EyeOutlined,
    CalendarOutlined, MailOutlined, UserOutlined,
    TeamOutlined, DashboardOutlined, SyncOutlined,
    CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined,
    ThunderboltOutlined, SecurityScanOutlined, RocketOutlined,
    CreditCardOutlined, BankOutlined, WalletOutlined,
    ArrowUpOutlined, ArrowDownOutlined, IdcardOutlined,
    PhoneOutlined, EnvironmentOutlined, SafetyCertificateOutlined,
    DownloadOutlined, UploadOutlined, FilterOutlined,
    SettingOutlined, MoreOutlined, StarOutlined,
    HeartOutlined, ShareAltOutlined, ExportOutlined,
    ImportOutlined, CloudDownloadOutlined, CloudUploadOutlined,
    BarcodeOutlined, QrcodeOutlined, ScanOutlined,
    TransactionOutlined, MoneyCollectOutlined, FundOutlined,
    AccountBookOutlined, AuditOutlined, ReconciliationOutlined,
    PieChartOutlined, BarChartOutlined, LineChartOutlined,
    AppstoreOutlined, ShopOutlined, ShoppingCartOutlined,
    GiftOutlined, TrophyOutlined, CrownOutlined,
    FireOutlined, LikeOutlined, DislikeOutlined,
    MessageOutlined, NotificationOutlined, BellOutlined,
    InfoCircleOutlined, ExclamationCircleOutlined,
    WarningOutlined, IssuesCloseOutlined, StopOutlined,
    PauseCircleOutlined, PlayCircleOutlined, StepForwardOutlined,
    StepBackwardOutlined, FastForwardOutlined, FastBackwardOutlined,
    CaretUpOutlined, CaretDownOutlined, CaretLeftOutlined,
    CaretRightOutlined, VerticalLeftOutlined, VerticalRightOutlined,
    ForwardOutlined, BackwardOutlined, RollbackOutlined,
    EnterOutlined, RetweetOutlined, SwapOutlined,
    SwapLeftOutlined, SwapRightOutlined, WifiOutlined,
    GlobalOutlined, DesktopOutlined, LaptopOutlined,
    MobileOutlined, TabletOutlined, CameraOutlined,
    PictureOutlined, SoundOutlined, CustomerServiceOutlined,
    VideoCameraOutlined, PlaySquareOutlined, PauseOutlined,
    FolderOpenOutlined, FolderOutlined, FileTextOutlined,
    FileAddOutlined, FileExcelOutlined, FileWordOutlined,
    FilePptOutlined, FileImageOutlined, FileZipOutlined,
    FileUnknownOutlined, FileMarkdownOutlined, FilePdfOutlined as FilePdfFilled,
    HomeOutlined, InboxOutlined, PaperClipOutlined,
    TagOutlined, TagsOutlined, PushpinOutlined,
    PhoneFilled, MobileFilled, TabletFilled,
    AudioFilled, VideoCameraFilled, NotificationFilled,
    MessageFilled, HeartFilled, StarFilled,
    CrownFilled, TrophyFilled, FireFilled,
    LikeFilled, DislikeFilled, InfoCircleFilled,
    ExclamationCircleFilled, WarningFilled,
    QuestionCircleOutlined, QuestionCircleFilled,
    MinusCircleOutlined, MinusCircleFilled,
    PlusCircleOutlined, PlusCircleFilled,
    FrownOutlined, FrownFilled, MehOutlined,
    MehFilled, SmileOutlined, SmileFilled,
    PoweroffOutlined, LogoutOutlined, LoginOutlined,
    UserSwitchOutlined, UsergroupAddOutlined, UsergroupDeleteOutlined,
    UserAddOutlined, UserDeleteOutlined, TeamOutlined as TeamFilled
} from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import dayjs, { Dayjs } from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { getApi } from "@/ApiService";
import { toast } from "sonner";

dayjs.extend(relativeTime);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Step } = Steps;

type Payment = {
    id: string;
    customerName: string;
    email: string;
    amount: number;
    date: string;
    method: "CASH" | "CARD" | "UPI" | "ONLINE";
    status: "PAID" | "PENDING" | "FAILED";
    billing?: any;
};

export default function Payments() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [formPayment, setFormPayment] = useState<Partial<Payment>>({});
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [methodFilter, setMethodFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [tableLoading, setTableLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const handleTableChange = (newPagination: any) => {
        getPayments(newPagination.current, newPagination.pageSize);
    };

    // Simulate data loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
            setStatsLoading(false);
            setTableLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const getPayments = (page = 1, limit = 10, searchQuery = searchTerm, status = statusFilter, method = methodFilter) => {
        setTableLoading(true);
        getApi(`/payment?page=${page}&limit=${limit}&q=${searchQuery}&status=${status === 'all' ? '' : status}&method=${method === 'all' ? '' : method}`)
            .then((data) => {
                if (!data.error) {
                    setPayments(data.data || []);
                    setPagination(prev => ({
                        ...prev,
                        current: page,
                        pageSize: limit,
                        total: data.total || data.data?.length || 0
                    }));
                } else {
                    toast.error(data.error);
                }
            })
            .catch((err) => {
                toast.error("Error occurred while getting payments");
                console.error("Error fetching payments:", err);
            })
            .finally(() => setTableLoading(false));
    };

    useEffect(() => {
        getPayments();
    }, []);

    // Auto refresh notifier
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (autoRefresh) {
            interval = setInterval(() => {
                message.info({
                    content: "🔄 Auto-refresh: Payment data reloaded",
                    duration: 2,
                    key: 'auto-refresh'
                });
                getPayments();
            }, 30000);
        }
        
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [autoRefresh]);

    const filteredPayments = payments
    // .filter(payment => {
    //     const lowerSearchTerm = searchTerm.toLowerCase();
    //     const matchesSearch = 
    //         payment.customerName?.toLowerCase().includes(lowerSearchTerm) || 
    //         payment.email?.toLowerCase().includes(lowerSearchTerm);
    //     const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    //     const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
    //     const matchesDate = !dateRange || (dayjs(payment.date).isSameOrAfter(dateRange[0], 'day') && dayjs(payment.date).isSameOrBefore(dateRange[1], 'day'));
    //     return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    // });

    // Statistics
    const stats = React.useMemo(() => {
        const total = filteredPayments.length;
        const PAID = filteredPayments.filter(p => p.status === "PAID").length;
        const PENDING = filteredPayments.filter(p => p.status === "PENDING").length;
        const FAILED = filteredPayments.filter(p => p.status === "FAILED").length;

        const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const PAIDAmount = filteredPayments.filter(p => p.status === "PAID").reduce((sum, p) => sum + (p.amount || 0), 0);
        const PENDINGAmount = filteredPayments.filter(p => p.status === "PENDING").reduce((sum, p) => sum + (p.amount || 0), 0);
        const FAILEDAmount = filteredPayments.filter(p => p.status === "FAILED").reduce((sum, p) => sum + (p.amount || 0), 0);

        const CASHPayments = filteredPayments.filter(p => p.method === "CASH").length;
        const cardPayments = filteredPayments.filter(p => p.method === "CARD").length;
        const upiPayments = filteredPayments.filter(p => p.method === "UPI").length;
        const onlinePayments = filteredPayments.filter(p => p.method === "ONLINE").length;

        const successRate = total > 0 ? (PAID / total) * 100 : 0;
        const averagePayment = total > 0 ? totalAmount / total : 0;

        return {
            total,
            PAID,
            PENDING,
            FAILED,
            totalAmount,
            PAIDAmount,
            PENDINGAmount,
            FAILEDAmount,
            CASHPayments,
            cardPayments,
            upiPayments,
            onlinePayments,
            successRate,
            averagePayment
        };
    }, [filteredPayments]);

    const openModal = useCallback((mode: 'add' | 'edit' | 'view', payment?: Payment) => {
        setFormPayment(mode === 'add' ? {} : { ...payment });
        setIsEditMode(mode === 'edit');
        setIsViewMode(mode === 'view');
        setIsModalOpen(true);
    }, []);

    const handleDeletePayment = (id: string) => {
        setTableLoading(true);
        setTimeout(() => {
            const updated = payments.filter(p => p.id !== id);
            setPayments(updated);
            localStorage.setItem("payments", JSON.stringify(updated));
            message.success("Payment deleted successfully");
            setTableLoading(false);
        }, 500);
    };

    const handleSavePayment = () => {
        if (!formPayment.customerName || !formPayment.email || !formPayment.amount || !formPayment.date || !formPayment.method || !formPayment.status) {
            return message.error("All fields are required");
        }
        if (!/\S+@\S+\.\S+/.test(formPayment.email)) {
            return message.error("Invalid email format");
        }

        setLoading(true);
        setTimeout(() => {
            const updated = formPayment.id
                ? payments.map(p => (p.id === formPayment.id ? formPayment as Payment : p))
                : [...payments, { ...formPayment, id: uuidv4() } as Payment];
            setPayments(updated);
            localStorage.setItem("payments", JSON.stringify(updated));
            setIsModalOpen(false);
            setLoading(false);
            message.success(`Payment ${formPayment.id ? 'updated' : 'added'} successfully`);
        }, 500);
    };

    const handleExportPaymentPDF = (payment: Payment) => {
        try {
            const doc = new jsPDF();
            const { customerName, email, amount, date, method, status, id } = payment;
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const brandColor = '#4A90E2';

            if (status === 'PAID') {
                doc.saveGraphicsState();
                doc.setFontSize(80);
                doc.setTextColor('#D0F0C0');
                doc.setFont('helvetica', 'bold');
                doc.text('PAID', pageWidth / 2, pageHeight / 2, { align: 'center', angle: -45, baseline: 'middle' });
                doc.restoreGraphicsState();
            }

            doc.setFillColor(236, 240, 241);
            doc.rect(0, 0, pageWidth, 25, 'F');
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(brandColor);
            doc.text('Payment Receipt', pageWidth / 2, 17, { align: 'center' });

            autoTable(doc, {
                startY: 35,
                theme: 'plain',
                body: [[
                    { content: 'Billed From:\nMedicareHMS Inc.\n123 Health St, Wellness City\ncontact@medicarehms.com', styles: { fontStyle: 'bold' } },
                    { content: `Receipt ID: ${id}\nDate: ${dayjs(date).format('MMM DD, YYYY')}\nStatus: ${status}`, styles: { halign: 'right', fontStyle: 'bold' } }
                ]],
            });

            doc.setFontSize(11).setTextColor(100).text('BILLED TO', 14, (doc as any).lastAutoTable.finalY + 10);
            doc.setFontSize(12).setTextColor(0).setFont('helvetica', 'bold').text(customerName, 14, (doc as any).lastAutoTable.finalY + 16);
            doc.setFont('helvetica', 'normal').text(email, 14, (doc as any).lastAutoTable.finalY + 21);

            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 30,
                head: [['Description', 'Payment Method', 'Amount']],
                body: [['Service Payment', method, `$${amount.toFixed(2)}`]],
                theme: 'grid',
                headStyles: { fillColor: brandColor, textColor: 255 },
                columnStyles: { 2: { halign: 'right' } }
            });

            const finalY = (doc as any).lastAutoTable.finalY;
            doc.setFontSize(14).setFont('helvetica', 'bold').text('Total:', pageWidth - 60, finalY + 15);
            doc.text(`$${amount.toFixed(2)}`, pageWidth - 15, finalY + 15, { align: 'right' });
            doc.setFontSize(10).setTextColor(150).text("Thank you for your business!", pageWidth / 2, pageHeight - 10, { align: 'center' });

            doc.save(`Receipt_${customerName.replace(/\s+/g, '_')}.pdf`);
            message.success("Receipt exported successfully!");
        } catch (error) {
            console.error("Error exporting PDF:", error);
            message.error("Failed to export PDF");
        }
    };

    const handleBulkExport = () => {
        if (!filteredPayments.length) return message.warning("No payments to export");
        
        try {
            const doc = new jsPDF();
            const brandColor = '#16A085';

            const totalReportAmount = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const PAIDCount = filteredPayments.filter(p => p.status === 'PAID').length;
            const tableData = filteredPayments.map((p, i) => [i + 1, p.customerName, dayjs(p.date).format('YYYY-MM-DD'), p.method, p.status, `$${(p.amount || 0).toFixed(2)}`]);

            // Add header
            doc.setFontSize(20).setFont('helvetica', 'bold').setTextColor(brandColor).text('Payments Report', 14, 20);

            // Add summary
            autoTable(doc, {
                startY: 30,
                theme: 'grid',
                body: [
                    [{ content: 'Report Summary', colSpan: 2, styles: { fontStyle: 'bold', fillColor: '#ECF0F1', textColor: brandColor } }],
                    ['Total Transactions', `${filteredPayments.length} (PAID: ${PAIDCount})`],
                    ['Total Amount', `$${totalReportAmount.toFixed(2)}`]
                ],
                margin: { left: 14, right: 14 },
                tableWidth: 'wrap'
            });

            // Add main table
            autoTable(doc, {
                startY: (doc as any).lastAutoTable.finalY + 10,
                head: [['#', 'Customer', 'Date', 'Method', 'Status', 'Amount']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: brandColor },
                columnStyles: { 5: { halign: 'right' } },
                margin: { left: 14, right: 14 },
                didDrawPage: (data) => {
                    const pageCount = (doc as any).internal.getNumberOfPages();
                    doc.setFontSize(10).setTextColor(150);
                    doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
                    doc.text(`Generated on: ${dayjs().format('MMM DD, YYYY')}`, doc.internal.pageSize.width - data.settings.margin.right, doc.internal.pageSize.height - 10, { align: 'right' });
                }
            });

            doc.save(`Payments_Report_${dayjs().format('YYYY-MM-DD')}.pdf`);
            message.success(`Exported ${filteredPayments.length} payments`);
        } catch (error) {
            console.error("Error exporting bulk PDF:", error);
            message.error("Failed to export payments");
        }
    };

    const getStatusColor = (status: string) => ({ "PAID": "green", "PENDING": "orange", "FAILED": "red" }[status] || "blue");
    const getMethodColor = (method: string) => ({ "CASH": "blue", "CARD": "purple", "UPI": "geekblue", "ONLINE": "cyan" }[method] || "default");

    const getStatusIcon = (status: string) => {
        const icons = {
            PAID: <CheckCircleOutlined />,
            PENDING: <ClockCircleOutlined />,
            FAILED: <CloseCircleOutlined />,
        };
        return icons[status as keyof typeof icons] || <InfoCircleOutlined />;
    };

    const resetFilters = useCallback(() => {
        setSearchTerm("");
        setStatusFilter("all");
        setMethodFilter("all");
        setDateRange(null);
        getPayments(1, pagination.pageSize, "", "all", "all");
    }, [pagination.pageSize]);

    const moreActionsMenu = (
        <Menu
            items={[
                {
                    key: 'import',
                    icon: <ImportOutlined />,
                    label: 'Import Payments',
                },
                {
                    key: 'export',
                    icon: <ExportOutlined />,
                    label: 'Export All Data',
                    onClick: handleBulkExport
                },
                {
                    key: 'settings',
                    icon: <SettingOutlined />,
                    label: 'Payment Settings',
                },
                {
                    type: 'divider',
                },
                {
                    key: 'help',
                    icon: <QuestionCircleOutlined />,
                    label: 'Help & Support',
                },
            ]}
        />
    );

    const columns: ColumnsType<Payment> = [
        {
            title: (
                <Space>
                    <UserOutlined />
                    Customer Info
                </Space>
            ),
            key: "customer",
            render: (_, record: Payment) => (
                <Space>
                    <Avatar size="large" icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                    <div>
                        <div style={{ fontWeight: "bold" }}>{record?.['billing']?.['order']?.['user']?.name}</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                            <MailOutlined /> {record?.['billing']?.['order']?.['user']?.email}
                        </div>
                    </div>
                </Space>
            ),
        },
        {
            title: (
                <Space>
                    <DollarOutlined />
                    Amount
                </Space>
            ),
            dataIndex: "amount",
            key: "amount",
            render: (val) => (
                <Space direction="vertical" size={0}>
                    <span className="font-bold text-green-600">${(val || 0).toFixed(2)}</span>
                    <div style={{ fontSize: "12px", color: "#999" }}>Total Amount</div>
                </Space>
            ),
            sorter: (a, b) => (a.amount || 0) - (b.amount || 0)
        },
        {
            title: (
                <Space>
                    <CalendarOutlined />
                    Date
                </Space>
            ),
            dataIndex: "date",
            key: "date",
            render: (date) => (
                <Space direction="vertical" size={0}>
                    <span style={{ fontWeight: "500" }}>{dayjs(date).format('MMM DD, YYYY')}</span>
                    <div style={{ fontSize: "12px", color: "#999" }}>
                        {dayjs(date).fromNow()}
                    </div>
                </Space>
            ),
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix()
        },
        {
            title: (
                <Space>
                    <SecurityScanOutlined />
                    Method
                </Space>
            ),
            dataIndex: "method",
            key: "method",
            render: (method) => (
                <Tag color={getMethodColor(method)} className="font-medium" icon={<CreditCardOutlined />}>
                    {method}
                </Tag>
            )
        },
        {
            title: (
                <Space>
                    <DashboardOutlined />
                    Status
                </Space>
            ),
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Space direction="vertical">
                    <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
                        {status}
                    </Tag>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                        Last updated
                    </div>
                </Space>
            )
        },
        {
            title: (
                <Space>
                    <ThunderboltOutlined />
                    Actions
                </Space>
            ),
            key: "actions",
            render: (_, record) => (
                <Space>
                    {/* <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            shape="circle"
                            type="primary"
                            ghost
                            onClick={() => openModal('view', record)}
                        />
                    </Tooltip> */}
                    {/* <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            shape="circle"
                            onClick={() => openModal('edit', record)}
                        />
                    </Tooltip> */}
                    <Tooltip title="Export PDF">
                        <Button
                            icon={<FilePdfOutlined />}
                            shape="circle"
                            type="primary"
                            onClick={() => handleExportPaymentPDF(record)}
                        />
                    </Tooltip>
                    {/* <Tooltip title="Delete">
                        <Popconfirm
                            title="Delete this payment?"
                            description="Are you sure you want to delete this payment? This action cannot be undone."
                            onConfirm={() => handleDeletePayment(record.id)}
                            okText="Yes"
                            cancelText="No"
                            okType="danger"
                            icon={<CloseCircleOutlined style={{ color: "red" }} />}
                        >
                            <Button icon={<DeleteOutlined />} shape="circle" danger />
                        </Popconfirm>
                    </Tooltip> */}
                </Space>
            )
        }
    ];

    const renderModalContent = () => {
        if (isViewMode && formPayment) {
            return (
                <div>
                    {/* Payment Header */}
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Avatar size={80} icon={<DollarOutlined />} className="bg-blue-100 text-blue-600 mb-4" />
                        <h2 style={{ margin: '8px 0', color: '#1890ff' }}>{formPayment.customerName}</h2>
                        <Space>
                            <Tag color={getMethodColor(formPayment.method || '')} icon={<CreditCardOutlined />}>
                                {formPayment.method}
                            </Tag>
                            <Tag color={getStatusColor(formPayment.status || '')} icon={getStatusIcon(formPayment.status || '')}>
                                {formPayment.status}
                            </Tag>
                        </Space>
                    </div>

                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label={<Space><IdcardOutlined />Payment ID</Space>}>
                            {formPayment.id}
                        </Descriptions.Item>
                        <Descriptions.Item label={<Space><UserOutlined />Customer Name</Space>}>
                            {formPayment.customerName}
                        </Descriptions.Item>
                        <Descriptions.Item label={<Space><MailOutlined />Email</Space>}>
                            {formPayment.email}
                        </Descriptions.Item>
                        <Descriptions.Item label={<Space><DollarOutlined />Amount</Space>}>
                            <span className="font-bold text-green-600 text-lg">
                                ${(formPayment.amount || 0).toFixed(2)}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label={<Space><CalendarOutlined />Payment Date</Space>}>
                            {formPayment.date ? dayjs(formPayment.date).format('MMM DD, YYYY') : ''}
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                ({formPayment.date ? dayjs(formPayment.date).fromNow() : ''})
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label={<Space><SafetyCertificateOutlined />Payment Method</Space>}>
                            <Tag color={getMethodColor(formPayment.method || '')}>
                                {formPayment.method}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label={<Space><DashboardOutlined />Payment Status</Space>}>
                            <Tag color={getStatusColor(formPayment.status || '')} icon={getStatusIcon(formPayment.status || '')}>
                                {formPayment.status}
                            </Tag>
                        </Descriptions.Item>
                    </Descriptions>

                    <Divider />

                    {/* Additional Information */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">Transaction Type:</span>
                            <Tag color="blue">One-time Payment</Tag>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">Service Category:</span>
                            <span>Medical Services</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">Invoice Generated:</span>
                            <Tag color="green">Yes</Tag>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-4 pt-4">
                <Input
                    placeholder="Customer Name"
                    value={formPayment.customerName || ''}
                    onChange={e => setFormPayment({ ...formPayment, customerName: e.target.value })}
                    disabled={!isEditMode}
                    prefix={<UserOutlined />}
                />
                <Input
                    placeholder="Email"
                    value={formPayment.email || ''}
                    onChange={e => setFormPayment({ ...formPayment, email: e.target.value })}
                    disabled={!isEditMode}
                    prefix={<MailOutlined />}
                />
                <InputNumber
                    placeholder="Amount"
                    value={formPayment.amount}
                    onChange={val => setFormPayment({ ...formPayment, amount: Number(val) })}
                    disabled={!isEditMode}
                    style={{ width: "100%" }}
                    prefix="$"
                    min={0}
                    step={0.01}
                />
                <DatePicker
                    value={formPayment.date ? dayjs(formPayment.date) : null}
                    onChange={(date) => setFormPayment({ ...formPayment, date: date ? date.format('YYYY-MM-DD') : '' })}
                    disabled={!isEditMode}
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                />
                <Select
                    value={formPayment.method}
                    onChange={val => setFormPayment({ ...formPayment, method: val })}
                    disabled={!isEditMode}
                    style={{ width: "100%" }}
                    placeholder="Select Payment Method"
                >
                    <Option value="CASH">CASH</Option>
                    <Option value="CARD">Card</Option>
                    <Option value="UPI">UPI</Option>
                    <Option value="ONLINE">Online</Option>
                </Select>
                <Select
                    value={formPayment.status}
                    onChange={val => setFormPayment({ ...formPayment, status: val })}
                    disabled={!isEditMode}
                    style={{ width: "100%" }}
                    placeholder="Select Status"
                >
                    <Option value="PAID">PAID</Option>
                    <Option value="PENDING">PENDING</Option>
                    <Option value="FAILED">FAILED</Option>
                </Select>
            </div>
        );
    };

    const getModalTitle = () => {
        if (isViewMode) {
            return (
                <Space>
                    <EyeOutlined />
                    Payment Details
                </Space>
            );
        }
        return (
            <Space>
                {isEditMode ? (formPayment.id ? <EditOutlined /> : <PlusOutlined />) : <EyeOutlined />}
                {isEditMode ? (formPayment.id ? "Edit Payment" : "Add New Payment") : "Payment Details"}
            </Space>
        );
    };

    const getModalFooter = () => {
        if (isViewMode) {
            return [
                <Button key="export" icon={<FilePdfOutlined />} onClick={() => formPayment.id && handleExportPaymentPDF(formPayment as Payment)}>
                    Export PDF
                </Button>,
                <Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>
                    Close
                </Button>
            ];
        }

        if (isEditMode) {
            return [
                <Button key="back" onClick={() => setIsModalOpen(false)}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSavePayment} className="bg-blue-600 hover:bg-blue-700" icon={formPayment.id ? <EditOutlined /> : <PlusOutlined />}>
                    {formPayment.id ? "Update Payment" : "Add Payment"}
                </Button>
            ];
        }

        return [<Button key="back" onClick={() => setIsModalOpen(false)}>Close</Button>];
    };

    // Skeleton components
    const StatisticSkeleton = () => (
        <Card className="shadow-sm">
            <Skeleton active paragraph={{ rows: 1 }} />
        </Card>
    );

    const TableSkeleton = () => (
        <Card className="shadow-md rounded-lg">
            <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
    );

    if (loading) {
        return (
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                {/* Header Skeleton */}
                <Card className="bg-white shadow-sm border-0">
                    <Skeleton active avatar paragraph={{ rows: 1 }} />
                </Card>

                {/* Statistics Skeleton */}
                {/* <Row gutter={[16, 16]}>
                    {[...Array(6)].map((_, i) => (
                        <Col key={i} xs={24} sm={12} md={8} lg={4}>
                            <StatisticSkeleton />
                        </Col>
                    ))}
                </Row> */}

                {/* Payment Methods Skeleton */}
                {/* <Row gutter={[16, 16]}>
                    {[...Array(4)].map((_, i) => (
                        <Col key={i} xs={24} sm={12} md={6}>
                            <StatisticSkeleton />
                        </Col>
                    ))}
                </Row>
 */}
                {/* Table Skeleton */}
                <TableSkeleton />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <Card className="bg-white shadow-sm border-0">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
                    <div className="flex items-center space-x-3">
                        <Avatar size={48} icon={<DollarOutlined />} className="bg-blue-100 text-blue-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
                            <p className="text-gray-600 mt-1">Manage and track all payment transactions</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
                        <Tooltip title={autoRefresh ? "Auto refresh enabled" : "Auto refresh disabled"}>
                            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                                <SyncOutlined className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-600">Auto Refresh</span>
                                <Switch
                                    size="small"
                                    checked={autoRefresh}
                                    onChange={setAutoRefresh}
                                    checkedChildren="On"
                                    unCheckedChildren="Off"
                                />
                            </div>
                        </Tooltip>

                        <Tooltip title="Reset Filters">
                            <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                                Reset Filters
                            </Button>
                        </Tooltip>

                        <Dropdown overlay={moreActionsMenu} placement="bottomRight">
                            <Button icon={<MoreOutlined />}>
                                More Actions
                            </Button>
                        </Dropdown>

                        <Tooltip title="Add New Payment">
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => openModal('add')}
                                className="bg-green-600 hover:bg-green-700"
                                disabled={loading}
                            >
                                <RocketOutlined /> Add Payment
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </Card>

            {/* Statistics Section */}
            {/* <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card className="shadow-sm">
                        {statsLoading ? (
                            <Skeleton active paragraph={{ rows: 1 }} />
                        ) : (
                            <Statistic
                                title="Total Payments"
                                value={stats.total}
                                prefix={<TeamOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card className="shadow-sm">
                        {statsLoading ? (
                            <Skeleton active paragraph={{ rows: 1 }} />
                        ) : (
                            <Statistic
                                title="Total Amount"
                                value={stats.totalAmount}
                                prefix="$"
                                precision={2}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card className="shadow-sm">
                        {statsLoading ? (
                            <Skeleton active paragraph={{ rows: 1 }} />
                        ) : (
                            <Statistic
                                title="PAID Amount"
                                value={stats.PAIDAmount}
                                prefix="$"
                                precision={2}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card className="shadow-sm">
                        {statsLoading ? (
                            <Skeleton active paragraph={{ rows: 1 }} />
                        ) : (
                            <Statistic
                                title="PENDING Amount"
                                value={stats.PENDINGAmount}
                                prefix="$"
                                precision={2}
                                valueStyle={{ color: '#faad14' }}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card className="shadow-sm">
                        {statsLoading ? (
                            <Skeleton active paragraph={{ rows: 1 }} />
                        ) : (
                            <Statistic
                                title="Success Rate"
                                value={stats.successRate}
                                suffix="%"
                                precision={1}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card className="shadow-sm">
                        {statsLoading ? (
                            <Skeleton active paragraph={{ rows: 1 }} />
                        ) : (
                            <Statistic
                                title="Avg Payment"
                                value={stats.averagePayment}
                                prefix="$"
                                precision={2}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        )}
                    </Card>
                </Col>
            </Row> */}

            {/* Payment Methods Statistics */}
            {/* <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm">
                        {statsLoading ? (
                            <Skeleton active paragraph={{ rows: 1 }} />
                        ) : (
                            <Statistic
                                title="Card Payments"
                                value={stats.cardPayments}
                                prefix={<CreditCardOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm">
                        {statsLoading ? (
                            <Skeleton active paragraph={{ rows: 1 }} />
                        ) : (
                            <Statistic
                                title="UPI Payments"
                                value={stats.upiPayments}
                                prefix={<BankOutlined />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm">
                        {statsLoading ? (
                            <Skeleton active paragraph={{ rows: 1 }} />
                        ) : (
                            <Statistic
                                title="CASH Payments"
                                value={stats.CASHPayments}
                                prefix={<WalletOutlined />}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm">
                        {statsLoading ? (
                            <Skeleton active paragraph={{ rows: 1 }} />
                        ) : (
                            <Statistic
                                title="Online Payments"
                                value={stats.onlinePayments}
                                prefix={<BankOutlined />}
                                valueStyle={{ color: '#13c2c2' }}
                            />
                        )}
                    </Card>
                </Col>
            </Row> */}

            {/* Search and Filter Section */}
            <Card className="bg-white shadow-sm border-0">
                <div className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <TeamOutlined className="w-5 h-5" />
                            <span className="text-lg font-semibold">All Payments</span>
                            <Badge count={filteredPayments.length} showZero color="blue" />
                        </div>
                        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                            <Input.Search
                                placeholder="Search customer or email..."
                                value={searchTerm}
                                onSearch={() => getPayments(1, pagination.pageSize, searchTerm)}
                                onChange={e => setSearchTerm(e.target.value)}
                                onPressEnter={() => getPayments(1, pagination.pageSize, searchTerm)}
                                prefix={<SearchOutlined />}
                                allowClear
                                style={{ width: 250 }}
                                loading={tableLoading}
                            />
                            <Select
                                value={statusFilter}
                                onChange={(value) => {
                                    setStatusFilter(value);
                                    getPayments(1, pagination.pageSize, searchTerm, value, methodFilter);
                                }}
                                style={{ width: 150 }}
                                placeholder="Filter by status"
                                suffixIcon={<FilterOutlined />}
                            >
                                <Option value="all">All Status</Option>
                                <Option value="PAID">PAID</Option>
                                <Option value="PENDING">PENDING</Option>
                                <Option value="FAILED">FAILED</Option>
                            </Select>
                            <Select
                                value={methodFilter}
                                onChange={(value) => {
                                    setMethodFilter(value);
                                    getPayments(1, pagination.pageSize, searchTerm, statusFilter, value);
                                }}
                                style={{ width: 150 }}
                                placeholder="Filter by method"
                                suffixIcon={<FilterOutlined />}
                            >
                                <Option value="all">All Methods</Option>
                                <Option value="CASH">CASH</Option>
                                <Option value="CARD">Card</Option>
                                <Option value="UPI">UPI</Option>
                                <Option value="ONLINE">Online</Option>
                            </Select>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
                            />
                            <Button
                                icon={<FilePdfOutlined />}
                                onClick={handleBulkExport}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                disabled={filteredPayments.length === 0}
                            >
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Payments Table */}
            <Card className="shadow-md rounded-lg">
                {tableLoading ? (
                    <TableSkeleton />
                ) : filteredPayments.length > 0 ? (
                    <Table
                        dataSource={filteredPayments}
                        columns={columns}
                        rowKey="id"
                        onChange={handleTableChange}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} of ${total} payments`,
                        }}
                        scroll={{ x: 900 }}
                        rowClassName="hover:bg-gray-50"
                        loading={tableLoading}
                    />
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No payments found"
                    >
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('add')}>
                            Add First Payment
                        </Button>
                    </Empty>
                )}
            </Card>

            {/* Payment Modal */}
            <Modal
                title={getModalTitle()}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={getModalFooter()}
                width={isViewMode ? 700 : 600}
                destroyOnClose
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
}