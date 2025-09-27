import React, { useEffect, useState } from "react";
import { Table, Input, Select, Tag, Button, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

interface Test {
  id: number;
  patientName: string;
  testType: string;
  date: string;
  status: "Available" | "Not Available" | "Completed";
}

interface PatientTests {
  patientName: string;
  testTypes: string[];
  dates: string[];
  statuses: string[];
  ids: number[];
}

export default function TestResults() {
  const [results, setResults] = useState<Test[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Available" | "Not Available" | "Completed">("all");
  const navigate = useNavigate();

  useEffect(() => {
    const storedResults = localStorage.getItem("testResults");
    if (storedResults) setResults(JSON.parse(storedResults));
  }, []);

  // Group tests by patient
  const groupedResults: PatientTests[] = Object.values(
    results.reduce((acc: any, test) => {
      if (!acc[test.patientName]) {
        acc[test.patientName] = {
          patientName: test.patientName,
          testTypes: [test.testType],
          dates: [test.date],
          statuses: [test.status],
          ids: [test.id],
        };
      } else {
        acc[test.patientName].testTypes.push(test.testType);
        acc[test.patientName].dates.push(test.date);
        acc[test.patientName].statuses.push(test.status);
        acc[test.patientName].ids.push(test.id);
      }
      return acc;
    }, {})
  );

  const filteredResults = groupedResults
    .filter((pt) => filter === "all" || pt.statuses.includes(filter))
    .filter((pt) => pt.patientName.toLowerCase().includes(search.toLowerCase()));

  const columns: ColumnsType<PatientTests> = [
    { title: "Patient Name", dataIndex: "patientName", key: "patientName" },
    {
      title: "Test Types",
      dataIndex: "testTypes",
      key: "testTypes",
      render: (tests: string[]) => tests.join(", "),
    },
    {
      title: "Dates",
      dataIndex: "dates",
      key: "dates",
      render: (dates: string[]) => dates.join(", "),
    },
    {
      title: "Statuses",
      dataIndex: "statuses",
      key: "statuses",
      render: (statuses: string[]) =>
        statuses.map((status, idx) => (
          <Tag key={idx} color={status === "Completed" ? "blue" : status === "Available" ? "green" : "red"}>
            {status}
          </Tag>
        )),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            onClick={() =>
              navigate("/laboratory/reports", {
                state: {
                  patientName: record.patientName,
                  testIds: record.ids,
                },
              })
            }
          >
            View Report
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Laboratory</h1>
        <p className="text-muted-foreground">Lab Results</p>
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
        </Space>

        <Table
          columns={columns}
          dataSource={filteredResults}
          rowKey="patientName"
          pagination={{ pageSize: 5 }}
          scroll={{ x: "max-content" }}
        />
      </Space>
    </div>
  );
}
