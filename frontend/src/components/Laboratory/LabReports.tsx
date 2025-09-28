import React, { useState, useEffect, useRef } from "react";
import { Table, Input, Button, Card, Select, Modal, Space, Typography, Tag, Divider, Form } from "antd";
import type { ColumnsType } from "antd/es/table";
import { getApi, PutApi } from "@/ApiService";
import { toast } from "sonner";

const { Title, Text } = Typography;
const { Option } = Select;

interface Test {
  id: number;
  patientName: string;
  patientId: string;
  token: number;
  testType: string;
  date: string;
  status: "Available" | "Not Available" | "Completed";
  description?: string; // Positive / Negative / Notes
}

interface Report {
  patientName: string;
  patientId: string;
  token: number;
  testTypes: string[];
  dates: string[];
  statuses: string[];
  ids: number[];
  descriptions: string[];
}

export default function LabReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Available" | "Not Available" | "Completed">("all");
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [editingReport, setEditingReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [form] = Form.useForm();

  async function loadTests() {
    await getApi("/lab-reports")
      .then((data) => {
        if (!data?.error) {
          setReports(data);
        }
        else {
          toast.error(data.error);
          console.error("Error fetching lab tests:", data.error);
        }
      }).catch((error) => {
        toast.error("Error fetching lab tests");
        console.error("Error deleting lab tests:", error);
      });
  }

  useEffect(() => {
    loadTests()
  }, [])

  const handleDeleteReport = (patientId: string) => {
    Modal.confirm({
      title: "Are you sure you want to delete this report?",
      onOk: () => setReports((prev) => prev.filter((r) => r.patientId !== patientId)),
    });
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setIsModalOpen(true);
    // Set form values for editing
    form.setFieldsValue({
      request_id: report.id,
      report_data: report.report_data,
      reported_by: 8,
      // patientName: report.patientName,
      // token: report.token,
      // tests: report.testTypes.map((t, idx) => ({
      //   testType: t,
      //   date: report.dates[idx],
      //   status: report.statuses[idx],
      //   description: report.descriptions[idx],
      // })),
    });
  };

  const handleSaveReport = () => {
    form.validateFields().then((values) => {
      if (!values.reported_data.data) return;

      const updatedReport = {
        id: editingReport.id,
        report_data: values.report_data,
        reported_by: editingReport.reported_by,
        // patientName: values.patientName,
        // patientId: editingReport?.patientId || `pid_${Date.now()}`,
        // token: values.token,
        // testTypes: values.tests.map((t: any) => t.testType),
        // dates: values.tests.map((t: any) => t.date),
        // statuses: values.tests.map((t: any) => t.status),
        // ids: editingReport
        //   ? editingReport.ids
        //   : values.tests.map((_: any, idx: number) => idx + 1),
        // descriptions: values.tests.map((t: any) => t.description),
      };
      PutApi('/lab-reports', updatedReport).then((data) => {
        if (!data?.error) {
          toast.success("Report saved successfully");
          loadTests()
        }
        else {
          toast.error(data.error);
          console.error("Error saving report:", data.error);
        }
      }).catch((error) => {
        toast.error("Error saving report");
        console.error("Error saving report:", error);
      }
      )

      // setReports((prev) => {
      //   if (editingReport) {
      //     return prev.map((r) => (r.patientId === editingReport.patientId ? updatedReport : r));
      //   } else {
      //     return [...prev, updatedReport];
      //   }
      // });

      setIsModalOpen(false);
      setEditingReport(null);
      form.resetFields();
    });
  };

  const filteredReports = reports
    .filter((rep) => filter === "all" || rep.statuses.includes(filter))
  // .filter((rep) => rep.patientName.toLowerCase().includes(search.toLowerCase()));

  const handlePrint = () => {
    if (reportRef.current) {
      const printContents = reportRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  const columns: ColumnsType<Report> = [
    // { title: "Token", dataIndex: "token", key: "token" },
    { title: "Patient Name", dataIndex: ["lab_request", "patient", "username"], key: "patientName" },
    {
      title: "Test",
      dataIndex: ["lab_request", "test", "name"],
      key: "test",
      // render: (tests: string[]) => tests.join(", "),
    },
    {
      title: "Report Data",
      dataIndex: "report_data",
      key: "report_data",
      render: (tests) => {
        if (typeof (tests.data) === 'string') return tests.data;
        return Object.entries(tests.data).map(([key, value]: any, idx) => (
          <div key={idx}>
            <Text strong>{key}:</Text> {value}
          </div>
        ));
      },
    },
    {
      title: "Statuses",
      dataIndex: ["lab_request", "status"],
      key: "status",
      // render: (statuses: string[]) =>
      //   statuses.map((status, idx) => (
      //     <Tag
      //       key={idx}
      //       color={status === "Completed" ? "blue" : status === "Available" ? "green" : "red"}
      //     >
      //       {status}
      //     </Tag>
      //   )),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {/* <Button type="primary" onClick={() => setViewingReport(record)}>
      View
    </Button> */}
          <Button type="default" onClick={() => handleEditReport(record)}>
            Edit
          </Button>
          {/* <Button danger onClick={() => handleDeleteReport(record.patientId)}>
      Delete
    </Button> */}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Title level={2}>Laboratory</Title>
        <Text type="secondary">Lab Reports</Text>
      </div>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Space style={{ width: "100%", flexWrap: "wrap" }}>
          <Input
            placeholder="Search by patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200 }}
          />
          <Select value={filter} onChange={(value) => setFilter(value)} style={{ width: 180 }}>
            <Option value="all">All</Option>
            <Option value="Available">Available</Option>
            <Option value="Not Available">Not Available</Option>
            <Option value="Completed">Completed</Option>
          </Select>
          {/* <Button
            type="primary"
            onClick={() => {
              setEditingReport(null);
              form.resetFields();
              setIsModalOpen(true);
            }}
          >
            Add Report
          </Button> */}
        </Space>

        <Table
          columns={columns}
          dataSource={filteredReports}
          rowKey="patientId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
        />
      </Space>

      {/* Add / Edit Report Modal */}
      <Modal
        title={editingReport ? "Edit Lab Report" : "Add Lab Report"}
        open={isModalOpen && !viewingReport}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingReport(null);
          form.resetFields();
        }}
        onOk={handleSaveReport}
        width={800}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          {/* <Form.Item
            name="patientName"
            label="Patient Name"
            rules={[{ required: true, message: "Enter patient name" }]}
          >
            <Input />
          </Form.Item> */}
          <Form.Item
            name={["report_data", "data"]}
            label={["report_data", "data"]}
            rules={[{ required: true, message: "Enter data" }]}
          >
            <Input />
          </Form.Item>

          {/* <Form.List name="tests">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline" style={{ display: "flex", marginBottom: 8 }}>
                    <Form.Item
                      {...restField}
                      name={[name, "testType"]}
                      rules={[{ required: true, message: "Enter test type" }]}
                    >
                      <Input placeholder="Test Name" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "date"]}
                      rules={[{ required: true, message: "Select date" }]}
                    >
                      <Input type="date" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "status"]}
                      rules={[{ required: true, message: "Select status" }]}
                    >
                      <Select style={{ width: 140 }}>
                        <Option value="Available">Available</Option>
                        <Option value="Not Available">Not Available</Option>
                        <Option value="Completed">Completed</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "description"]}>
                      <Input placeholder="Description (Positive/Negative/Notes)" />
                    </Form.Item>
                    <Button danger onClick={() => remove(name)}>
                      Delete
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    Add Test
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List> */}
        </Form>
      </Modal>

      {/* View Report Modal */}
      <Modal
        title={viewingReport ? `Lab Report: ${viewingReport.patientName}` : "Report Details"}
        open={viewingReport !== null}
        onCancel={() => setViewingReport(null)}
        width={700}
        footer={[
          <Button key="close" onClick={() => setViewingReport(null)}>
            Close
          </Button>,
          <Button key="print" type="primary" onClick={handlePrint}>
            Print / Save as PDF
          </Button>,
        ]}
      >
        {viewingReport && (
          <div ref={reportRef} style={{ padding: "16px", fontFamily: "Arial, sans-serif" }}>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Title level={4}>ClinicWise Laboratory</Title>
              <Text type="secondary">Comprehensive Lab Testing Report</Text>
              <Divider />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Space size={50}>
                <div>
                  <Text strong>Patient Name:</Text> {viewingReport.patientName}
                </div>
                <div>
                  <Text strong>Token:</Text> {viewingReport.token}
                </div>
              </Space>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Title level={5}>Test Results</Title>
              <Table
                size="small"
                dataSource={viewingReport.testTypes.map((t, idx) => ({
                  key: viewingReport.ids[idx],
                  test: t,
                  date: viewingReport.dates[idx],
                  status: viewingReport.statuses[idx],
                  description: viewingReport.descriptions[idx] || "No description",
                }))}
                pagination={false}
                columns={[
                  { title: "Test", dataIndex: "test", key: "test" },
                  { title: "Date", dataIndex: "date", key: "date" },
                  {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    render: (status: string) =>
                      status === "Completed" ? (
                        <Tag color="blue">{status}</Tag>
                      ) : status === "Available" ? (
                        <Tag color="green">{status}</Tag>
                      ) : (
                        <Tag color="red">{status}</Tag>
                      ),
                  },
                  { title: "Description", dataIndex: "description", key: "description" },
                ]}
              />
            </div>

            <div style={{ marginTop: 24, textAlign: "right" }}>
              <Text strong>Doctor Signature:</Text>
              <div
                style={{ marginTop: 32, borderTop: "1px solid #000", width: 200, marginLeft: "auto" }}
              ></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
