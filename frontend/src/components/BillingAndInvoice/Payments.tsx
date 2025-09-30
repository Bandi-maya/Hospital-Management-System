import React, { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
    Table, Input, Button, Modal, Select, DatePicker,
    message, Card, Statistic, Tag, Tooltip, Popconfirm,
    Space, Row, Col
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
    FilePdfOutlined, DollarOutlined, ReloadOutlined, EyeOutlined,
    CalendarOutlined, MailOutlined, UserOutlined
} from "@ant-design/icons";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

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
    const [formPayment, setFormPayment] = useState<Partial<Payment>>({});
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [methodFilter, setMethodFilter] = useState<string>("all");
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedPayments = localStorage.getItem("payments");
        const initialPayments = storedPayments ? JSON.parse(storedPayments) : defaultPayments;
        setPayments(initialPayments);
        if (!storedPayments) {
            localStorage.setItem("payments", JSON.stringify(defaultPayments));
        }
    }, []);

    const filteredPayments = React.useMemo(() => payments.filter(payment => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        const matchesSearch = payment.customerName.toLowerCase().includes(lowerSearchTerm) || payment.email.toLowerCase().includes(lowerSearchTerm);
        const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
        const matchesMethod = methodFilter === "all" || payment.method === methodFilter;
        const matchesDate = !dateRange || (dayjs(payment.date).isSameOrAfter(dateRange[0], 'day') && dayjs(payment.date).isSameOrBefore(dateRange[1], 'day'));
        return matchesSearch && matchesStatus && matchesMethod && matchesDate;
    }), [payments, searchTerm, statusFilter, methodFilter, dateRange]);

    const stats = React.useMemo(() => ({
        total: payments.length,
        pending: payments.filter(p => p.status === "Pending").length,
        totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
        paidAmount: payments.filter(p => p.status === "Paid").reduce((sum, p) => sum + p.amount, 0),
    }), [payments]);

    const openModal = useCallback((mode: 'add' | 'edit' | 'view', payment?: Payment) => {
        setFormPayment(mode === 'add' ? {} : { ...payment });
        setIsEditMode(mode !== 'view');
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

    const columns: ColumnsType<Payment> = [
        { title: "Customer", dataIndex: "customerName", key: "customerName", render: (text, record) => <div><div className="font-semibold">{text}</div><div className="text-xs text-gray-500">{record.email}</div></div> },
        { title: "Amount", dataIndex: "amount", key: "amount", render: val => <span className="font-bold text-green-600">${val.toFixed(2)}</span>, sorter: (a, b) => a.amount - b.amount },
        { title: "Date", dataIndex: "date", key: "date", render: date => dayjs(date).format('MMM DD, YYYY'), sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix() },
        { title: "Method", dataIndex: "method", key: "method", render: method => <Tag color={getMethodColor(method)} className="font-medium">{method}</Tag> },
        { title: "Status", dataIndex: "status", key: "status", render: status => <Tag color={getStatusColor(status)} className="font-medium">{status}</Tag> },
        {
            title: "Actions", key: "actions", render: (_, record) => (
                <Space>
                    <Tooltip title="View"><Button icon={<EyeOutlined />} size="small" onClick={() => openModal('view', record)} /></Tooltip>
                    <Tooltip title="Edit"><Button icon={<EditOutlined />} size="small" onClick={() => openModal('edit', record)} /></Tooltip>
                    <Tooltip title="Export PDF"><Button icon={<FilePdfOutlined />} size="small" onClick={() => handleExportPaymentPDF(record)} /></Tooltip>
                    <Popconfirm title="Delete?" onConfirm={() => handleDeletePayment(record.id)} okText="Yes" cancelText="No">
                        <Tooltip title="Delete"><Button icon={<DeleteOutlined />} size="small" danger /></Tooltip>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const resetFilters = useCallback(() => {
        setSearchTerm("");
        setStatusFilter("all");
        setMethodFilter("all");
        setDateRange(null);
    }, []);

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Billing & Payments</h1>
                    <p className="text-gray-600">Manage and track all payment transactions</p>
                </div>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={resetFilters}>Reset Filters</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('add')} className="bg-blue-600 hover:bg-blue-700">Add Payment</Button>
                </Space>
            </div>

            <Row gutter={16}>
                <Col span={6}><Card bordered={false} className="shadow-md"><Statistic title="Total Payments" value={stats.total} prefix={<DollarOutlined />} valueStyle={{ color: '#3f8600' }} /></Card></Col>
                <Col span={6}><Card bordered={false} className="shadow-md"><Statistic title="Total Amount" value={stats.totalAmount} prefix="$" precision={2} valueStyle={{ color: '#1890ff' }} /></Card></Col>
                <Col span={6}><Card bordered={false} className="shadow-md"><Statistic title="Paid Amount" value={stats.paidAmount} prefix="$" precision={2} valueStyle={{ color: '#52c41a' }} /></Card></Col>
                <Col span={6}><Card bordered={false} className="shadow-md"><Statistic title="Pending Payments" value={stats.pending} valueStyle={{ color: '#faad14' }} /></Card></Col>
            </Row>

            <Card className="shadow-md rounded-lg">
                <div className="flex flex-wrap gap-4 items-end">
                    <Input placeholder="Search customer or email" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} prefix={<SearchOutlined />} allowClear style={{ minWidth: 200 }} />
                    <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 150 }} options={[{ value: 'all', label: 'All Status' }, { value: 'Paid', label: 'Paid' }, { value: 'Pending', label: 'Pending' }, { value: 'Failed', label: 'Failed' }]} />
                    <Select value={methodFilter} onChange={setMethodFilter} style={{ width: 150 }} options={[{ value: 'all', label: 'All Methods' }, { value: 'Cash', label: 'Cash' }, { value: 'Card', label: 'Card' }, { value: 'UPI', label: 'UPI' }, { value: 'Net Banking', label: 'Net Banking' }]} />
                    <RangePicker value={dateRange} onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs])} />
                    <Button icon={<FilePdfOutlined />} onClick={handleBulkExport} className="bg-purple-600 hover:bg-purple-700 text-white">Export PDF</Button>
                </div>
            </Card>

            <Card className="shadow-md rounded-lg">
                <Table dataSource={filteredPayments} columns={columns} rowKey="id" pagination={{ pageSize: 10, showSizeChanger: true }} scroll={{ x: 900 }} rowClassName="hover:bg-gray-100" />
            </Card>

            <Modal
                title={isEditMode ? (formPayment.id ? "Edit Payment" : "Add Payment") : "Payment Details"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={isEditMode
                    ? [<Button key="back" onClick={() => setIsModalOpen(false)}>Cancel</Button>, <Button key="submit" type="primary" loading={loading} onClick={handleSavePayment} className="bg-blue-600 hover:bg-blue-700">{formPayment.id ? "Update" : "Add"}</Button>]
                    : [<Button key="back" onClick={() => setIsModalOpen(false)}>Close</Button>]
                }
                width={600}
            >
                <div className="space-y-4 pt-4">
                    <Input placeholder="Customer Name" value={formPayment.customerName} onChange={e => setFormPayment({ ...formPayment, customerName: e.target.value })} disabled={!isEditMode} prefix={<UserOutlined />} />
                    <Input placeholder="Email" value={formPayment.email} onChange={e => setFormPayment({ ...formPayment, email: e.target.value })} disabled={!isEditMode} prefix={<MailOutlined />} />
                    <Input type="number" placeholder="Amount" value={formPayment.amount} onChange={e => setFormPayment({ ...formPayment, amount: Number(e.target.value) })} disabled={!isEditMode} prefix={<DollarOutlined />} />
                    <DatePicker value={formPayment.date ? dayjs(formPayment.date) : null} onChange={(_, dateString) => setFormPayment({ ...formPayment, date: dateString as string })} disabled={!isEditMode} style={{ width: "100%" }} />
                    <Select value={formPayment.method} onChange={val => setFormPayment({ ...formPayment, method: val })} disabled={!isEditMode} style={{ width: "100%" }} placeholder="Select Payment Method" options={[{ value: 'Cash', label: 'Cash' }, { value: 'Card', label: 'Card' }, { value: 'UPI', label: 'UPI' }, { value: 'Net Banking', label: 'Net Banking' }]} />
                    <Select value={formPayment.status} onChange={val => setFormPayment({ ...formPayment, status: val })} disabled={!isEditMode} style={{ width: "100%" }} placeholder="Select Status" options={[{ value: 'Paid', label: 'Paid' }, { value: 'Pending', label: 'Pending' }, { value: 'Failed', label: 'Failed' }]} />
                </div>
            </Modal>
        </div>
    );
}