import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { getApi, PostApi, PutApi } from "@/ApiService";

interface Billing {
  id?: string;
  patient_id: string;
  doctor_id: string;
  medicines: { medicine_id: string; quantity: number }[];
  tests: { test_id: string; }[];
  notes: string;
}

export default function Billing() {
  const [billings, setBilling] = useState<Billing[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [form, setForm] = useState<Partial<Billing>>({
    patient_id: "",
    doctor_id: "",
    medicines: [{ medicine_id: "", quantity: 1 }],
    tests: [{ test_id: "" }],
    notes: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [search, setSearch] = useState("");
  const loginData = localStorage.getItem('loginData')

  // For viewing billing
  const [viewPrescription, setViewBilling] = useState<Billing | null>(null);

  // Load billings and inventory from localStorage
  useEffect(() => {
    Promise.all([
      getApi('/medicines'),
      getApi('/lab-tests'),
      getApi("/users?user_type_id=2")
    ]).then(([data, data1, data2]) => {
      if (!data.error) {
        setInventory(data)
      }
      else {
        toast.error(data.error)
      }
      if (!data1.error) {
        setTests(data1)
      }
      else {
        toast.error(data1.error)
      }
      if (!data2.error) {
        setPatients(data2)
      }
      else {
        toast.error(data2.error)
      }
    }).catch((err) => {
      console.error("Error: ", err)
      toast.error("Error occurred while getting data.")
    })
    loadBilling()
  }, []);

  function loadBilling() {
    getApi("/billing")
      .then((data) => {
        if (!data.error) {
          setBilling(data)
        }
        else {
          toast.error(data.error)
        }
      }).catch((err) => {
        console.error("Error: ", err)
        toast.error("Error occurred while getting billings.")
      })
  }

  const handleAddOrUpdate = (selectedPrescriptionData = selectedPrescription, isStatusUpdate = false) => {
    form.doctor_id = loginData?.['id'] || 1;
    if (!isStatusUpdate) {
      if (!form.patient_id || !form.medicines || form.medicines.length === 0) {
        toast.error("Please fill all required fields");
        return;
      }

      for (let med of form.medicines) {
        if (!med.medicine_id || med.quantity <= 0) {
          toast.error("Medicine name and quantity must be valid");
          return;
        }
      }

      for (let test of form.tests) {
        if (!test.test_id) {
          toast.error("Test name must be valid");
          return;
        }
      }
    }

    if (selectedPrescriptionData) {
      let payload = !isStatusUpdate ? { ...selectedPrescriptionData, ...form } : { ...selectedPrescriptionData }
      PutApi('/billing', { ...payload })
        .then((data) => {
          if (!data.error) {
            loadBilling()
            toast.success("Billing updated successfully!");
          }
          else {
            toast.error(data.error)
          }
        }).catch((err) => {
          console.error("Error: ", err)
          toast.error("Error occurred while updating billing.")
        })
    } else {
      const newPrescription: Billing = {
        // id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
        patient_id: form.patient_id!,
        doctor_id: form.doctor_id!,
        medicines: form.medicines!,
        tests: form.tests!,
        notes: form.notes || "",
      };
      PostApi('/billing', { ...newPrescription })
        .then((data) => {
          if (!data.error) {
            loadBilling()
            toast.success("Billing updated successfully!");
          }
          else {
            toast.error(data.error)
          }
        }).catch((err) => {
          console.error("Error: ", err)
          toast.error("Error occurred while updating billing.")
        })
      setBilling(prev => [...prev, newPrescription]);
      toast.success("Billing added successfully!");
    }

    setForm({ patient_id: "", doctor_id: "", medicines: [{ medicine_id: "", quantity: 1 }], tests: [{ test_id: "" }], notes: "" });
    setSelectedPrescription(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (billing: Billing) => {
    setForm({ ...billing });
    setSelectedPrescription(billing.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this billing?")) {
      setBilling(prev => prev.filter(p => p.id !== id));
      toast.success("Billing deleted successfully!");
    }
  };

  function handleStatusChange(billing, status) {
    handleAddOrUpdate({ ...billing, status: status }, true)
  }

  const handleMedicineChange = (index: number, field: "medicine_id" | "quantity", value: string | number) => {
    const newMedicines = [...form.medicines!];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setForm({ ...form, medicines: newMedicines });
  };

  const handleTestChange = (index: number, field: any, value: string | number) => {
    const newMedicines = [...form.tests!];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setForm({ ...form, tests: newMedicines });
  };

  const addTestField = () => {
    setForm({ ...form, tests: [...form.tests!, { test_id: "" }] });
  };

  const removeTestField = (index: number) => {
    const newTests = form.tests!.filter((_, i) => i !== index);
    setForm({ ...form, tests: newTests });
  };

  const addMedicineField = () => {
    setForm({ ...form, medicines: [...form.medicines!, { medicine_id: "", quantity: 1 }] });
  };

  const removeMedicineField = (index: number) => {
    const newMedicines = form.medicines!.filter((_, i) => i !== index);
    setForm({ ...form, medicines: newMedicines });
  };

  const handlePrint = () => {
    const printContent = document.getElementById("billing-print-area")?.innerHTML;
    if (!printContent) return;
    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Billing</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .signature { margin-top: 40px; text-align: right; font-weight: bold; }
            .signature-line { margin-top: 50px; border-top: 1px solid #000; width: 200px; float: right; text-align: center; }
          </style>
        </head>
        <body>
          ${printContent}
          <div class="signature">
            <div class="signature-line">Doctor's Signature</div>
          </div>
        </body>
      </html>
    `);
      printWindow.document.close();
      printWindow.print();
    }
  };


  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h1 className="text-2xl font-bold">Pharmacy</h1>
        <p className="text-muted-foreground">Billing</p>
        <Input
          placeholder="Search by patient or doctor"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>{selectedPrescription ? "Edit Billing" : "Add Billing"}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedPrescription ? "Edit Billing" : "Add Billing"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="patient">Patient Name</Label>
                <Select
                  value={form.patient_id}
                  onValueChange={value => setForm({ ...form, patient_id: value })}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select Patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.length === 0 ? (
                      <SelectItem value="--">No Patients</SelectItem>
                    ) : (
                      patients.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* <div>
                <Label htmlFor="doctor">Doctor Name</Label>
                <Input
                  id="doctor"
                  value={form.doctor}
                  onChange={e => setForm({ ...form, doctor: e.target.value })}
                  placeholder="Doctor Name"
                />
              </div> */}
              <div>
                <Label>Medicines</Label>
                {form.medicines!.map((med, index) => (
                  <div key={index} className="flex space-x-2 items-center mb-2">
                    <Select
                      value={med.medicine_id}
                      onValueChange={value => handleMedicineChange(index, "medicine_id", value)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select Medicine" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventory.length === 0 ? (
                          <SelectItem value="--">No medicines</SelectItem>
                        ) : (
                          inventory.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
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
                <Label>Tests</Label>
                {form.tests!.map((med, index) => (
                  <div key={index} className="flex space-x-2 items-center mb-2">
                    <Select
                      value={med.test_id}
                      onValueChange={value => handleTestChange(index, "test_id", value)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select Medicine" />
                      </SelectTrigger>
                      <SelectContent>
                        {tests.length === 0 ? (
                          <SelectItem value="--">No Tests</SelectItem>
                        ) : (
                          tests.map(m => (
                            <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="destructive" onClick={() => removeTestField(index)}>Remove</Button>
                  </div>
                ))}
                <Button size="sm" onClick={addTestField}>Add Test</Button>
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
              <Button onClick={() => handleAddOrUpdate()}>{selectedPrescription ? "Update" : "Add"}</Button>
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
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {billings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No billings found.</TableCell>
              </TableRow>
            ) : (
              billings.map(billing => (
                <TableRow key={billing.id}>
                  <TableCell>{billing.patient_id}</TableCell>
                  <TableCell>{billing.doctor_id}</TableCell>
                  <TableCell>
                    {/* {billing.medicines.map(m => `${m.id} (${m.quantity})`).join(", ")} */}
                  </TableCell>
                  <TableCell>{billing.notes}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {billing?.['status'] !== 'PAID' && <Button size="sm" onClick={() => handleEdit(billing)}>Edit</Button>}
                    {billing?.['status'] !== 'PAID' && <Button size="sm" onClick={() => handleStatusChange(billing, "PAID")}>Mark Paid</Button>}
                    {/* <Button size="sm" variant="destructive" onClick={() => handleDelete(billing.id)}>Delete</Button> */}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Billing Modal */}
      {viewPrescription && (
        <Dialog open={!!viewPrescription} onOpenChange={() => setViewBilling(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Billing Details</DialogTitle>
            </DialogHeader>
            <div id="billing-print-area" className="p-4">
              <h2>Billing</h2>
              <p><strong>Patient:</strong> {viewPrescription.patient_id}</p>
              <p><strong>Doctor:</strong> {viewPrescription.doctor_id}</p>
              <h3 className="mt-2 font-semibold">Medicines</h3>
              <table className="w-full border mt-2">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Medicine</th>
                    <th className="border px-2 py-1">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {viewPrescription.medicines.map((m, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{m.medicine_id}</td>
                      <td className="border px-2 py-1">{m.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {viewPrescription.notes && (
                <p className="mt-2"><strong>Notes:</strong> {viewPrescription.notes}</p>
              )}
            </div>
            <DialogFooter className="flex justify-end space-x-2">
              <Button onClick={handlePrint}>Print / Save PDF</Button>
              <Button variant="outline" onClick={() => setViewBilling(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
