import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { Badge } from "@/components/ui/badge";
import { getApi } from "@/ApiService";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Token } from "./CreateToken";

export default function TokenCalendarView() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [doctors, setDoctors] = useState([])
  const [departments, setDepartments] = useState([])

  function getDoctors() {
    getApi('/users?user_type_id=2')
      .then((data) => {
        if (!data.error) {
          setDoctors(data)
        }
        else {
          toast.error(data.error)
        }
      }).catch((err) => {
        toast.error("Error occurred while getting doctors")
        console.error("Error: ", err)
      })
  }

  function getDepartments() {
    getApi('/departments')
      .then((data) => {
        if (!data.error) {
          setDepartments(data)
        }
        else {
          toast.error(data.error)
        }
      }).catch((err) => {
        toast.error("Error occurred while getting departments")
        console.error("Error: ", err)
      })
  }

  function loadData(selectedDoctor, selectedDate, selectedDepartment) {
    let params = []
    if (selectedDoctor) {
      params.push(`doctor_id=${selectedDoctor}`)
    }
    if (selectedDate) {
      params.push(`date=${selectedDate}`)
    }
    if (selectedDepartment) {
      params.push(`department_id=${selectedDepartment}`)
    }
    if (params.length > 1) {
      getApi(`/tokens?${params.join('&')}`)
        .then((data) => {
          if (!data.error) {
            setTokens(data)
          }
          else {
            toast.error(data.error)
          }
        }).catch((err) => {
          toast.error("Error occurred while getting Tokens")
          console.error("Error: ", err)
        })
    }
  }

  useEffect(() => {
    getDoctors()
    getDepartments()
  }, [])

  useEffect(() => {
    loadData(selectedDate, selectedDoctor, selectedDepartment)
  }, [selectedDate, selectedDoctor, selectedDepartment]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Tokens Management</h1>
        <p className="text-muted-foreground">Calendar View</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar */}
        <div className="md:w-1/3">
          <Calendar
            onChange={(value) => {
              if (value instanceof Date) {
                setSelectedDate(value);
              } else if (Array.isArray(value) && value[0] instanceof Date) {
                setSelectedDate(value[0]);
              }
            }}
            value={selectedDate}
          />
        </div>

        <div className="md:w-2/3 space-y-4">
          <h2 className="text-xl font-semibold">
            Tokens for {selectedDate.toDateString()}
          </h2>

          <div className="space-y-1">
            <Label>Department</Label>
            <Select value={selectedDoctor} onValueChange={(val) => setSelectedDoctor(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Doctor</Label>
            <Select value={selectedDoctor} onValueChange={(val) => setSelectedDoctor(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.username}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tokens.length === 0 ? (
            <p className="text-gray-500">No appointments scheduled for this day.</p>
          ) : (
            <div className="space-y-2">
              {tokens.map(app => (
                <div
                  key={app.id}
                  className="p-4 border rounded-lg flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <p><strong>Patient:</strong> {app.patient}</p>
                    <p><strong>Doctor:</strong> {app.doctor}</p>
                    <p><strong>Token Number:</strong> {app.token_number}</p>
                  </div>
                  <Badge
                    variant={
                      app.status === "Completed"
                        ? "default"
                        : app.status === "Confirmed"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {app.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
