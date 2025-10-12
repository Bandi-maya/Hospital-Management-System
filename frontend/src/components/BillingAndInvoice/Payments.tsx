import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
    Table, Input, Button, Modal, Select, DatePicker,
    message, Card, Tag, Tooltip, Popconfirm,
    Space, Row, Col, Statistic, Descriptions, Divider
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
    PhoneOutlined, EnvironmentOutlined, SafetyCertificateOutlined
} from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { getApi } from "@/ApiService";
import { toast } from "sonner";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

const { Option } = Select;
const { RangePicker } = DatePicker;

type Payment = {
    id: string;
    customerName: string;
    email: string;
    amount: number;
    date: string;
    method: "Cash" | "Card" | "UPI" | "Net Banking";
    status: "Paid" | "Pending" | "Failed";
};

const defaultPayments: Payment[] = [
    { id: uuidv4(), customerName: "John Doe", email: "john@example.com", amount: 500, date: "2025-09-01", method: "Card", status: "Paid" },
    { id: uuidv4(), customerName: "Jane Smith", email: "jane@example.com", amount: 1200, date: "2025-09-05", method: "UPI", status: "Pending" },
    { id: uuidv4(), customerName: "Bob Johnson", email: "bob@example.com", amount: 750, date: "2025-09-10", method: "Cash", status: "Failed" },
    { id: uuidv4(), customerName: "Alice Brown", email: "alice@example.com", amount: 300, date: "2025-09-15", method: "Net Banking", status: "Paid" },
    { id: uuidv4(), customerName: "Charlie Wilson", email: "charlie@example.com", amount: 950, date: "2025-09-20", method: "Card", status: "Pending" },
];

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
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        getApi("/payment")
            .then((data) => {
                if (!data.error) {
                    setPayments(data.data)
                }
                else {
                    toast.error(data.error)
                }
            })
            .catch((err) => toast.error("Error occurred while getting payments"))
    }, []);

    // Auto refresh notifier
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                message.info("🔄 Auto-refresh: Payment data reloaded");
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const filteredPayments = payments
    //     const filteredPayments = React.useMemo(() => payments
    //     // .filter(payment => {
    //         // const lowerSearchTerm = searchTerm.toLowerCase();
    //         // const matchesSearch = payment.customerName.toLowerCase().includes(lowerSearchTerm) || payment.email.toLowerCase().includes(lowerSearchTerm);
    //         // const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    //         // const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
    //         // const matchesDate = !dateRange || (dayjs(payment.date).isSameOrAfter(dateRange[0], 'day') && dayjs(payment.date).isSameOrBefore(dateRange[1], 'day'));
    //         // return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    // }), [payments, searchTerm, statusFilter, methodFilter, dateRange]);

    // Statistics
    const stats = React.useMemo(() => {
        const total = payments.length;
        const paid = payments.filter(p => p.status === "Paid").length;
        const pending = payments.filter(p => p.status === "Pending").length;
        const failed = payments.filter(p => p.status === "Failed").length;

        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const paidAmount = payments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0);
        const pendingAmount = payments.filter(p => p.status === "Pending").reduce((sum, p) => sum + p.amount, 0);
        const failedAmount = payments.filter(p => p.status === "Failed").reduce((sum, p) => sum + p.amount, 0);

        const cashPayments = payments.filter(p => p.method === "Cash").length;
        const cardPayments = payments.filter(p => p.method === "Card").length;
        const upiPayments = payments.filter(p => p.method === "UPI").length;
        const netBankingPayments = payments.filter(p => p.method === "Net Banking").length;

        const successRate = total > 0 ? (paid / total) * 100 : 0;
        const averagePayment = total > 0 ? totalAmount / total : 0;

        return {
            total,
            paid,
            pending,
            failed,
            totalAmount,
            paidAmount,
            pendingAmount,
            failedAmount,
            cashPayments,
            cardPayments,
            upiPayments,
            netBankingPayments,
            successRate,
            averagePayment
        };
    }, [payments]);

    const openModal = useCallback((mode: 'add' | 'edit' | 'view', payment?: Payment) => {
        setFormPayment(mode === 'add' ? {} : { ...payment });
        setIsEditMode(mode === 'edit');
        setIsViewMode(mode === 'view');
        setIsModalOpen(true);
    }, []);

    const handleDeletePayment = (id: string) => {
        const updated = payments.filter(p => p.id !== id);
        setPayments(updated);
        localStorage.setItem("payments", JSON.stringify(updated));
        message.success("Payment deleted successfully");
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
        const doc = new jsPDF();
        const { customerName, email, amount, date, method, status, id } = payment;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const brandColor = '#4A90E2';

        if (status === 'Paid') {
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
    };

    const handleBulkExport = () => {
        if (!filteredPayments.length) return message.warning("No payments to export");
        const doc = new jsPDF();
        const brandColor = '#16A085';

        const totalReportAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
        const paidCount = filteredPayments.filter(p => p.status === 'Paid').length;
        const tableData = filteredPayments.map((p, i) => [i + 1, p.customerName, dayjs(p.date).format('YYYY-MM-DD'), p.method, p.status, `$${p.amount.toFixed(2)}`]);

        autoTable(doc, {
            head: [['#', 'Customer', 'Date', 'Method', 'Status', 'Amount']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: brandColor },
            columnStyles: { 5: { halign: 'right' } },
            didDrawPage: (data) => {
                doc.setFontSize(20).setFont('helvetica', 'bold').setTextColor(brandColor).text('Payments Report', data.settings.margin.left, 20);
                const pageCount = (doc as any).internal.getNumberOfPages();
                doc.setFontSize(10).setTextColor(150);
                doc.text(`Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
                doc.text(`Generated on: ${dayjs().format('MMM DD, YYYY')}`, doc.internal.pageSize.width - data.settings.margin.right, doc.internal.pageSize.height - 10, { align: 'right' });
            },
            didParseCell: (data) => {
                if (data.section === 'head' && data.row.index === 0) {
                    autoTable(doc, {
                        startY: 30,
                        theme: 'grid',
                        body: [
                            [{ content: 'Report Summary', colSpan: 2, styles: { fontStyle: 'bold', fillColor: '#ECF0F1', textColor: brandColor } }],
                            ['Total Transactions', `${filteredPayments.length} (Paid: ${paidCount})`],
                            ['Total Amount', `$${totalReportAmount.toFixed(2)}`]
                        ],
                        margin: { left: data.settings.margin.left, right: data.settings.margin.right },
                        tableWidth: 'wrap'
                    });
                }
            },
            margin: { top: 30, bottom: 20 },
            startY: 65
        });

        doc.save(`Payments_Report_${dayjs().format('YYYY-MM-DD')}.pdf`);
        message.success(`Exported ${filteredPayments.length} payments`);
    };

    const getStatusColor = (status: string) => ({ "Paid": "green", "Pending": "orange", "Failed": "red" }[status] || "blue");
    const getMethodColor = (method: string) => ({ "Cash": "blue", "Card": "purple", "UPI": "geekblue", "Net Banking": "cyan" }[method] || "default");

    const getStatusIcon = (status: string) => {
        const icons = {
            Paid: <CheckCircleOutlined />,
            Pending: <ClockCircleOutlined />,
            Failed: <CloseCircleOutlined />,
        };
        return icons[status as keyof typeof icons];
    };

    const resetFilters = useCallback(() => {
        setSearchTerm("");
        setStatusFilter("all");
        setMethodFilter("all");
        setDateRange(null);
    }, []);

    const columns: ColumnsType<Payment> = [
        {
            title: (
                <Space>
                    <UserOutlined />
                    Customer Info
                </Space>
            ),
            key: "customer",
            render: (_, record) => (
                <Space>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <UserOutlined className="text-blue-600" />
                    </div>
                    <div>
                        <div style={{ fontWeight: "bold" }}>{record.customerName}</div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                            <MailOutlined /> {record.email}
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
                    <span className="font-bold text-green-600">${val.toFixed(2)}</span>
                    <div style={{ fontSize: "12px", color: "#999" }}>Total Amount</div>
                </Space>
            ),
            sorter: (a, b) => a.amount - b.amount
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
                <Tag color={getMethodColor(method)} className="font-medium">
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
                    <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            shape="circle"
                            type="primary"
                            ghost
                            onClick={() => openModal('view', record)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit">
                        <Button
                            icon={<EditOutlined />}
                            shape="circle"
                            onClick={() => openModal('edit', record)}
                        />
                    </Tooltip>
                    <Tooltip title="Export PDF">
                        <Button
                            icon={<FilePdfOutlined />}
                            shape="circle"
                            type="primary"
                            onClick={() => handleExportPaymentPDF(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
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
                    </Tooltip>
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
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarOutlined className="w-8 h-8 text-blue-600" />
                        </div>
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
                        <Descriptions.Item label={
                            <Space>
                                <IdcardOutlined />
                                Payment ID
                            </Space>
                        }>
                            {formPayment.id}
                        </Descriptions.Item>
                        <Descriptions.Item label={
                            <Space>
                                <UserOutlined />
                                Customer Name
                            </Space>
                        }>
                            {formPayment.customerName}
                        </Descriptions.Item>
                        <Descriptions.Item label={
                            <Space>
                                <MailOutlined />
                                Email
                            </Space>
                        }>
                            {formPayment.email}
                        </Descriptions.Item>
                        <Descriptions.Item label={
                            <Space>
                                <DollarOutlined />
                                Amount
                            </Space>
                        }>
                            <span className="font-bold text-green-600 text-lg">
                                ${formPayment.amount?.toFixed(2)}
                            </span>
                        </Descriptions.Item>
                        <Descriptions.Item label={
                            <Space>
                                <CalendarOutlined />
                                Payment Date
                            </Space>
                        }>
                            {formPayment.date ? dayjs(formPayment.date).format('MMM DD, YYYY') : ''}
                            <div style={{ fontSize: '12px', color: '#666' }}>
                                ({formPayment.date ? dayjs(formPayment.date).fromNow() : ''})
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label={
                            <Space>
                                <SafetyCertificateOutlined />
                                Payment Method
                            </Space>
                        }>
                            <Tag color={getMethodColor(formPayment.method || '')}>
                                {formPayment.method}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label={
                            <Space>
                                <DashboardOutlined />
                                Payment Status
                            </Space>
                        }>
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

        // Edit/Add Mode - Return to original form layout
        return (
            <div className="space-y-4 pt-4">
                <Input
                    placeholder="Customer Name"
                    value={formPayment.customerName}
                    onChange={e => setFormPayment({ ...formPayment, customerName: e.target.value })}
                    disabled={!isEditMode}
                    prefix={<UserOutlined />}
                />
                <Input
                    placeholder="Email"
                    value={formPayment.email}
                    onChange={e => setFormPayment({ ...formPayment, email: e.target.value })}
                    disabled={!isEditMode}
                    prefix={<MailOutlined />}
                />
                <Input
                    type="number"
                    placeholder="Amount"
                    value={formPayment.amount}
                    onChange={e => setFormPayment({ ...formPayment, amount: Number(e.target.value) })}
                    disabled={!isEditMode}
                    prefix={<DollarOutlined />}
                />
                <DatePicker
                    value={formPayment.date ? dayjs(formPayment.date) : null}
                    onChange={(_, dateString) => setFormPayment({ ...formPayment, date: dateString as string })}
                    disabled={!isEditMode}
                    style={{ width: "100%" }}
                />
                <Select
                    value={formPayment.method}
                    onChange={val => setFormPayment({ ...formPayment, method: val })}
                    disabled={!isEditMode}
                    style={{ width: "100%" }}
                    placeholder="Select Payment Method"
                >
                    <Option value="Cash">Cash</Option>
                    <Option value="Card">Card</Option>
                    <Option value="UPI">UPI</Option>
                    <Option value="Net Banking">Net Banking</Option>
                </Select>
                <Select
                    value={formPayment.status}
                    onChange={val => setFormPayment({ ...formPayment, status: val })}
                    disabled={!isEditMode}
                    style={{ width: "100%" }}
                    placeholder="Select Status"
                >
                    <Option value="Paid">Paid</Option>
                    <Option value="Pending">Pending</Option>
                    <Option value="Failed">Failed</Option>
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
            // Only show Close button in view mode
            return [<Button key="close" onClick={() => setIsModalOpen(false)}>Close</Button>];
        }

        if (isEditMode) {
            return [
                <Button key="back" onClick={() => setIsModalOpen(false)}>Cancel</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSavePayment} className="bg-blue-600 hover:bg-blue-700">
                    {formPayment.id ? "Update" : "Add"}
                </Button>
            ];
        }

        return [<Button key="back" onClick={() => setIsModalOpen(false)}>Close</Button>];
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <Card className="bg-white shadow-sm border-0">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <DollarOutlined className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
                            <p className="text-gray-600 mt-1">Manage and track all payment transactions</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
                        <Tooltip title="Auto Refresh">
                            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                                <SyncOutlined className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-600">Auto Refresh</span>
                                <div
                                    className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                >
                                    <div
                                        className={`w-3 h-3 rounded-full bg-white transform transition-transform ${autoRefresh ? 'translate-x-4' : 'translate-x-1'
                                            }`}
                                    />
                                </div>
                            </div>
                        </Tooltip>

                        <Tooltip title="Reset Filters">
                            <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                                Reset Filters
                            </Button>
                        </Tooltip>

                        <Tooltip title="Add New Payment">
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => openModal('add')}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <RocketOutlined /> Add Payment
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </Card>

            {/* Statistics Section */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card className="shadow-sm">
                        <Statistic
                            title="Total Payments"
                            value={stats.total}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card className="shadow-sm">
                        <Statistic
                            title="Total Amount"
                            value={stats.totalAmount}
                            prefix="$"
                            precision={2}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card className="shadow-sm">
                        <Statistic
                            title="Paid Amount"
                            value={stats.paidAmount}
                            prefix="$"
                            precision={2}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card className="shadow-sm">
                        <Statistic
                            title="Pending Amount"
                            value={stats.pendingAmount}
                            prefix="$"
                            precision={2}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card className="shadow-sm">
                        <Statistic
                            title="Success Rate"
                            value={stats.successRate}
                            suffix="%"
                            precision={1}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4}>
                    <Card className="shadow-sm">
                        <Statistic
                            title="Avg Payment"
                            value={stats.averagePayment}
                            prefix="$"
                            precision={2}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Payment Methods Statistics */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm">
                        <Statistic
                            title="Card Payments"
                            value={stats.cardPayments}
                            prefix={<CreditCardOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm">
                        <Statistic
                            title="UPI Payments"
                            value={stats.upiPayments}
                            prefix={<BankOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm">
                        <Statistic
                            title="Cash Payments"
                            value={stats.cashPayments}
                            prefix={<WalletOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="shadow-sm">
                        <Statistic
                            title="Net Banking"
                            value={stats.netBankingPayments}
                            prefix={<BankOutlined />}
                            valueStyle={{ color: '#13c2c2' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Search and Filter Section */}
            <Card className="bg-white shadow-sm border-0">
                <div className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center space-x-2">
                            <TeamOutlined className="w-5 h-5" />
                            <span className="text-lg font-semibold">All Payments</span>
                            <Tag color="blue" className="ml-2">
                                {filteredPayments.length}
                            </Tag>
                        </div>
                        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                            <Input
                                placeholder="Search customer or email..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                prefix={<SearchOutlined />}
                                allowClear
                                style={{ width: 250 }}
                            />
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                style={{ width: 150 }}
                                placeholder="Filter by status"
                            >
                                <Option value="all">All Status</Option>
                                <Option value="Paid">Paid</Option>
                                <Option value="Pending">Pending</Option>
                                <Option value="Failed">Failed</Option>
                            </Select>
                            <Select
                                value={methodFilter}
                                onChange={setMethodFilter}
                                style={{ width: 150 }}
                                placeholder="Filter by method"
                            >
                                <Option value="all">All Methods</Option>
                                <Option value="Cash">Cash</Option>
                                <Option value="Card">Card</Option>
                                <Option value="UPI">UPI</Option>
                                <Option value="Net Banking">Net Banking</Option>
                            </Select>
                            <RangePicker
                                value={dateRange}
                                onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])}
                            />
                            <Button
                                icon={<FilePdfOutlined />}
                                onClick={handleBulkExport}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Payments Table */}
            <Card className="shadow-md rounded-lg">
                <Table
                    dataSource={filteredPayments}
                    columns={columns}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} payments`,
                    }}
                    scroll={{ x: 900 }}
                    rowClassName="hover:bg-gray-50"
                    loading={loading}
                />
            </Card>

            {/* Payment Modal */}
            <Modal
                title={getModalTitle()}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={getModalFooter()}
                width={isViewMode ? 700 : 600}
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
}