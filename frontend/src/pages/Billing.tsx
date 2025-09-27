    // src/pages/Billing.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Dummy API (replace with real backend later)
const api = {
  async getInvoices() {
    return [
      {
        id: 1,
        patient: "John Doe",
        service: "Dental Cleaning",
        amount: 2000,
        status: "Paid",
        date: "2025-09-01",
      },
      {
        id: 2,
        patient: "Jane Smith",
        service: "Eye Checkup",
        amount: 1500,
        status: "Pending",
        date: "2025-09-10",
      },
    ];
  },
  async addInvoice(invoice: {
    patient: string;
    service: string;
    amount: number;
  }) {
    return {
      id: Math.random(),
      ...invoice,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
    };
  },
  async markPaid(id: number) {
    return { success: true, id };
  },
};

export default function Billing() {
  const queryClient = useQueryClient();

  // Fetch invoices
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: api.getInvoices,
  });

  // Add Invoice Mutation
  const addInvoiceMutation = useMutation({
    mutationFn: api.addInvoice,
    onSuccess: (newInvoice) => {
      queryClient.setQueryData(["invoices"], (old: any) =>
        old ? [...old, newInvoice] : [newInvoice]
      );
      toast.success("Invoice added successfully!");
    },
  });

  // Mark Paid Mutation
  const markPaidMutation = useMutation({
    mutationFn: api.markPaid,
    onSuccess: (_, id) => {
      queryClient.setQueryData(["invoices"], (old: any) =>
        old.map((inv: any) =>
          inv.id === id ? { ...inv, status: "Paid" } : inv
        )
      );
      toast.success("Invoice marked as Paid!");
    },
  });

  // Form state
  const [form, setForm] = useState({ patient: "", service: "", amount: "" });

  const handleAddInvoice = () => {
    if (!form.patient || !form.service || !form.amount) {
      toast.error("All fields are required");
      return;
    }
    addInvoiceMutation.mutate({
      patient: form.patient,
      service: form.service,
      amount: Number(form.amount),
    });
    setForm({ patient: "", service: "", amount: "" });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Billing & Invoices</h1>

        {/* Add Invoice Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Invoice</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Patient Name"
                value={form.patient}
                onChange={(e) => setForm({ ...form, patient: e.target.value })}
              />
              <Input
                placeholder="Service Provided"
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
              />
              <Input
                placeholder="Amount (₹)"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleAddInvoice}
                disabled={addInvoiceMutation.isPending}
              >
                {addInvoiceMutation.isPending ? "Saving..." : "Add Invoice"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invoice Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading invoices...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.patient}</TableCell>
                  <TableCell>{inv.service}</TableCell>
                  <TableCell>₹{inv.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        inv.status === "Paid" ? "default" : "destructive"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell className="text-right">
                    {inv.status === "Pending" && (
                      <Button
                        size="sm"
                        onClick={() => markPaidMutation.mutate(inv.id)}
                        disabled={markPaidMutation.isPending}
                      >
                        {markPaidMutation.isPending ? "Updating..." : "Mark Paid"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
