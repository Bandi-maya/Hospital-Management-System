import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Plus, Download, FileText, Eye, Edit, Trash2, Building, Mail, Calendar, DollarSign, Filter } from "lucide-react";
import { getApi, PutApi } from "@/ApiService";
import { toast } from "sonner";

type Invoice = {
    id: string;
    customerName: string;
    email: string;
    date: string;
    amount: number;
    status: "Paid" | "Pending" | "Overdue";
};

type StatusFilter = "All" | "Paid" | "Pending" | "Overdue";

const defaultInvoices: Invoice[] = [
    { id: uuidv4(), customerName: "John Doe", email: "john@example.com", date: "2025-09-01", amount: 500, status: "Paid" },
    { id: uuidv4(), customerName: "Jane Smith", email: "jane@example.com", date: "2025-09-05", amount: 1200, status: "Pending" },
    { id: uuidv4(), customerName: "Bob Johnson", email: "bob@example.com", date: "2025-09-10", amount: 750, status: "Overdue" },
];

export default function AllInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAddMode, setIsAddMode] = useState(false);
    const [formInvoice, setFormInvoice] = useState<Partial<Invoice>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadInvoices = () => {
            setIsLoading(true);
            try {
                getApi('/invoice-details')
                    .then((response) => {
                        if (!response.error) {
                            setInvoices(response);
                        } else {
                            toast.error(response.error)
                        }
                    })
                    .catch((error) => {
                        console.error("Error fetching invoices from API:", error);
                    })
            } catch (error) {
                console.error("Error loading invoices:", error);
                setInvoices(defaultInvoices);
            } finally {
                setIsLoading(false);
            }
        };

        loadInvoices();
    }, []);

    // Enhanced filtering with status filter
    const filteredInvoices = invoices
    // .filter((inv) => {
    //     const matchesSearch =
    //         inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         inv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         inv.status.toLowerCase().includes(searchTerm.toLowerCase());

    //     const matchesStatus = statusFilter === "All" || inv.status === statusFilter;

    //     return matchesSearch && matchesStatus;
    // });

    // Calculate statistics
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidInvoices = invoices.filter(inv => inv.status === "Paid").length;
    const pendingInvoices = invoices.filter(inv => inv.status === "Pending").length;
    const overdueInvoices = invoices.filter(inv => inv.status === "Overdue").length;

    const handleViewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setFormInvoice(invoice);
        setIsEditMode(false);
        setIsAddMode(false);
        setIsModalOpen(true);
    };

    const handleEditInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setFormInvoice({ ...invoice });
        setIsEditMode(true);
        setIsAddMode(false);
        setIsModalOpen(true);
    };

    const handleAddInvoice = () => {
        setSelectedInvoice(null);
        setFormInvoice({
            date: new Date().toISOString().split('T')[0], // Pre-fill with current date
            status: "Pending"
        });
        setIsEditMode(true);
        setIsAddMode(true);
        setIsModalOpen(true);
    };

    const handleDeleteInvoice = (id: string) => {
        if (window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
            const updatedInvoices = invoices.filter((inv) => inv.id !== id);
            setInvoices(updatedInvoices);
            localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
        }
    };

    const handleSaveInvoice = () => {
        // Enhanced validation
        if (!formInvoice.customerName?.trim()) {
            alert("Customer name is required!");
            return;
        }

        if (!formInvoice.email?.trim() || !/\S+@\S+\.\S+/.test(formInvoice.email)) {
            alert("Please enter a valid email address!");
            return;
        }

        if (!formInvoice.date) {
            alert("Date is required!");
            return;
        }

        if (!formInvoice.amount || formInvoice.amount <= 0) {
            alert("Please enter a valid amount greater than 0!");
            return;
        }

        if (!formInvoice.status) {
            alert("Status is required!");
            return;
        }

        let updatedInvoices: Invoice[];

        try {
            if (isAddMode) {
                const newInvoice: Invoice = {
                    id: uuidv4(),
                    customerName: formInvoice.customerName.trim(),
                    email: formInvoice.email.trim(),
                    date: formInvoice.date,
                    amount: Number(formInvoice.amount),
                    status: formInvoice.status
                };
                updatedInvoices = [...invoices, newInvoice];
            } else if (isEditMode && formInvoice.id) {
                updatedInvoices = invoices.map((inv) =>
                    inv.id === formInvoice.id ? {
                        ...formInvoice,
                        customerName: formInvoice.customerName?.trim() || "",
                        email: formInvoice.email?.trim() || "",
                        amount: Number(formInvoice.amount),
                    } as Invoice : inv
                );
            } else {
                return;
            }

            setInvoices(updatedInvoices);
            localStorage.setItem("invoices", JSON.stringify(updatedInvoices));
            setIsModalOpen(false);
            setFormInvoice({});
        } catch (error) {
            console.error("Error saving invoice:", error);
            alert("Error saving invoice. Please try again.");
        }
    };

    // Enhanced PDF generation with better error handling
    const generateSimplePDF = async (invoice: Invoice) => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();

            // Set margins and starting position
            let yPosition = 20;
            const lineHeight = 7;
            const margin = 20;
            const pageWidth = 210;
            const contentWidth = pageWidth - (margin * 2);

            // Company Header with background
            doc.setFillColor(59, 130, 246);
            doc.rect(0, 0, pageWidth, 50, 'F');

            // Company Name (White text on blue background)
            doc.setFontSize(20);
            doc.setTextColor(255, 255, 255);
            doc.setFont(undefined, 'bold');
            doc.text("MEDICARE HMS", margin, 25);

            // Tagline
            doc.setFontSize(10);
            doc.text("Healthcare Management System", margin, 32);

            // Reset yPosition after header
            yPosition = 60;

            // Invoice title
            doc.setFontSize(18);
            doc.setTextColor(40, 40, 40);
            doc.text("INVOICE", margin, yPosition);
            yPosition += 10;

            // Invoice details section
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);

            // Left column - Invoice details
            doc.text(`Invoice ID: ${invoice.id.slice(0, 8)}`, margin, yPosition);
            doc.text(`Issue Date: ${invoice.date}`, margin, yPosition + lineHeight);
            doc.text(`Due Date: ${invoice.date}`, margin, yPosition + (lineHeight * 2));

            // Right column - Customer details
            const rightColumn = margin + 100;
            doc.text(`Bill To: ${invoice.customerName}`, rightColumn, yPosition);
            doc.text(`${invoice.email}`, rightColumn, yPosition + lineHeight);

            yPosition += (lineHeight * 3) + 10;

            // Line separator
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 10;

            // Service details header
            doc.setFontSize(12);
            doc.setTextColor(59, 130, 246);
            doc.text("SERVICE DETAILS", margin, yPosition);
            yPosition += 8;

            // Service table header
            doc.setFillColor(240, 240, 240);
            doc.setTextColor(80, 80, 80);
            doc.rect(margin, yPosition, contentWidth, 8, 'F');

            doc.text("Description", margin + 2, yPosition + 6);
            doc.text("Quantity", margin + 100, yPosition + 6);
            doc.text("Unit Price", margin + 130, yPosition + 6);
            doc.text("Amount", margin + 160, yPosition + 6);

            yPosition += 10;

            // Service row
            doc.setFillColor(250, 250, 250);
            doc.rect(margin, yPosition, contentWidth, 8, 'F');
            doc.text("Medical Consultation Service", margin + 2, yPosition + 6);
            doc.text("1", margin + 100, yPosition + 6);
            doc.text(`$${invoice.amount.toFixed(2)}`, margin + 130, yPosition + 6);
            doc.text(`$${invoice.amount.toFixed(2)}`, margin + 160, yPosition + 6);

            yPosition += 15;

            // Total section
            const totalStartY = yPosition;
            const labelX = margin + 120;
            const valueX = margin + 160;

            // Subtotal
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text("Subtotal:", labelX, yPosition + 7);
            doc.setTextColor(40, 40, 40);
            doc.text(`$${invoice.amount.toFixed(2)}`, valueX, yPosition + 7);
            yPosition += 8;

            // Tax
            doc.setTextColor(100, 100, 100);
            doc.text("Tax (0%):", labelX, yPosition + 7);
            doc.setTextColor(40, 40, 40);
            doc.text("$0.00", valueX, yPosition + 7);
            yPosition += 8;

            // Separator line
            doc.setDrawColor(200, 200, 200);
            doc.line(labelX - 5, yPosition + 3, valueX + 30, yPosition + 3);
            yPosition += 8;

            // Total
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(59, 130, 246);
            doc.text("TOTAL:", labelX, yPosition + 8);
            doc.text(`$${invoice.amount.toFixed(2)}`, valueX, yPosition + 8);

            yPosition += 20;

            // Status section
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text("Payment Status:", margin, yPosition);

            const statusColor = invoice.status === "Paid" ? [34, 197, 94] :
                invoice.status === "Pending" ? [234, 179, 8] : [239, 68, 68];
            doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
            doc.setFont(undefined, 'bold');
            doc.text(invoice.status.toUpperCase(), margin + 30, yPosition);

            // Add paid stamp watermark if invoice is paid
            if (invoice.status === "Paid") {
                doc.saveGraphicsState();
                const centerX = 105;
                const centerY = 148;
                const radius = 25;

                doc.setFillColor(34, 197, 94);
                doc.circle(centerX, centerY, radius, 'F');

                doc.setDrawColor(255, 255, 255);
                doc.setLineWidth(2);
                doc.circle(centerX, centerY, radius, 'D');

                doc.setFillColor(255, 255, 255);
                doc.circle(centerX, centerY, radius - 4, 'F');

                doc.setFontSize(14);
                doc.setTextColor(34, 197, 94);
                doc.setFont(undefined, 'bold');

                const paidText1 = "PAID";
                const paidText2 = "SUCCESSFULLY";
                const paidWidth1 = doc.getTextWidth(paidText1);
                const paidWidth2 = doc.getTextWidth(paidText2);

                doc.text(paidText1, centerX - paidWidth1 / 2, centerY - 5);
                doc.text(paidText2, centerX - paidWidth2 / 2, centerY + 7);
                doc.restoreGraphicsState();
            }

            // Footer
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            const footerY = 270;
            doc.text("Medicare HMS • 123 Healthcare Ave, Medical City, MC 12345", margin, footerY);
            doc.text("Phone: (555) 123-4567 • Email: support@medicarehms.com", margin, footerY + 5);
            doc.text("Thank you for choosing Medicare HMS for your healthcare needs", margin, footerY + 10);

            // Save the PDF
            const fileName = `Invoice_${invoice.customerName.replace(/\s+/g, '_')}_${invoice.date}.pdf`;
            doc.save(fileName);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Error generating PDF. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportPDF = (invoice: Invoice) => {
        generateSimplePDF(invoice);
    };

    const handleExportAllPaidPDFs = async () => {
        const paidInvoices = invoices.filter(invoice => invoice.status === "Paid");

        if (paidInvoices.length === 0) {
            alert("No paid invoices found to export.");
            return;
        }

        if (isLoading) return;
        setIsLoading(true);

        try {
            for (let i = 0; i < paidInvoices.length; i++) {
                await generateSimplePDF(paidInvoices[i]);
                // Small delay between exports to avoid browser issues
                if (i < paidInvoices.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportAllPaidAsSinglePDF = async () => {
        const paidInvoices = invoices.filter(invoice => invoice.status === "Paid");

        if (paidInvoices.length === 0) {
            alert("No paid invoices found to export.");
            return;
        }

        if (isLoading) return;
        setIsLoading(true);

        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();

            paidInvoices.forEach((invoice, index) => {
                if (index > 0) doc.addPage();

                let yPosition = 20;
                const margin = 20;
                const pageWidth = 210;

                // Company Header
                doc.setFillColor(59, 130, 246);
                doc.rect(0, 0, pageWidth, 40, 'F');
                doc.setFontSize(16);
                doc.setTextColor(255, 255, 255);
                doc.text("MEDICARE HMS - PAID INVOICE REPORT", margin, 25);

                yPosition = 50;

                // Invoice summary
                doc.setFontSize(12);
                doc.setTextColor(40, 40, 40);
                doc.text(`Invoice: ${invoice.customerName}`, margin, yPosition);
                doc.text(`Date: ${invoice.date} • Amount: $${invoice.amount.toFixed(2)}`, margin, yPosition + 7);
                doc.text(`ID: ${invoice.id.slice(0, 8)}`, margin, yPosition + 14);

                // Add small paid stamp
                doc.setFillColor(34, 197, 94);
                doc.circle(180, yPosition + 5, 6, 'F');
                doc.setFontSize(6);
                doc.setTextColor(255, 255, 255);
                doc.text("PAID", 177, yPosition + 7);
            });

            doc.save(`All_Paid_Invoices_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("Error generating combined PDF:", error);
            alert("Error generating combined PDF. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    function paymentStatusChange(record, status) {
        PutApi('/invoice-details', {
            id: record.id,
            order_id: record.order_id,
            total_amount: record.total_amount,
            status: status,
            created_by: record.created_by,
        }).then((response) => {
            if (!response.error) {
                toast.success("Payment status updated to Paid");
                window.location.reload();
            } else {
                toast.error(response.error)
            }
        }).catch((error) => {
            toast.error("Error updating payment status");
            console.error("Error updating payment status:", error);
        }
        );
    }

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Paid": return "default";
            case "Pending": return "secondary";
            case "Overdue": return "destructive";
            default: return "outline";
        }
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("All");
    };

    return (
        <TooltipProvider>
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Billing & Invoices</h1>
                        <p className="text-gray-600 mt-1">Manage and track all your invoices in one place</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={handleAddInvoice} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Invoice
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Create a new invoice</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={handleExportAllPaidPDFs} variant="outline" disabled={isLoading}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Paid PDFs
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Export all paid invoices as separate PDF files</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={handleExportAllPaidAsSinglePDF} variant="outline" disabled={isLoading}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Combined Report
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Export all paid invoices as a single PDF report</TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
                                </div>
                                <Building className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                                </div>
                                <DollarSign className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                                    <p className="text-2xl font-bold text-gray-900">{paidInvoices}</p>
                                </div>
                                <Calendar className="w-8 h-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border-l-4 border-l-yellow-500">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
                                    <p className="text-2xl font-bold text-gray-900">{pendingInvoices}</p>
                                    <p className="text-xs text-red-600 mt-1">Overdue: {overdueInvoices}</p>
                                </div>
                                <Mail className="w-8 h-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter Section */}
                <Card className="bg-white shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                            <span>All Invoices ({filteredInvoices.length})</span>
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search invoices..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8 w-full sm:w-64"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                        className="border rounded px-3 py-2 text-sm"
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                    {(searchTerm || statusFilter !== "All") && (
                                        <Button variant="outline" onClick={clearFilters} size="sm">
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-2">Loading...</p>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInvoices.map((invoice: any) => (
                                            <TableRow key={invoice.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">{invoice.order.user.name}</TableCell>
                                                <TableCell className="text-gray-600">{invoice.order.user.username}</TableCell>
                                                <TableCell>{invoice.updated_at}</TableCell>
                                                <TableCell className="text-right font-semibold">
                                                    ${invoice.total_amount.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={getStatusVariant(invoice.status)}>
                                                        {invoice.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end space-x-2">
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => paymentStatusChange(invoice, "CANCELLED")}
                                                                    disabled={isLoading}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Cancel</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => paymentStatusChange(invoice, "PAID")}
                                                                    disabled={isLoading}
                                                                >
                                                                    Paid
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Paid</TooltipContent>
                                                        </Tooltip>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleViewInvoice(invoice)}
                                                                    disabled={isLoading}
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>View invoice details</TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleEditInvoice(invoice)}
                                                                    disabled={isLoading}
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Edit invoice</TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleExportPDF(invoice)}
                                                                    disabled={isLoading}
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Download PDF</TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => handleDeleteInvoice(invoice.id)}
                                                                    disabled={isLoading}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Delete invoice</TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {filteredInvoices.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        {invoices.length === 0 ? (
                                            "No invoices found. Create your first invoice to get started."
                                        ) : (
                                            "No invoices found matching your search criteria."
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Invoice Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-md mx-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                {isAddMode ? (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        Add New Invoice
                                    </>
                                ) : isEditMode ? (
                                    <>
                                        <Edit className="w-5 h-5" />
                                        Edit Invoice
                                    </>
                                ) : (
                                    <>
                                        <Eye className="w-5 h-5" />
                                        Invoice Details
                                    </>
                                )}
                            </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Customer Name *</label>
                                <Input
                                    placeholder="Enter customer name"
                                    value={formInvoice.customerName || ""}
                                    onChange={(e) => setFormInvoice({ ...formInvoice, customerName: e.target.value })}
                                    disabled={!isEditMode}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Email *</label>
                                <Input
                                    placeholder="Enter email address"
                                    type="email"
                                    value={formInvoice.email || ""}
                                    onChange={(e) => setFormInvoice({ ...formInvoice, email: e.target.value })}
                                    disabled={!isEditMode}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Date *</label>
                                <Input
                                    type="date"
                                    value={formInvoice.date || ""}
                                    onChange={(e) => setFormInvoice({ ...formInvoice, date: e.target.value })}
                                    disabled={!isEditMode}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Amount *</label>
                                <Input
                                    type="number"
                                    placeholder="Enter amount"
                                    min="0"
                                    step="0.01"
                                    value={formInvoice.amount || ""}
                                    onChange={(e) => setFormInvoice({ ...formInvoice, amount: Number(e.target.value) })}
                                    disabled={!isEditMode}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Status *</label>
                                <select
                                    value={formInvoice.status || "Pending"}
                                    onChange={(e) => setFormInvoice({ ...formInvoice, status: e.target.value as Invoice["status"] })}
                                    className="w-full border rounded px-3 py-2 mt-1 disabled:bg-gray-100"
                                    disabled={!isEditMode}
                                >
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Overdue">Overdue</option>
                                </select>
                            </div>
                        </div>

                        <DialogFooter className="mt-6 space-x-2">
                            {isEditMode && (
                                <Button
                                    onClick={handleSaveInvoice}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    disabled={isLoading}
                                >
                                    {isAddMode ? "Create Invoice" : "Update Invoice"}
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                disabled={isLoading}
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
}