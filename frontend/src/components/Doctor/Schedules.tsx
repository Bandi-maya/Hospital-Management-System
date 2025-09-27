import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, TimePicker, Popconfirm } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { toast } from "sonner";

const { Option } = Select;

interface Schedule {
  id: string;
  doctorName: string;
  specialization: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

// Predefined doctors for selection
const DOCTORS = [
  { name: "Dr. Sarah Johnson", specialization: "Cardiology" },
  { name: "Dr. Michael Chen", specialization: "Neurology" },
  { name: "Dr. Emily Davis", specialization: "Pediatrics" },
];

const LOCAL_STORAGE_KEY = "schedules";

export default function Schedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");

  // Load schedules from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) setSchedules(JSON.parse(stored));
  }, []);

  // Save schedules to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(schedules));
  }, [schedules]);

  const handleOpenModal = (schedule?: Schedule) => {
    if (schedule) {
      setEditingSchedule(schedule);
      form.setFieldsValue({
        doctorName: schedule.doctorName,
        specialization: schedule.specialization,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        notes: schedule.notes,
      });
    } else {
      setEditingSchedule(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSubmit = (values: any) => {
    const newSchedule: Schedule = {
      id: editingSchedule ? editingSchedule.id : crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
      doctorName: values.doctorName,
      specialization: values.specialization,
      date: values.date.format("YYYY-MM-DD"),
      startTime: values.startTime.format("HH:mm"),
      endTime: values.endTime.format("HH:mm"),
      notes: values.notes || "",
    };

    if (editingSchedule) {
      setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? newSchedule : s));
      toast.success("Schedule updated successfully!");
    } else {
      setSchedules(prev => [...prev, newSchedule]);
      toast.success("Schedule added successfully!");
    }

    setIsModalVisible(false);
    setEditingSchedule(null);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      setSchedules(prev => prev.filter(s => s.id !== id));
      toast.success("Schedule deleted successfully!");
    }
  };

  const filteredSchedules = schedules.filter(s =>
    s.doctorName.toLowerCase().includes(search.toLowerCase()) ||
    s.date.includes(search)
  );

  const columns = [
    { title: "Doctor", dataIndex: "doctorName", key: "doctorName" },
    { title: "Specialization", dataIndex: "specialization", key: "specialization" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Start Time", dataIndex: "startTime", key: "startTime" },
    { title: "End Time", dataIndex: "endTime", key: "endTime" },
    { title: "Notes", dataIndex: "notes", key: "notes" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Schedule) => (
        <div className="space-x-2">
          <Button size="small" onClick={() => handleOpenModal(record)}>Edit</Button>
          <Popconfirm
            title="Delete this schedule?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Schedules</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search by doctor or date"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Add Schedule</Button>
        </div>
      </div>

      <Table
        dataSource={filteredSchedules}
        columns={columns}
        rowKey="id"
      />

      <Modal
        title={editingSchedule ? "Edit Schedule" : "Add Schedule"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Doctor"
            name="doctorName"
            rules={[{ required: true, message: "Select a doctor" }]}
          >
            <Select
              showSearch
              placeholder="Select doctor"
              optionFilterProp="children"
              onChange={(value) => {
                const doctor = DOCTORS.find(d => d.name === value);
                if (doctor) form.setFieldsValue({ specialization: doctor.specialization });
              }}
            >
              {DOCTORS.map(d => <Option key={d.name} value={d.name}>{d.name}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item
            label="Specialization"
            name="specialization"
            rules={[{ required: true, message: "Select specialization" }]}
          >
            <Select showSearch placeholder="Select specialization" optionFilterProp="children">
              {[...new Set(DOCTORS.map(d => d.specialization))].map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </Form.Item>

          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Select date" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            label="Start Time"
            name="startTime"
            rules={[{ required: true, message: "Select start time" }]}
          >
            <TimePicker className="w-full" format="HH:mm" />
          </Form.Item>

          <Form.Item
            label="End Time"
            name="endTime"
            rules={[{ required: true, message: "Select end time" }]}
          >
            <TimePicker className="w-full" format="HH:mm" />
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={3} placeholder="Optional notes" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">{editingSchedule ? "Update" : "Add"}</Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
