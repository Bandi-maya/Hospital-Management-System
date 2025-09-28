import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

interface PurchaseOrder {
  id: string;
  item: string;
  category: string;
  quantity: number;
  price: number; // NEW FIELD
  orderDate: string;
  deliveryStatus: "Pending" | "Purchased" | "Cancelled"; // updated wording
  notes?: string;
}

const LOCAL_STORAGE_KEY = "purchaseOrders";
const defaultCategories = [
  "Tablet",
  "Syrup",
  "Injection",
  "Ointment",
  "Capsule",
  "Drops",
];

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Partial<PurchaseOrder>>({
    item: "",
    category: "",
    quantity: 0,
    price: 0,
    orderDate: "",
    deliveryStatus: "Pending",
    notes: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // New states for View & Print
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<PurchaseOrder | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Load orders from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) setOrders(JSON.parse(stored));
  }, []);

  // Save orders to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const resetForm = () => {
    setForm({
      item: "",
      category: "",
      quantity: 0,
      price: 0,
      orderDate: "",
      deliveryStatus: "Pending",
      notes: "",
    });
    setSelectedOrderId(null);
  };

  const handleAddOrUpdate = () => {
    if (!form.item || !form.category || !form.quantity || !form.price || !form.orderDate) {
      toast.error("All fields are required");
      return;
    }

    if (form.quantity! <= 0 || form.price! <= 0) {
      toast.error("Quantity & Price must be greater than 0");
      return;
    }

    // Ensure category is in dropdown
    if (form.category && !categories.includes(form.category)) {
      setCategories((prev) => [...prev, form.category!]);
    }

    if (selectedOrderId) {
      // Update existing order
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrderId ? ({ ...o, ...form } as PurchaseOrder) : o
        )
      );
      toast.success("Order updated successfully!");
    } else {
      // Add new order
      const newOrder: PurchaseOrder = {
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substr(2, 9),
        item: form.item!,
        category: form.category!,
        quantity: form.quantity!,
        price: form.price!,
        orderDate: form.orderDate!,
        deliveryStatus: form.deliveryStatus! || "Pending",
        notes: form.notes || "",
      };
      setOrders((prev) => [...prev, newOrder]);
      toast.success("New order added!");
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (order: PurchaseOrder) => {
    setForm({ ...order });
    setSelectedOrderId(order.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      toast.success("Order deleted successfully!");
    }
  };

  const handleView = (order: PurchaseOrder) => {
    setViewOrder(order);
    setIsViewOpen(true);
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const win = window.open("", "", "width=800,height=600");
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Purchase Order</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background: #f4f4f4; }
                .stamp {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%) rotate(-20deg);
                  font-size: 36px;
                  color: green;
                  opacity: 0.3;
                  border: 3px solid green;
                  padding: 10px 20px;
                  border-radius: 8px;
                }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        win.document.close();
        win.print();
      }
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.item.toLowerCase().includes(search.toLowerCase()) ||
      order.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header and controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">Pharmacy</h1>
          <p className="text-muted-foreground">Purchase Orders</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <Input
            placeholder="Search by item or category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>New Order</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {selectedOrderId ? "Edit Order" : "New Purchase Order"}
                </DialogTitle>
              </DialogHeader>
              {/* --- Order Form --- */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="item">Item Name</Label>
                  <Input
                    id="item"
                    placeholder="Item Name"
                    value={form.item}
                    onChange={(e) => setForm({ ...form, item: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.category || undefined}
                    onValueChange={(value) =>
                      setForm({ ...form, category: value })
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or type new category"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Quantity"
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: Number(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (per unit)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Price"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: Number(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="orderDate">Order Date</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={form.orderDate}
                    onChange={(e) =>
                      setForm({ ...form, orderDate: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="deliveryStatus">Status</Label>
                  <Select
                    value={form.deliveryStatus || "Pending"}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        deliveryStatus: value as PurchaseOrder["deliveryStatus"],
                      })
                    }
                  >
                    <SelectTrigger id="deliveryStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Purchased">Purchased</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    placeholder="Additional notes"
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                  />
                </div>
              </div>

              <DialogFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddOrUpdate}>
                  {selectedOrderId ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No purchase orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.item}</TableCell>
                  <TableCell>{order.category}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>₹{order.price}</TableCell>
                  <TableCell>₹{order.price * order.quantity}</TableCell>
                  <TableCell>{order.orderDate}</TableCell>
                  <TableCell>{order.deliveryStatus}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" onClick={() => handleEdit(order)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(order.id)}
                    >
                      Delete
                    </Button>
                    {order.deliveryStatus === "Purchased" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleView(order)}
                      >
                        View
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View & Print Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="p-0">
          {/* Flex wrapper to center content */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-md shadow-lg w-full max-w-lg p-6 relative">
              <DialogHeader>
                <DialogTitle>Purchase Order Receipt</DialogTitle>
              </DialogHeader>

              {viewOrder && (
                <div ref={printRef} className="space-y-2 relative w-full">
                  <h2 className="text-xl font-bold text-center">
                    Pharmacy Purchase Order
                  </h2>
                  <p><strong>Order ID:</strong> {viewOrder.id}</p>
                  <p><strong>Date:</strong> {viewOrder.orderDate}</p>

                  <table className="w-full border mt-4">
                    <thead>
                      <tr>
                        <th className="border p-2">Item</th>
                        <th className="border p-2">Category</th>
                        <th className="border p-2">Qty</th>
                        <th className="border p-2">Price</th>
                        <th className="border p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2">{viewOrder.item}</td>
                        <td className="border p-2">{viewOrder.category}</td>
                        <td className="border p-2">{viewOrder.quantity}</td>
                        <td className="border p-2">₹{viewOrder.price}</td>
                        <td className="border p-2">
                          ₹{viewOrder.price * viewOrder.quantity}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="mt-2"><strong>Notes:</strong> {viewOrder.notes || "N/A"}</p>
                  <p><strong>Status:</strong> {viewOrder.deliveryStatus}</p>

                  {viewOrder.deliveryStatus === "Purchased" && (
                    <div className="stamp absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-600 text-3xl opacity-30 border border-green-600 rounded-md p-3">
                      PURCHASE COMPLETED
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
                <Button onClick={handlePrint}>Print</Button>
              </DialogFooter>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
