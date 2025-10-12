// import React, { useState, useEffect } from "react";
// import {
//   Table,
//   Button,
//   Space,
//   Typography,
//   Tag,
//   Modal,
//   Form,
//   Input,
//   Select,
//   Tooltip,
// } from "antd";
// import {
//   EditOutlined,
//   DeleteOutlined,
//   PlusOutlined,
//   SafetyCertificateOutlined,
//   SearchOutlined,
// } from "@ant-design/icons";

// const { Title, Text } = Typography;
// const { Option } = Select;

// interface InsuranceInfo {
//   policyNumber: string;
//   provider: string;
//   coverageAmount: string;
//   expiryDate: string;
// }

// interface WardAllocation {
//   key: string;
//   patientName: string;
//   ward: string;
//   bedNumber: string;
//   admissionDate: string;
//   status: string;
//   insurance?: InsuranceInfo;
// }

// const STORAGE_KEY = "wardAllocations";

// // Define a type for our new modal state
// type ModalInfo = {
//   type: "add" | "edit" | "insurance" | null;
//   record: WardAllocation | null;
// };

// const WardAllocations: React.FC = () => {
//   const [data, setData] = useState<WardAllocation[]>([]);
//   // 1. Replaced single boolean state with a more descriptive state object
//   const [modalInfo, setModalInfo] = useState<ModalInfo>({
//     type: null,
//     record: null,
//   });
//   const [form] = Form.useForm();

//   const [searchText, setSearchText] = useState("");
//   const [filterWard, setFilterWard] = useState<string | null>(null);

//   // Load data from localStorage on mount
//   useEffect(() => {
//     const storedData = localStorage.getItem(STORAGE_KEY);
//     if (storedData) {
//       setData(JSON.parse(storedData));
//     }
//   }, []);

//   // Update data to localStorage on update
//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
//   }, [data]);

//   // 2. Created separate handlers for each modal type
//   const showAddModal = () => {
//     form.resetFields();
//     setModalInfo({ type: "add", record: null });
//   };

//   const showEditModal = (record: WardAllocation) => {
//     form.setFieldsValue(record);
//     setModalInfo({ type: "edit", record });
//   };

//   const showInsuranceModal = (record: WardAllocation) => {
//     form.setFieldsValue(record); // Set existing values, including insurance
//     setModalInfo({ type: "insurance", record });
//   };

//   const handleCancel = () => {
//     setModalInfo({ type: null, record: null });
//     form.resetFields();
//   };

//   const handleUpdate = () => {
//     form.validateFields().then((values) => {
//       if (modalInfo.record) {
//         // This handles both 'edit' and 'insurance' updates
//         const updatedData = data.map((item) =>
//           item.key === modalInfo.record!.key ? { ...item, ...values } : item
//         );
//         setData(updatedData);
//       } else {
//         // This handles 'add'
//         const newRecord = {
//           key: String(Date.now()),
//           ...values,
//         };
//         setData([...data, newRecord]);
//       }
//       handleCancel();
//     });
//   };

//   const handleDelete = (key: string) => {
//     setData(data.filter((item) => item.key !== key));
//   };

//   const columns = [
//     {
//       title: "Patient Name",
//       dataIndex: "patientName",
//       key: "patientName",
//     },
//     {
//       title: "Ward",
//       dataIndex: "ward",
//       key: "ward",
//     },
//     {
//       title: "Bed Number",
//       dataIndex: "bedNumber",
//       key: "bedNumber",
//     },
//     {
//       title: "Admission Date",
//       dataIndex: "admissionDate",
//       key: "admissionDate",
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       key: "status",
//       render: (status: string) => (
//         <Tag color={status === "Active" ? "green" : "volcano"}>{status}</Tag>
//       ),
//     },
//     {
//       title: "Insurance",
//       key: "insurance",
//       render: (_: any, record: WardAllocation) =>
//         record.insurance && record.insurance.provider ? (
//           <Tag color="blue">{record.insurance.provider}</Tag>
//         ) : (
//           <Tag color="default">None</Tag>
//         ),
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_: any, record: WardAllocation) => (
//         <Space>
//           <Tooltip title="Edit Ward Details">
//             <Button
//               type="link"
//               icon={<EditOutlined />}
//               onClick={() => showEditModal(record)} // Use specific handler
//             />
//           </Tooltip>
//           <Tooltip title="Delete">
//             <Button
//               type="link"
//               danger
//               icon={<DeleteOutlined />}
//               onClick={() => handleDelete(record.key)}
//             />
//           </Tooltip>
//           <Tooltip title="Edit Insurance">
//             <Button
//               type="link"
//               icon={<SafetyCertificateOutlined />}
//               onClick={() => showInsuranceModal(record)} // Use specific handler
//             />
//           </Tooltip>
//         </Space>
//       ),
//     },
//   ];

//   // Filtering & Search
//   const filteredData = data.filter((item) => {
//     const matchesSearch = item.patientName
//       .toLowerCase()
//       .includes(searchText.toLowerCase());
//     const matchesWard = filterWard ? item.ward === filterWard : true;
//     return matchesSearch && matchesWard;
//   });

//   // 4. Helper function for a dynamic modal title
//   const getModalTitle = () => {
//     switch (modalInfo.type) {
//       case "add":
//         return "Add Ward Allocation";
//       case "edit":
//         return "Edit Ward Allocation";
//       case "insurance":
//         return `Edit Insurance for ${modalInfo.record?.patientName}`;
//       default:
//         return "";
//     }
//   };

//   return (
//     <div className="p-6 space-y-6 bg-white rounded-lg shadow-md">
//       <div className="flex justify-between items-center mb-4">
//         <Title level={3}>Ward Management</Title>
//         <Button
//           type="primary"
//           icon={<PlusOutlined />}
//           onClick={showAddModal} // Use specific handler
//         >
//           Add Ward Allocation
//         </Button>
//       </div>

//       <Text type="secondary">Manage and track patient ward allocations</Text>

//       {/* Search & Filter Controls */}
//       <div className="flex gap-4 my-4">
//         <Input
//           placeholder="Search by patient name"
//           prefix={<SearchOutlined />}
//           value={searchText}
//           onChange={(e) => setSearchText(e.target.value)}
//           allowClear
//           style={{ width: 250 }}
//         />

//         <Select
//           placeholder="Filter by ward"
//           allowClear
//           style={{ width: 200 }}
//           value={filterWard || undefined}
//           onChange={(val) => setFilterWard(val || null)}
//         >
//           <Option value="General Ward">General Ward</Option>
//           <Option value="ICU">ICU</Option>
//           <Option value="Private Room">Private Room</Option>
//         </Select>
//       </div>

//       <Table
//         columns={columns}
//         dataSource={filteredData}
//         pagination={{ pageSize: 5 }}
//         bordered
//         rowKey="key"
//       />

//       {/* Modal with conditionally rendered content */}
//       <Modal
//         title={getModalTitle()}
//         open={!!modalInfo.type} // Modal is open if type is not null
//         onCancel={handleCancel}
//         onOk={handleUpdate}
//         okText="Update"
//         width={600}
//         destroyOnClose // Good practice to destroy form state when modal closes
//       >
//         <Form form={form} layout="vertical" name="ward_allocation_form">
//           {/* 3. Conditionally render Ward Details */}
//           {(modalInfo.type === "add" || modalInfo.type === "edit") && (
//             <>
//               <Form.Item
//                 name="patientName"
//                 label="Patient Name"
//                 rules={[
//                   { required: true, message: "Please enter patient name" },
//                 ]}
//               >
//                 <Input />
//               </Form.Item>

//               <Form.Item
//                 name="ward"
//                 label="Ward"
//                 rules={[{ required: true, message: "Please select a ward" }]}
//               >
//                 <Select>
//                   <Option value="General Ward">General Ward</Option>
//                   <Option value="ICU">ICU</Option>
//                   <Option value="Private Room">Private Room</Option>
//                 </Select>
//               </Form.Item>

//               <Form.Item
//                 name="bedNumber"
//                 label="Bed Number"
//                 rules={[{ required: true, message: "Please enter bed number" }]}
//               >
//                 <Input />
//               </Form.Item>

//               <Form.Item
//                 name="admissionDate"
//                 label="Admission Date"
//                 rules={[
//                   { required: true, message: "Please enter admission date" },
//                 ]}
//               >
//                 <Input type="date" />
//               </Form.Item>

//               <Form.Item name="status" label="Status" initialValue="Active">
//                 <Select>
//                   <Option value="Active">Active</Option>
//                   <Option value="Discharged">Discharged</Option>
//                 </Select>
//               </Form.Item>
//             </>
//           )}

//           {/* 3. Conditionally render Insurance Details */}
//           {modalInfo.type === "insurance" && (
//             <>
//               <Form.Item name={["insurance", "policyNumber"]} label="Policy No.">
//                 <Input />
//               </Form.Item>
//               <Form.Item name={["insurance", "provider"]} label="Provider">
//                 <Input />
//               </Form.Item>
//               <Form.Item
//                 name={["insurance", "coverageAmount"]}
//                 label="Coverage Amount"
//               >
//                 <Input prefix="₹" type="number" />
//               </Form.Item>
//               <Form.Item name={["insurance", "expiryDate"]} label="Expiry Date">
//                 <Input type="date" />
//               </Form.Item>
//             </>
//           )}
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default WardAllocations;
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Tooltip,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { getApi, PostApi, PutApi, DeleteApi } from "@/ApiService";  // you need DeleteApi or something similar
import { Ward } from "./WardStatus";

const { Title, Text } = Typography;
const { Option } = Select;

interface WardAllocation {
  id: number;
  patient_name: string;
  ward_id: number;
  ward: Ward;
  bed_no: number;
  admission_date: string;
  status: "AVAILABLE" | "UNAVAILABLE";
  insurance?: {
    policyNumber: string;
    provider: string;
    coverageAmount: string;
    expiryDate: string;
  };
}

type ModalInfo = {
  type: "add" | "edit" | "insurance" | null;
  record: WardAllocation | null;
};

export default function WardAllocations() {
  const [data, setData] = useState<WardAllocation[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [modalInfo, setModalInfo] = useState<ModalInfo>({
    type: null,
    record: null,
  });
  const [form] = Form.useForm();


  const [searchText, setSearchText] = useState("");
  const [filterWard, setFilterWard] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([])
  const [selectedBeds, setSelectedBeds] = useState([]);

  const handleWardChange = (wardId) => {
    const selectedWard = wards.find((w) => w.id === wardId);
    setSelectedBeds((selectedWard?.beds || []).filter((bed) => bed.status === 'AVAILABLE'));
  };

  useEffect(() => {
    loadInitialData();
    loadPatients();
    loadAllocations();
  }, []);

  const loadInitialData = async () => {
    try {
      const wardRes = await getApi("/wards");
      if (!wardRes.error) {
        setWards(wardRes);
      }
      // Optionally load patients, doctors if needed
    } catch (e) {
      console.error("Error loading wards:", e);
      message.error("Could not load wards");
    }
  };

  const loadPatients = async () => {
    try {
      const wardRes = await getApi("/users?user_type=PATIENT");
      if (!wardRes.error) {
        setPatients(wardRes);
      }
      // Optionally load patients, doctors if needed
    } catch (e) {
      console.error("Error loading wards:", e);
      message.error("Could not load wards");
    }
  };

  const loadAllocations = async () => {
    setLoading(true);
    try {
      const res = await getApi("/ward-beds");  // or your allocation endpoint
      if (!res.error) {
        setData(res.filter((ward) => ward.status !== "AVAILABLE"));
      } else {
        message.error(res.error);
      }
    } catch (e) {
      console.error("Error loading allocations:", e);
      message.error("Could not load allocations");
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    form.resetFields();
    setModalInfo({ type: "add", record: null });
  };

  const showEditModal = (record: WardAllocation) => {
    form.setFieldsValue(record);
    setModalInfo({ type: "edit", record });
  };

  const showInsuranceModal = (record: WardAllocation) => {
    // set nested insurance fields
    form.setFieldsValue({
      insurance: record.insurance || {},
    });
    setModalInfo({ type: "insurance", record });
  };

  const handleCancel = () => {
    setModalInfo({ type: null, record: null });
    form.resetFields();
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      // if (modalInfo.type === "add") {
      //   console.log(values)
      //   // create
      //   const payload = {
      //     ward_id: values.ward_id,
      //     bed_id: values.bed_id,
      //     patient_name: values.patient_name,
      //     admission_date: values.admission_date,
      //     price: values.price,
      //     status: values.status,
      //     insurance: values.insurance,
      //   };
      //   const res = await PostApi("/ward-beds", payload);
      //   if (!res.error) {
      //     message.success("Allocation created");
      //     loadAllocations();
      //     handleCancel();
      //   } else {
      //     message.error(res.error);
      //   }
      // } else if (modalInfo.type === "edit") {
      const payload = {
        id: values.bed_id,
        ward_id: values.ward_id,
        patient_id: values.patient_id,
        admission_date: values.admission_date,
        price: values.price,
        status: values.status,
      };
      const res = await PutApi("/ward-beds", payload);
      if (!res.error) {
        message.success("Allocation updated");
        loadAllocations();
        handleCancel();
      } else {
        message.error(res.error);
      }
      // } 
      // else if (modalInfo.type === "insurance") {
      //   const rec = modalInfo.record!;
      //   const payload: any = {
      //     id: rec.id,
      //   };
      //   if (values.insurance) {
      //     payload.insurance = values.insurance;
      //   }
      //   const res = await PutApi("/wardbeds", payload);
      //   if (!res.error) {
      //     message.success("Insurance updated");
      //     loadAllocations();
      //     handleCancel();
      //   } else {
      //     message.error(res.error);
      //   }
      // }
    } catch (errorInfo) {
      console.log("Validation Failed:", errorInfo);
    }
  };

  const handleDelete = async (record: WardAllocation) => {
    try {
      const res = await DeleteApi(`/ward-beds?id=${record.id}`);
      if (!res.error) {
        message.success("Deleted allocation");
        loadAllocations();
      } else {
        message.error(res.error);
      }
    } catch (e) {
      console.error("Delete error:", e);
      message.error("Failed to delete");
    }
  };

  const columns = [
    {
      title: "Patient Name",
      dataIndex: ["patient", "name"],
      key: "patient_name",
    },
    {
      title: "Ward",
      dataIndex: ["ward", "name"],
      key: "ward_name",
    },
    {
      title: "Bed Number",
      dataIndex: "bed_no",
      key: "bed_no",
    },
    {
      title: "Admission Date",
      dataIndex: "admission_date",
      key: "admission_date",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "volcano"}>{status}</Tag>
      ),
    },
    {
      title: "Insurance",
      key: "insurance",
      render: (_: any, rec: WardAllocation) =>
        rec.insurance?.provider ? (
          <Tag color="blue">{rec.insurance.provider}</Tag>
        ) : (
          <Tag color="default">None</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, rec: WardAllocation) => (
        <Space>
          <Tooltip title="Edit Ward Details">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showEditModal(rec)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(rec)}
            />
          </Tooltip>
          {/* <Tooltip title="Edit Insurance">
            <Button
              type="link"
              icon={<SafetyCertificateOutlined />}
              onClick={() => showInsuranceModal(rec)}
            />
          </Tooltip> */}
        </Space>
      ),
    },
  ];

  const filtered = data.filter((item) => {
    // const matchesSearch = item.patient_name
    //   .toLowerCase()
    //   .includes(searchText.toLowerCase());
    // const matchesWard = filterWard ? item.ward_id === filterWard : true;
    // return matchesSearch && matchesWard;
    return item
  });

  const getModalTitle = () => {
    switch (modalInfo.type) {
      case "add":
        return "Add Allocation";
      case "edit":
        return "Edit Allocation";
      case "insurance":
        return `Edit Insurance for ${modalInfo.record?.patient_name}`;
      default:
        return "";
    }
  };

  return (
    <div style={{ padding: 24, background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Title level={3}>Ward Allocations</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Allocate Bed
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search patient"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200, marginRight: 16 }}
        />
        <Select
          placeholder="Filter by Ward"
          style={{ width: 200 }}
          value={filterWard ?? undefined}
          allowClear
          onChange={(val) => setFilterWard(val ?? null)}
        >
          {wards.map((w) => (
            <Option key={w.id} value={w.id}>
              {w.name}
            </Option>
          ))}
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={getModalTitle()}
        open={!!modalInfo.type}
        onCancel={handleCancel}
        onOk={handleUpdate}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" name="ward_alloc_form">
          {(modalInfo.type === "add" || modalInfo.type === "edit") && (
            <>
              <Form.Item
                name="patient_id"
                label="Patient"
                rules={[{ required: true }]}
              >
                <Select>
                  {patients.filter(patient => !data.find(record => record?.['patient_id'] === patient.id)).map((w) => (
                    <Option key={w.id} value={w.id}>
                      {w.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="ward_id"
                label="Ward"
                rules={[{ required: true }]}
              >
                <Select onChange={handleWardChange} >
                  {wards.map((w) => (
                    <Option key={w.id} value={w.id}>
                      {w.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="bed_id"
                label="Bed Number"
                rules={[{ required: true }]}
              >
                <Select placeholder="Select a bed">
                  {selectedBeds.map((bed) => (
                    <Option key={bed.id} value={bed.id}>
                      {bed.bed_no}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>
              <Form.Item
                name="admission_date"
                label="Admission Date"
                rules={[{ required: true }]}
              >
                <Input type="date" />
              </Form.Item>
              <Form.Item name="status" label="Status" initialValue="ACTIVE">
                <Select>
                  <Option value="ACTIVE">Active</Option>
                  <Option value="DISCHARGED">Discharged</Option>
                </Select>
              </Form.Item>
            </>
          )}

          {modalInfo.type === "insurance" && (
            <>
              <Form.Item
                name={["insurance", "policyNumber"]}
                label="Policy Number"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={["insurance", "provider"]}
                label="Provider"
              >
                <Input />
              </Form.Item>
              <Form.Item
                name={["insurance", "coverageAmount"]}
                label="Coverage Amount"
              >
                <Input type="number" prefix="₹" />
              </Form.Item>
              <Form.Item
                name={["insurance", "expiryDate"]}
                label="Expiry Date"
              >
                <Input type="date" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}
