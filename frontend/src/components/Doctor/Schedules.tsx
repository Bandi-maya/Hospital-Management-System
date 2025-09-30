import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, DatePicker, TimePicker, Popconfirm, Card } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, UserOutlined, ClockCircleOutlined, EyeOutlined, MoreOutlined } from "@ant-design/icons";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) setSchedules(JSON.parse(stored));
  }, []);

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

  const getSpecializationColor = (specialization: string) => {
    const colors: { [key: string]: string } = {
      "Cardiology": "text-red-600 bg-red-50 border-red-200",
      "Neurology": "text-blue-600 bg-blue-50 border-blue-200",
      "Pediatrics": "text-green-600 bg-green-50 border-green-200",
    };
    return colors[specialization] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  const columns = [
    {
      title: "Doctor",
      dataIndex: "doctorName",
      key: "doctorName",
      render: (text: string) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <UserOutlined className="text-blue-600 text-base" />
          </div>
          <div>
            <span className="font-medium text-gray-900 block">{text}</span>
          </div>
        </div>
      )
    },
    {
      title: "Specialization",
      dataIndex: "specialization",
      key: "specialization",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${
            text === "Cardiology" ? "bg-red-100" : 
            text === "Neurology" ? "bg-blue-100" : 
            "bg-green-100"
          }`}>
            <UserOutlined className={`text-xs ${
              text === "Cardiology" ? "text-red-600" : 
              text === "Neurology" ? "text-blue-600" : 
              "text-green-600"
            }`} />
          </div>
          <Badge variant="outline" className={`font-medium ${getSpecializationColor(text)}`}>
            {text}
          </Badge>
        </div>
      )
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text: string) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            <CalendarOutlined className="text-gray-600 text-base" />
          </div>
          <span className="font-medium text-gray-900">{text}</span>
        </div>
      )
    },
    {
      title: "Time",
      key: "time",
      render: (_: any, record: Schedule) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <ClockCircleOutlined className="text-orange-600 text-base" />
          </div>
          <div>
            <span className="font-medium text-gray-900 block">{record.startTime} - {record.endTime}</span>
            <span className="text-xs text-gray-500">Duration</span>
          </div>
        </div>
      )
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (text: string) => (
        <div className="flex items-start gap-2">
          <EyeOutlined className="text-gray-400 mt-1 text-sm" />
          <span className="text-gray-600 text-sm">{text || "No notes"}</span>
        </div>
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Schedule) => (
        <div className="flex gap-1">
          <Button 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleOpenModal(record)}
            className="flex items-center gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this schedule?"
            description="Are you sure you want to delete this schedule?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
            icon={<DeleteOutlined className="text-red-500" />}
          >
            <Button 
              size="small" 
              danger 
              icon={<DeleteOutlined />}
              className="flex items-center gap-1 hover:bg-red-50"
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      )
    }
  ];

  const stats = {
    total: schedules.length,
    today: schedules.filter(s => s.date === new Date().toISOString().split('T')[0]).length,
    cardiology: schedules.filter(s => s.specialization === "Cardiology").length,
    neurology: schedules.filter(s => s.specialization === "Neurology").length,
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <CalendarOutlined className="text-blue-600 text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Schedule Management</h1>
              <p className="text-gray-600 mt-1 text-base">Manage and track doctor schedules and appointments</p>
            </div>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => handleOpenModal()}
            className="h-12 px-6 text-base font-medium bg-blue-600 hover:bg-blue-700 shrink-0 flex items-center gap-2"
            size="large"
          >
            
            Add Schedule
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="bg-white border-0 shadow-sm rounded-xl mb-6">
        <CardContent className="p-5">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg" />
                <Input
                  placeholder="Search schedules by doctor name or date..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 w-full text-base border-gray-300 focus:border-blue-500 rounded-lg"
                  suffix={<SearchOutlined className="text-gray-400" />}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Table Card */}
      <Card className="bg-white border-0 shadow-sm rounded-xl">
        <CardHeader className="px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CalendarOutlined className="text-blue-600 text-lg" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">Doctor Schedules</CardTitle>
                <CardDescription className="text-gray-600 mt-1">
                  {filteredSchedules.length} schedule{filteredSchedules.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              {/* <Button 
                icon={<PlusOutlined />} 
                onClick={() => handleOpenModal()}
                className="h-10 px-4 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
              >
                <PlusOutlined />
                New Schedule
              </Button> */}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            dataSource={filteredSchedules}
            columns={columns}
            rowKey="id"
            className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-900 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:border-b [&_.ant-table-tbody>tr:hover>td]:bg-gray-50 [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:py-4"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} schedules`,
              className: "px-6 py-4"
            }}
            locale={{
              emptyText: (
                <div className="text-center py-16">
                  <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <CalendarOutlined className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-lg font-medium mb-2">No schedules found</p>
                  <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
                    {search ? "Try adjusting your search" : "Get started by adding your first schedule"}
                  </p>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 mx-auto"
                  >
                    Add First Schedule
                  </Button>
                </div>
              )
            }}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Schedule Modal */}
      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CalendarOutlined className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 m-0">
                {editingSchedule ? "Edit Schedule" : "Add New Schedule"}
              </h3>
              <p className="text-gray-500 text-sm m-0">
                {editingSchedule ? "Update schedule details" : "Create a new doctor schedule"}
              </p>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
        className="[&_.ant-modal-header]:pb-4 [&_.ant-modal-body]:pt-4 [&_.ant-modal-close]:text-gray-400"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Form.Item
              label={
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserOutlined className="text-blue-500" />
                  Doctor
                </Label>
              }
              name="doctorName"
              rules={[{ required: true, message: "Please select a doctor" }]}
            >
              <Select
                showSearch
                placeholder="Select doctor"
                optionFilterProp="children"
                onChange={(value) => {
                  const doctor = DOCTORS.find(d => d.name === value);
                  if (doctor) form.setFieldsValue({ specialization: doctor.specialization });
                }}
                className="w-full [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-10 [&_.ant-select-selector]:rounded-lg"
                dropdownStyle={{ minWidth: '300px' }}
                popupMatchSelectWidth={false}
                suffixIcon={<UserOutlined className="text-gray-400" />}
              >
                {DOCTORS.map(d => (
                  <Option key={d.name} value={d.name}>
                    <div className="flex items-center gap-3 py-2">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <UserOutlined className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{d.name}</div>
                        <div className="text-xs text-gray-500">{d.specialization}</div>
                      </div>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserOutlined className="text-green-500" />
                  Specialization
                </Label>
              }
              name="specialization"
              rules={[{ required: true, message: "Please select specialization" }]}
            >
              <Select 
                showSearch 
                placeholder="Select specialization" 
                optionFilterProp="children"
                className="w-full [&_.ant-select-selector]:h-12 [&_.ant-select-selection-item]:leading-10 [&_.ant-select-selector]:rounded-lg"
                dropdownStyle={{ minWidth: '300px' }}
                popupMatchSelectWidth={false}
                suffixIcon={<UserOutlined className="text-gray-400" />}
              >
                {[...new Set(DOCTORS.map(d => d.specialization))].map(s => (
                  <Option key={s} value={s}>
                    <div className="flex items-center gap-3 py-2">
                      <div className={`p-2 rounded-lg ${
                        s === "Cardiology" ? "bg-red-50" : 
                        s === "Neurology" ? "bg-blue-50" : 
                        "bg-green-50"
                      }`}>
                        <UserOutlined className={
                          s === "Cardiology" ? "text-red-600" : 
                          s === "Neurology" ? "text-blue-600" : 
                          "text-green-600"
                        } />
                      </div>
                      <span className="font-medium">{s}</span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <CalendarOutlined className="text-purple-500" />
                    Date
                  </Label>
                }
                name="date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker 
                  className="w-full [&_.ant-picker-input>input]:h-12 [&_.ant-picker]:rounded-lg" 
                  suffixIcon={<CalendarOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ClockCircleOutlined className="text-orange-500" />
                    Start Time
                  </Label>
                }
                name="startTime"
                rules={[{ required: true, message: "Please select start time" }]}
              >
                <TimePicker 
                  className="w-full [&_.ant-picker-input>input]:h-12 [&_.ant-picker]:rounded-lg" 
                  format="HH:mm" 
                  suffixIcon={<ClockCircleOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ClockCircleOutlined className="text-red-500" />
                    End Time
                  </Label>
                }
                name="endTime"
                rules={[{ required: true, message: "Please select end time" }]}
              >
                <TimePicker 
                  className="w-full [&_.ant-picker-input>input]:h-12 [&_.ant-picker]:rounded-lg" 
                  format="HH:mm" 
                  suffixIcon={<ClockCircleOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </div>

            <Form.Item 
              label={
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <EyeOutlined className="text-gray-500" />
                  Notes
                </Label>
              } 
              name="notes"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Optional notes about the schedule..." 
                className="[&_.ant-input]:h-24 [&_.ant-input]:rounded-lg"
              />
            </Form.Item>
          </div>

          <Form.Item className="mb-0">
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button 
                onClick={() => setIsModalVisible(false)} 
                className="h-11 px-6 text-base border-gray-300 hover:bg-gray-50 rounded-lg flex items-center gap-2"
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="h-11 px-8 text-base bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2"
              >
                <PlusOutlined />
                {editingSchedule ? "Update Schedule" : "Add Schedule"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}