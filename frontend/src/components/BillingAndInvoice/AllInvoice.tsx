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
import { 
    Search, 
    Plus, 
    Download, 
    FileText, 
    Eye, 
    Edit, 
    Trash2, 
    Building, 
    Mail, 
    Calendar, 
    DollarSign, 
    Filter,
    Users,
    RefreshCw,
    X,
    CheckCircle,
    Clock,
    AlertCircle,
    Crown,
    Shield,
    Key,
    Phone,
    MapPin,
    FileSearch
} from "lucide-react";
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
    const [autoRefresh, setAutoRefresh] = useState(true);

    const loadInvoices = () => {
        setIsLoading(true);
        try {
            getApi('/billing')
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

    useEffect(() => {
        loadInvoices();
    }, []);

    // Auto refresh notifier
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                loadInvoices();
            }, 30000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);

    const filteredInvoices = invoices;

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
            date: new Date().toISOString().split('T')[0],
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

    const getStatusColor = (status: string) =>
        ({
            Paid: "green",
            Pending: "orange",
            Overdue: "red",
        }[status] || "default");

    const getStatusIcon = (status: string) => {
        const icons = {
            Paid: <CheckCircle className="w-4 h-4" />,
            Pending: <Clock className="w-4 h-4" />,
            Overdue: <AlertCircle className="w-4 h-4" />,
        };
        return icons[status as keyof typeof icons];
    };

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

    const paymentStatusChange = (record, status) => {
        PutApi('/billing', {
            ...record,
            status: status,
        }).then((response) => {
            if (!response.error) {
                toast.success("Payment status updated to Paid");
                loadInvoices()
            } else {
                toast.error(response.error)
            }
        }).catch((error) => {
            toast.error("Error updating payment status");
            console.error("Error updating payment status:", error);
        });
    };

    return (
        <TooltipProvider>
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                {/* Header - Simplified without statistics */}
                <Card className="bg-white shadow-sm border-0">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Billing & Invoices</h1>
                                <p className="text-gray-600 mt-1">Manage and track all your invoices in one place</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                                        <RefreshCw className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm text-gray-600">Auto Refresh</span>
                                        <div 
                                            className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${
                                                autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                            onClick={() => setAutoRefresh(!autoRefresh)}
                                        >
                                            <div 
                                                className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                                                    autoRefresh ? 'translate-x-4' : 'translate-x-1'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>Auto refresh every 30 seconds</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button onClick={handleAddInvoice} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Invoice
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Create a new invoice</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </Card>

                {/* Search and Filter Section */}
                <Card className="bg-white shadow-sm border-0">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="w-5 h-5" />
                                <span>All Invoices</span>
                                <Badge variant="secondary" className="ml-2">
                                    {filteredInvoices.length}
                                </Badge>
                            </CardTitle>
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        placeholder="Search invoices..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 w-full sm:w-64 h-10"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                    {(searchTerm || statusFilter !== "All") && (
                                        <Button variant="outline" onClick={clearFilters} className="h-10">
                                            <X className="w-4 h-4 mr-2" />
                                            Clear
                                        </Button>
                                    )}
                                    <Button variant="outline" className="h-10">
                                        <Download className="w-4 h-4 mr-2" />
                                        Export
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-3">Loading invoices...</p>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                                            <TableHead className="font-semibold text-gray-900">
                                                <div className="flex items-center space-x-2">
                                                    <Users className="w-4 h-4" />
                                                    <span>Customer Info</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-900">
                                                <div className="flex items-center space-x-2">
                                                    <Mail className="w-4 h-4" />
                                                    <span>Email</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-900">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Date</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-900 text-right">
                                                <div className="flex items-center space-x-2 justify-end">
                                                    <DollarSign className="w-4 h-4" />
                                                    <span>Amount</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-900">
                                                <div className="flex items-center space-x-2">
                                                    <Shield className="w-4 h-4" />
                                                    <span>Status</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-semibold text-gray-900 text-right">
                                                <div className="flex items-center space-x-2 justify-end">
                                                    <FileSearch className="w-4 h-4" />
                                                    <span>Actions</span>
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredInvoices.map((invoice: any) => (
                                            <TableRow key={invoice.id} className="hover:bg-gray-50/50 border-b border-gray-100">
                                                <TableCell>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <Users className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{invoice.patient.name}</div>
                                                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                                                                <Phone className="w-3 h-3" />
                                                                <span>Contact Info</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2 text-gray-600">
                                                        <Mail className="w-4 h-4" />
                                                        <span>{invoice.patient.username}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="w-4 h-4 text-gray-500" />
                                                        <span className="text-gray-700">{invoice.updated_at}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="font-semibold text-gray-900 text-lg">
                                                        ${invoice.total_amount}
                                                    </div>
                                                    <div className="text-sm text-gray-500">Total Amount</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge 
                                                        variant={getStatusVariant(invoice.status)} 
                                                        className="flex items-center space-x-1 w-fit px-3 py-1"
                                                    >
                                                        {getStatusIcon(invoice.status)}
                                                        <span>{invoice.status}</span>
                                                    </Badge>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Last updated
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex justify-end space-x-1">
                                                        {invoice.status !== 'PAID' && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => paymentStatusChange(invoice, "CANCELLED")}
                                                                        disabled={isLoading}
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <X className="w-4 h-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Cancel Invoice</TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        {invoice.status !== 'PAID' && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => paymentStatusChange(invoice, "PAID")}
                                                                        disabled={isLoading}
                                                                        className="h-8 w-8 p-0"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Mark as Paid</TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleViewInvoice(invoice)}
                                                                    disabled={isLoading}
                                                                    className="h-8 w-8 p-0"
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
                                                                    className="h-8 w-8 p-0"
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
                                                                    onClick={() => {/* handleExportPDF(invoice) */}}
                                                                    disabled={isLoading}
                                                                    className="h-8 w-8 p-0"
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
                                                                    className="h-8 w-8 p-0"
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
                                    <div className="text-center py-12 text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
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
                    <DialogContent className="max-w-2xl mx-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-lg">
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

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Customer Name *</label>
                                    <Input
                                        placeholder="Enter customer name"
                                        value={formInvoice.customerName || ""}
                                        onChange={(e) => setFormInvoice({ ...formInvoice, customerName: e.target.value })}
                                        disabled={!isEditMode}
                                        className="mt-1 h-10"
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
                                        className="mt-1 h-10"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-700">Date *</label>
                                    <Input
                                        type="date"
                                        value={formInvoice.date || ""}
                                        onChange={(e) => setFormInvoice({ ...formInvoice, date: e.target.value })}
                                        disabled={!isEditMode}
                                        className="mt-1 h-10"
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
                                        className="mt-1 h-10"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Status *</label>
                                <select
                                    value={formInvoice.status || "Pending"}
                                    onChange={(e) => setFormInvoice({ ...formInvoice, status: e.target.value as Invoice["status"] })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 h-10 disabled:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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