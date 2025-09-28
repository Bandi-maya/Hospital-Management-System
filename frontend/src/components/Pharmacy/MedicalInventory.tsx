import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DeleteApi, getApi, PostApi } from "@/ApiService";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  expiryDate: string;
  price: number;
  status: "Pending" | "Delivered";
}

const LOCAL_STORAGE_KEY = "medicalInventory";
const defaultCategories = ["Tablet", "Syrup", "Injection", "Ointment", "Capsule", "Drops"];

export default function MedicalInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    // category: "",
    quantity: 0,
    manufacturer: "",
    description: "",
    batch_no: "",
    expiryDate: "",
    price: 0,
    // status: "Pending",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  function loadData() {
    getApi('/medicine-stock')
      .then((data) => {
        if (!data?.error) {
          setInventory(data);
        }
      }).catch((err) => {
        console.error(err);
        toast.error("Failed to fetch inventory");
      })
  }

  // Load inventory from localStorage
  useEffect(() => {
    loadData()
  }, []);

  // Save inventory to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(inventory));
  }, [inventory]);

  async function handleAddOrUpdate() {
    if (!form.name || !form.manufacturer || !form.quantity || !form.expiryDate || !form.price) {
      toast.error("All fields are required");
      return;
    }

    if (form.quantity! <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (form.price! <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }

    const today = new Date();
    const expiry = new Date(form.expiryDate);
    if (expiry < today) {
      toast.error("Expiry date cannot be in the past");
      return;
    }

    // Add new category if not exists
    if (selectedItemId) {
      // Update item
      setInventory(prev =>
        prev.map(item => (item.id === selectedItemId ? { ...item, ...form } as InventoryItem : item))
      );
      toast.success("Inventory updated successfully!");
    } else {
      const newItem = {
        name: form.name!,
        manufacturer: form.manufacturer!,
        description: form.description!,
      };

      await PostApi('/medicines', newItem)
        .then(async (data) => {
          if (!data?.error) {
            await PostApi('/medicine-stock', {
              medicine_id: data.id,
              quantity: form.quantity,
              price: form.price,
              expiry_date: form.expiryDate,
              batch_no: form.batch_no
            }).then((res) => {
              if (!res?.error) {
                toast.success("Inventory added successfully!");
              }
            }).catch((err) => {
              console.error(err);
              toast.error("Failed to add inventory stock");
            });
          }
        }).catch((err) => {
          console.error(err);
          toast.error("Failed to add inventory");
        });
    }

    setForm({
      manufacturer: "",
      batch_no: "",
      description: "",
      name: "",
      quantity: 0,
      expiryDate: "",
      price: 0
    });
    setSelectedItemId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item) => {
    setForm({ ...item });
    setSelectedItemId(item.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (record) => {
    if (confirm("Are you sure you want to delete this item?")) {
      DeleteApi("/medicine-stock", { id: record.id })
        .then((data) => {
          if (!data?.error) {
            DeleteApi("/medicines", { id: record.medicine.id })
              .then((data) => {
                if (!data?.error) {
                  toast.success("Item deleted successfully!");
                  loadData();
                }
                else {
                  toast.error(data.error);
                }
              }).catch((err) => {
                console.error(err);
                toast.error("Failed to delete item");
              })
          }
          else {
            toast.error(data.error);
          }
        }).catch((err) => {
          console.error(err);
          toast.error("Failed to delete item");
        })
    }
  };

  const filteredInventory = inventory
  // .filter(item =>
  //   item.name.toLowerCase().includes(search.toLowerCase()) ||
  //   item.category.toLowerCase().includes(search.toLowerCase())
  // );

  const selectedItem = inventory.find(item => item.id === selectedItemId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold">Pharmacy</h1>
          <p className="text-muted-foreground">Medical Inventory</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <Input
            placeholder="Search by name or category"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>{selectedItemId ? "Edit Item" : "Add Item"}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{selectedItemId ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Medicine Name</Label>
                  <Input
                    id="name"
                    placeholder="Medicine Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="name">Description</Label>
                  <Input
                    id="description"
                    placeholder="Medicine Name"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="name">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    placeholder="Medicine Name"
                    value={form.manufacturer}
                    onChange={e => setForm({ ...form, manufacturer: e.target.value })}
                  />
                </div>

                {/* <div>
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
                </div> */}

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
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Price"
                    value={form.price}
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Batch no</Label>
                  <Input
                    id="batch_no"
                    placeholder="Price"
                    value={form.batch_no}
                    onChange={e => setForm({ ...form, batch_no: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={form.expiryDate}
                    onChange={e => setForm({ ...form, expiryDate: e.target.value })}
                  />
                </div>

                {/* <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={value => setForm({ ...form, status: value as "Pending" | "Delivered" })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div> */}
              </div>

              <DialogFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddOrUpdate}>{selectedItemId ? "Update" : "Add"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Price (₹)</TableHead>
              <TableHead>Expiry Date</TableHead>
              {/* <TableHead>Status</TableHead> */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No inventory found.</TableCell>
              </TableRow>
            ) : (
              filteredInventory.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.medicine.name}</TableCell>
                  <TableCell>{item.medicine.manufacturer}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>₹{item.price}</TableCell>
                  <TableCell>{item.expiry_date}</TableCell>
                  {/* <TableCell>{item.status}</TableCell> */}
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item)}>Delete</Button>
                    {/* {item.status === "Delivered" && (
                      <Button size="sm" variant="secondary" onClick={() => { setSelectedItemId(item.id); setIsViewDialogOpen(true); }}>
                        View
                      </Button>
                    )} */}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inventory Details</DialogTitle>
          </DialogHeader>
          {selectedItem ? (
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedItem.name}</p>
              <p><strong>Category:</strong> {selectedItem.category}</p>
              <p><strong>Quantity:</strong> {selectedItem.quantity}</p>
              <p><strong>Price:</strong> ₹{selectedItem.price}</p>
              <p><strong>Expiry Date:</strong> {selectedItem.expiryDate}</p>
              <p><strong>Status:</strong> {selectedItem.status}</p>
            </div>
          ) : (
            <p>No item selected</p>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
