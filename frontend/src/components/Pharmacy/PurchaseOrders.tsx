import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

interface PurchaseOrder {
  id: string;
  item: string;
  category: string;
  quantity: number;
  orderDate: string;
  deliveryStatus: "Pending" | "Delivered" | "Cancelled";
  notes?: string;
}

const LOCAL_STORAGE_KEY = "purchaseOrders";

// Default categories
const defaultCategories = ["Tablet", "Syrup", "Injection", "Ointment", "Capsule", "Drops"];

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Partial<PurchaseOrder>>({
    item: "",
    category: "",
    quantity: 0,
    orderDate: "",
    deliveryStatus: "Pending",
    notes: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Load orders from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) setOrders(JSON.parse(stored));
  }, []);

  // Save orders to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const handleAddOrUpdate = () => {
    if (!form.item || !form.category || !form.quantity || !form.orderDate) {
      toast.error("All fields are required");
      return;
    }

    if (form.quantity! <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    // Add new category if not exists
    if (!categories.includes(form.category)) {
      setCategories(prev => [...prev, form.category!]);
    }

    if (selectedOrderId) {
      // Update existing order
      setOrders(prev =>
        prev.map(o => (o.id === selectedOrderId ? { ...o, ...form } as PurchaseOrder : o))
      );
      toast.success("Order updated successfully!");
    } else {
      // Add new order
      const newOrder: PurchaseOrder = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
        item: form.item!,
        category: form.category!,
        quantity: form.quantity!,
        orderDate: form.orderDate!,
        deliveryStatus: form.deliveryStatus! || "Pending",
        notes: form.notes || "",
      };
      setOrders(prev => [...prev, newOrder]);
      toast.success("Order added successfully!");
    }

    setForm({ item: "", category: "", quantity: 0, orderDate: "", deliveryStatus: "Pending", notes: "" });
    setSelectedOrderId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (order: PurchaseOrder) => {
    setForm({ ...order });
    setSelectedOrderId(order.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      setOrders(prev => prev.filter(o => o.id !== id));
      toast.success("Order deleted successfully!");
    }
  };

  const filteredOrders = orders.filter(order =>
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
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>{selectedOrderId ? "Edit Order" : "New Order"}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{selectedOrderId ? "Edit Order" : "New Purchase Order"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="item">Item Name</Label>
                  <Input
                    id="item"
                    placeholder="Item Name"
                    value={form.item}
                    onChange={e => setForm({ ...form, item: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.category || undefined}
                    onValueChange={value => setForm({ ...form, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or type new category"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
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
                    onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="orderDate">Order Date</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={form.orderDate}
                    onChange={e => setForm({ ...form, orderDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="deliveryStatus">Delivery Status</Label>
                  <Select
                    value={form.deliveryStatus || "Pending"}
                    onValueChange={value => setForm({ ...form, deliveryStatus: value as PurchaseOrder["deliveryStatus"] })}
                  >
                    <SelectTrigger id="deliveryStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
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
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                  />
                </div>
              </div>

              <DialogFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddOrUpdate}>{selectedOrderId ? "Update" : "Add"}</Button>
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
              <TableHead>Quantity</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No purchase orders found.</TableCell>
              </TableRow>
            ) : (
              filteredOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>{order.item}</TableCell>
                  <TableCell>{order.category}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{order.orderDate}</TableCell>
                  <TableCell>{order.deliveryStatus}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" onClick={() => handleEdit(order)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(order.id)}>Delete</Button>
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
