import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

interface Prescription {
  id: string;
  patient: string;
  doctor: string;
  medicines: { name: string; quantity: number }[];
  date: string;
  notes: string;
}

const LOCAL_STORAGE_KEY = "prescriptions";
const INVENTORY_KEY = "medical_inventory";

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [inventory, setInventory] = useState<string[]>([]);
  const [form, setForm] = useState<Partial<Prescription>>({
    patient: "",
    doctor: "",
    medicines: [{ name: "", quantity: 1 }],
    date: "",
    notes: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Load prescriptions and inventory from localStorage
  useEffect(() => {
    const storedPrescriptions = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedPrescriptions) setPrescriptions(JSON.parse(storedPrescriptions));

    const storedInventory = localStorage.getItem(INVENTORY_KEY);
    if (storedInventory) setInventory(JSON.parse(storedInventory));
  }, []);

  // Save prescriptions to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prescriptions));
  }, [prescriptions]);

  const handleAddOrUpdate = () => {
    if (!form.patient || !form.doctor || !form.date || !form.medicines || form.medicines.length === 0) {
      toast.error("Please fill all required fields");
      return;
    }

    for (let med of form.medicines) {
      if (!med.name || med.quantity <= 0) {
        toast.error("Medicine name and quantity must be valid");
        return;
      }
    }

    if (selectedId) {
      setPrescriptions(prev =>
        prev.map(p => (p.id === selectedId ? { ...p, ...form } as Prescription : p))
      );
      toast.success("Prescription updated successfully!");
    } else {
      const newPrescription: Prescription = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
        patient: form.patient!,
        doctor: form.doctor!,
        date: form.date!,
        medicines: form.medicines!,
        notes: form.notes || "",
      };
      setPrescriptions(prev => [...prev, newPrescription]);
      toast.success("Prescription added successfully!");
    }

    setForm({ patient: "", doctor: "", medicines: [{ name: "", quantity: 1 }], date: "", notes: "" });
    setSelectedId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (prescription: Prescription) => {
    setForm({ ...prescription });
    setSelectedId(prescription.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this prescription?")) {
      setPrescriptions(prev => prev.filter(p => p.id !== id));
      toast.success("Prescription deleted successfully!");
    }
  };

  const handleMedicineChange = (index: number, field: "name" | "quantity", value: string | number) => {
    const newMedicines = [...form.medicines!];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setForm({ ...form, medicines: newMedicines });
  };

  const addMedicineField = () => {
    setForm({ ...form, medicines: [...form.medicines!, { name: "", quantity: 1 }] });
  };

  const removeMedicineField = (index: number) => {
    const newMedicines = form.medicines!.filter((_, i) => i !== index);
    setForm({ ...form, medicines: newMedicines });
  };

  const filteredPrescriptions = prescriptions.filter(
    p =>
      p.patient.toLowerCase().includes(search.toLowerCase()) ||
      p.doctor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-2xl font-bold">Pharmacy</h1>
        <p className="text-muted-foreground">Prescriptions</p>
        <Input
          placeholder="Search by patient or doctor"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>{selectedId ? "Edit Prescription" : "Add Prescription"}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedId ? "Edit Prescription" : "Add Prescription"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patient">Patient Name</Label>
                <Input
                  id="patient"
                  value={form.patient}
                  onChange={e => setForm({ ...form, patient: e.target.value })}
                  placeholder="Patient Name"
                />
              </div>
              <div>
                <Label htmlFor="doctor">Doctor Name</Label>
                <Input
                  id="doctor"
                  value={form.doctor}
                  onChange={e => setForm({ ...form, doctor: e.target.value })}
                  placeholder="Doctor Name"
                />
              </div>
              <div>
                <Label>Medicines</Label>
                {form.medicines!.map((med, index) => (
                  <div key={index} className="flex space-x-2 items-center mb-2">
                    <Select
                      value={med.name}
                      onValueChange={value => handleMedicineChange(index, "name", value)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select Medicine" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventory.length === 0 ? (
                          <SelectItem value="">No medicines</SelectItem>
                        ) : (
                          inventory.map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={med.quantity}
                      onChange={e => handleMedicineChange(index, "quantity", Number(e.target.value))}
                    />
                    <Button size="sm" variant="destructive" onClick={() => removeMedicineField(index)}>Remove</Button>
                  </div>
                ))}
                <Button size="sm" onClick={addMedicineField}>Add Medicine</Button>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddOrUpdate}>{selectedId ? "Update" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Medicines</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrescriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No prescriptions found.</TableCell>
              </TableRow>
            ) : (
              filteredPrescriptions.map(prescription => (
                <TableRow key={prescription.id}>
                  <TableCell>{prescription.patient}</TableCell>
                  <TableCell>{prescription.doctor}</TableCell>
                  <TableCell>
                    {prescription.medicines.map(m => `${m.name} (${m.quantity})`).join(", ")}
                  </TableCell>
                  <TableCell>{prescription.date}</TableCell>
                  <TableCell>{prescription.notes}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" onClick={() => handleEdit(prescription)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(prescription.id)}>Delete</Button>
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
