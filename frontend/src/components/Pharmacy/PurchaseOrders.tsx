import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getApi, PostApi, PutApi, DeleteApi } from "@/ApiService";

interface PurchaseOrder {
  id: number;
  user_id: number;
  received_date: string;
  taken_by: string;
  taken_by_phone_no: string;
  created_at?: string;
  updated_at?: string;
  items: {
    medicine_id: number;
    quantity: number;
    order_date: string;
  }[];
}

interface Medicine {
  id: number;
  name: string;
}

const defaultOrder: PurchaseOrder = {
  id: 0,
  user_id: 0,
  taken_by: "",
  taken_by_phone_no: "",
  received_date: "",
  items: [],
};

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [form, setForm] = useState<Partial<PurchaseOrder>>(defaultOrder);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [patients, setPatients] = useState([]);
  const loginData = JSON.parse(localStorage.getItem("loginData") || '{"user_id":8}');

  useEffect(() => {
    fetchOrders();
    fetchPatients();
    fetchMedicines();
  }, []);

  const fetchOrders = () => {
    getApi("/orders")
      .then((res) => {
        if (!res.error) {
          setOrders(res);
        } else {
          toast.error("Failed to load orders.");
        }
      })
      .catch(() => toast.error("Server error while fetching orders"));
  };

  const fetchPatients = () => {
    getApi("/users?user_type_id=3")
      .then((res) => {
        if (!res.error) {
          setPatients(res);
        } else {
          toast.error("Failed to load orders.");
        }
      })
      .catch(() => toast.error("Server error while fetching orders"));
  };

  const fetchMedicines = () => {
    getApi("/medicines")
      .then((res) => {
        if (!res.error) {
          setMedicines(res);
        } else {
          toast.error("Failed to load medicines.");
        }
      })
      .catch(() => toast.error("Server error while fetching medicines"));
  };

  const handleAddOrder = () => {
    if (!form.user_id || !form.received_date || !form.taken_by || !form.taken_by_phone_no || !form.items || form.items.length === 0) {
      toast.error("Fill all required fields and add at least one item.");
      return;
    }
    PostApi("/orders", { ...form, created_by: loginData.user_id })
      .then((res) => {
        if (!res.error) {
          toast.success("Order added successfully");
          setIsDialogOpen(false);
          fetchOrders();
          setForm(defaultOrder);
          setIsEditMode(false);
        } else {
          toast.error(res.error || "Failed to add order");
        }
      })
      .catch(() => toast.error("Server error while adding order"));
  };

  const handleUpdateOrder = () => {
    if (!form.id) return;
    PutApi("/orders", form)
      .then((res) => {
        if (!res.error) {
          toast.success("Order updated successfully");
          setIsDialogOpen(false);
          fetchOrders();
          setForm(defaultOrder);
          setIsEditMode(false);
        } else {
          toast.error(res.error || "Failed to update order");
        }
      })
      .catch(() => toast.error("Server error while updating order"));
  };

  const handleDeleteOrder = (id: number) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    DeleteApi(`/orders?id=${id}`)
      .then((res) => {
        if (!res.error) {
          toast.success("Order deleted");
          fetchOrders();
        } else {
          toast.error(res.error || "Failed to delete order");
        }
      })
      .catch(() => toast.error("Server error while deleting order"));
  };

  const handleEdit = (order: PurchaseOrder) => {
    setForm(order);
    setIsDialogOpen(true);
    setIsEditMode(true);
  };

  // Handlers for dynamic items editing:
  const handleItemChange = (
    index: number,
    field: keyof PurchaseOrder["items"][0],
    value: string | number
  ) => {
    if (!form.items) return;
    const updatedItems = [...form.items];
    if (field === "medicine_id" || field === "quantity") {
      updatedItems[index][field] = Number(value);
    } else {
      updatedItems[index][field] = value as string;
    }
    setForm({ ...form, items: updatedItems });
  };

  const handleAddItem = () => {
    const newItem = { medicine_id: 0, quantity: 1, order_date: "" };
    setForm({ ...form, items: [...(form.items || []), newItem] });
  };

  const handleRemoveItem = (index: number) => {
    if (!form.items) return;
    const updatedItems = [...form.items];
    updatedItems.splice(index, 1);
    setForm({ ...form, items: updatedItems });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Purchase Orders</h2>
          <p className="text-muted-foreground">Manage all medicine orders</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search by User ID or Date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setForm(defaultOrder);
              setIsEditMode(false);
            }
          }}>
            <DialogTrigger asChild>
              <Button>{isEditMode ? "Edit Order" : "New Order"}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Edit Purchase Order" : "New Purchase Order"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>User ID</Label>
                  <Select
                    value={form.user_id.toString()}
                    onValueChange={(val) =>
                      setForm({ ...form, user_id: Number(val) })
                      // handleItemChange(index, "medicine_id", Number(val))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Medicine" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((med) => (
                        <SelectItem key={med.id} value={med.id.toString()}>
                          {med.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Received Date</Label>
                  <Input
                    type="date"
                    value={form.received_date || ""}
                    onChange={(e) =>
                      setForm({ ...form, received_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Taken by</Label>
                  <Input
                    value={form.taken_by || ""}
                    onChange={(e) =>
                      setForm({ ...form, taken_by: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Taken by phone no</Label>
                  <Input
                    value={form.taken_by_phone_no || ""}
                    onChange={(e) =>
                      setForm({ ...form, taken_by_phone_no: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label className="mb-2">Items</Label>
                  {(form.items && form.items.length > 0) ? (
                    form.items.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-4 gap-4 items-end mb-4 border p-3 rounded-md"
                      >
                        <div>
                          <Label>Medicine</Label>
                          <Select
                            value={item.medicine_id.toString()}
                            onValueChange={(val) =>
                              handleItemChange(index, "medicine_id", Number(val))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Medicine" />
                            </SelectTrigger>
                            <SelectContent>
                              {medicines.map((med) => (
                                <SelectItem key={med.id} value={med.id.toString()}>
                                  {med.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, "quantity", Number(e.target.value))
                            }
                          />
                        </div>

                        <div>
                          <Label>Order Date</Label>
                          <Input
                            type="date"
                            value={item.order_date}
                            onChange={(e) =>
                              handleItemChange(index, "order_date", e.target.value)
                            }
                          />
                        </div>

                        <div className="flex items-center">
                          <Button
                            variant="destructive"
                            onClick={() => handleRemoveItem(index)}
                            className="mt-6"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No items added yet.</p>
                  )}

                  <Button onClick={handleAddItem} variant="outline" className="mt-2">
                    + Add Item
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setForm(defaultOrder);
                    setIsDialogOpen(false);
                    setIsEditMode(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={isEditMode ? handleUpdateOrder : handleAddOrder}>
                  {isEditMode ? "Update" : "Add"}
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
              <TableHead>Order ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Items Count</TableHead>
              <TableHead>Received Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders
                .filter((o) =>
                  o.user_id.toString().includes(search) ||
                  o.received_date.includes(search)
                )
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.user_id}</TableCell>
                    <TableCell>{order.items?.length}</TableCell>
                    <TableCell>{order.received_date}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button size="sm" onClick={() => handleEdit(order)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteOrder(order.id)}
                      >
                        Delete
                      </Button>
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
