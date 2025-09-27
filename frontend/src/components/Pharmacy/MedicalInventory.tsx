import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  expiryDate: string;
}

const LOCAL_STORAGE_KEY = "medicalInventory";

export default function MedicalInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Partial<InventoryItem>>({
    name: "",
    category: "",
    quantity: 0,
    expiryDate: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Load inventory from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) setInventory(JSON.parse(stored));
  }, []);

  // Save inventory to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(inventory));
  }, [inventory]);

  const handleAddOrUpdate = () => {
    if (!form.name || !form.category || !form.quantity || !form.expiryDate) {
      toast.error("All fields are required");
      return;
    }

    if (selectedItemId) {
      // Update item
      setInventory(prev =>
        prev.map(item => item.id === selectedItemId ? { ...item, ...form } as InventoryItem : item)
      );
      toast.success("Inventory updated successfully!");
    } else {
      // Add new item
      const newItem: InventoryItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
        name: form.name,
        category: form.category,
        quantity: form.quantity,
        expiryDate: form.expiryDate,
      };
      setInventory(prev => [...prev, newItem]);
      toast.success("Inventory added successfully!");
    }

    setForm({ name: "", category: "", quantity: 0, expiryDate: "" });
    setSelectedItemId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: InventoryItem) => {
    setForm({ ...item });
    setSelectedItemId(item.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      setInventory(prev => prev.filter(item => item.id !== id));
      toast.success("Item deleted successfully!");
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pharmacy</h1>
        <p className="text-muted-foreground">Medical Inventory</p>
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
              <Input
                placeholder="Medicine Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Category"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
              />
              <Input
                type="date"
                value={form.expiryDate}
                onChange={e => setForm({ ...form, expiryDate: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddOrUpdate}>{selectedItemId ? "Update" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No inventory found.
                </TableCell>
              </TableRow>
            ) : (
              filteredInventory.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.expiryDate}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
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
