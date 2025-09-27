import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Popconfirm } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { toast } from "sonner";

interface Specialization {
  id: string;
  name: string;
}

const LOCAL_STORAGE_KEY = "specializations";

export default function Specializations() {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSpec, setEditingSpec] = useState<Specialization | null>(null);
  const [form] = Form.useForm();
  const [search, setSearch] = useState("");

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) setSpecializations(JSON.parse(stored));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(specializations));
  }, [specializations]);

  const handleOpenModal = (spec?: Specialization) => {
    if (spec) {
      setEditingSpec(spec);
      form.setFieldsValue({ name: spec.name });
    } else {
      setEditingSpec(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleSubmit = (values: any) => {
    const newSpec: Specialization = {
      id: editingSpec ? editingSpec.id : crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substr(2, 9),
      name: values.name,
    };

    if (editingSpec) {
      setSpecializations(prev => prev.map(s => s.id === editingSpec.id ? newSpec : s));
      toast.success("Specialization updated successfully!");
    } else {
      setSpecializations(prev => [...prev, newSpec]);
      toast.success("Specialization added successfully!");
    }

    setIsModalVisible(false);
    setEditingSpec(null);
    form.resetFields();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this specialization?")) {
      setSpecializations(prev => prev.filter(s => s.id !== id));
      toast.success("Specialization deleted successfully!");
    }
  };

  const filteredSpecs = specializations.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const columns = [
    { title: "Specialization Name", dataIndex: "name", key: "name" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Specialization) => (
        <div className="space-x-2">
          <Button size="small" onClick={() => handleOpenModal(record)}>Edit</Button>
          <Popconfirm
            title="Delete this specialization?"
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
        <h1 className="text-2xl font-bold">Specializations</h1>
        <div className="flex gap-2">
          <Input
            placeholder="Search specializations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Add Specialization</Button>
        </div>
      </div>

      <Table
        dataSource={filteredSpecs}
        columns={columns}
        rowKey="id"
      />

      <Modal
        title={editingSpec ? "Edit Specialization" : "Add Specialization"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Specialization Name"
            name="name"
            rules={[{ required: true, message: "Enter specialization name" }]}
          >
            <Input placeholder="e.g., Cardiology" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit">{editingSpec ? "Update" : "Add"}</Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
