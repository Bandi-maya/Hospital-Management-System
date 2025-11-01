import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Select,
  Popconfirm,
  Tabs,
  Tag,
  Card,
  List,
  Typography,
  Divider,
  DatePicker,
  Skeleton,
  Tooltip,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { Patient } from "@/types/patient";
import { getApi, PutApi, PostApi, DeleteApi } from "@/ApiService";
import { toast } from "sonner";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import FullscreenLoader from "@/components/Loader/FullscreenLoader";

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

// Predefined disease list
const diseaseSuggestions = [
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Tuberculosis",
  "Covid-19",
  "Cancer",
  "Heart Disease",
  "Arthritis",
];

// Status options
const statusOptions = [
  { value: "pending", label: "Pending", color: "orange" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "in-progress", label: "In Progress", color: "blue" },
  { value: "cancelled", label: "Cancelled", color: "red" },
];

// Payment methods
const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "insurance", label: "Insurance" },
];

export default function MedicalRecords() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicalRecordData, setMedicalRecordData] = useState<any>({});
  const [activeTab, setActiveTab] = useState("1");
  const [medicines, setMedicines] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [surgeries, setSurgeries] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showFullscreenLoader, setShowFullscreenLoader] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null);

  const [loadingStates, setLoadingStates] = useState({
    patients: false,
    medicalRecords: false,
    prescriptions: false,
    medicines: false,
    labTests: false,
    surgeries: false,
    consultations: false,
    payments: false,
    bills: false,
  });

  // State for different modals
  const [medicineModalVisible, setMedicineModalVisible] = useState(false);
  const [labTestModalVisible, setLabTestModalVisible] = useState(false);
  const [operationModalVisible, setOperationModalVisible] = useState(false);
  const [consultationModalVisible, setConsultationModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [invoiceModalVisible, setInvoiceModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const handleTableChange = (newPagination: any) => {
    loadData(newPagination.current, newPagination.pageSize);
  };


  // Form states
  const [medicineForm] = Form.useForm();
  const [labTestForm] = Form.useForm();
  const [operationForm] = Form.useForm();
  const [consultationForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [invoiceForm] = Form.useForm();

  // Show loading spinner with progress
  const showLoader = () => {
    setShowFullscreenLoader(true);
  };

  useEffect(() => {
    showLoader();
    loadData();
    loadPatients();
  }, [activeTab]);

  // API configuration for different tabs
  const apiConfig = {
    '1': { endpoint: "/medical-records", stateKey: "medicalRecords", setter: setMedicalRecords },
    '2': { endpoint: "/orders?order_type=prescription", stateKey: "prescriptions", setter: setPrescriptions },
    '3': { endpoint: "/orders?order_type=medicine", stateKey: "medicines", setter: setMedicines },
    '4': { endpoint: "/orders?order_type=lab_test", stateKey: "labTests", setter: setLabTests },
    '5': { endpoint: "/orders?order_type=surgery", stateKey: "surgeries", setter: setSurgeries },
    '6': { endpoint: "/appointment", stateKey: "consultations", setter: setConsultations },
    '7': { endpoint: "/payment", stateKey: "payments", setter: setPayments },
    '8': { endpoint: "/billing", stateKey: "bills", setter: setBills }
  };

  function loadData(page = 1, limit = 10, searchQuery = search) {
    const config = apiConfig[activeTab];
    if (!config) return;

    setLoadingStates(prev => ({ ...prev, [config.stateKey]: true }));

    getApi(config.endpoint + (config.endpoint.includes('?') ? '&' : '?') + `page=${page}&limit=${limit}&q=${searchQuery}`)
      .then((data) => {
        if (!data.error) {
          config.setter(data.data);
        } else {
          toast.error(data.error);
        }
      })
      .catch((err) => {
        toast.error("Error occurred while getting data");
        console.error("Error: ", err);
      })
      .finally(() => {
        setShowFullscreenLoader(false);
        setLoadingStates(prev => ({ ...prev, [config.stateKey]: false }));
      });
  }

  function loadPatients() {
    setLoadingStates(prev => ({ ...prev, patients: true }));
    getApi("/medical-records")
      .then((data) => {
        if (!data?.error) {
          setPatients(data.data);
          setFilteredPatients(data.data);
        } else {
          console.error("Error fetching patients:", data.error);
        }
      })
      .catch((error) => {
        console.error("Error fetching patients:", error);
      })
      .finally(() => {
        setLoadingStates(prev => ({ ...prev, patients: false }));
      });
  }

  // useEffect(() => {
  //   if (!search) {
  //     setFilteredPatients(patients);
  //   } else {
  //     const lower = search.toLowerCase();
  //     const filtered = patients.filter(patient =>
  //       patient?.user?.name?.toLowerCase().includes(lower) ||
  //       patient?.id?.toString().includes(search) ||
  //       patient?.notes?.toLowerCase().includes(lower)
  //     );
  //     setFilteredPatients(filtered);
  //   }
  // }, [search, patients]);

  const handleAddRecord = () => {
    if (!selectedPatient) return;

    showLoader();
    setLoadingActionId(selectedPatient.id);
    PutApi('/medical-records', {
      user_id: selectedPatient.user_id,
      id: selectedPatient.id,
      notes: medicalRecordData?.notes,
    }).then((data) => {
      if (!data?.error) {
        loadPatients();
        setSelectedPatient(null);
        setMedicalRecordData({});
        setIsModalVisible(false);
        toast.success("Medical record updated successfully");
      } else {
        toast.error("Error updating record: " + data.error);
      }
    }).catch((error) => {
      toast.error("Error updating record");
    }).finally(() => {
      setShowFullscreenLoader(false);
      setLoadingActionId(null);
    });
  };

  const handleDeleteItem = async (type, id, endpoint) => {
    showLoader();
    setLoadingActionId(id);
    try {
      const data = await DeleteApi(`${endpoint}/${id}`);
      if (!data?.error) {
        toast.success(`${type} deleted successfully`);
        loadData();
      } else {
        toast.error(`Error deleting ${type}: ${data.error}`);
      }
    } catch (error) {
      toast.error(`Error deleting ${type}`);
    } finally {
      setShowFullscreenLoader(false);
      setLoadingActionId(null);
    }
  };

  // Common handler for adding new items
  const handleAddItem = (type, form, apiEndpoint) => {
    form.validateFields().then(values => {
      showLoader();
      PostApi(apiEndpoint, {
        ...values,
        patient_id: selectedPatient?.id,
        date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
      }).then((data) => {
        if (!data?.error) {
          toast.success(`${type} added successfully`);
          form.resetFields();
          switch (type) {
            case 'Medicine': setMedicineModalVisible(false); break;
            case 'Lab Test': setLabTestModalVisible(false); break;
            case 'Operation': setOperationModalVisible(false); break;
            case 'Consultation': setConsultationModalVisible(false); break;
            case 'Payment': setPaymentModalVisible(false); break;
            case 'Invoice': setInvoiceModalVisible(false); break;
          }
          loadData();
        } else {
          toast.error(`Error adding ${type}: ${data.error}`);
        }
      }).catch((error) => {
        toast.error(`Error adding ${type}`);
      }).finally(() => {
        setShowFullscreenLoader(false);
      });
    });
  };

  const handleEditPatient = (record: any) => {
    setSelectedPatient(record);
    setIsModalVisible(true);
    setMedicalRecordData({ notes: record.notes, id: record.id });
  };

  const handleAddMedicalRecord = (record: any) => {
    setSelectedPatient(record);
    setIsModalVisible(true);
    setMedicalRecordData({ notes: "", id: record.id });
  };

  // Skeleton Components
  const TableSkeleton = ({ columns = 5, rows = 5 }) => (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 items-center">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton.Input
              key={colIndex}
              active
              style={{
                width: colIndex === columns - 1 ? 80 : Math.random() * 200 + 100,
                height: 32,
                flex: colIndex === columns - 2 ? 2 : 1
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );

  const CardSkeleton = ({ items = 3 }) => (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <Card key={index} size="small" className="border border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Skeleton.Input active style={{ width: 200, marginBottom: 12 }} />
              <Skeleton paragraph={{ rows: 2, width: ['100%', '80%'] }} active />
            </div>
            <Skeleton.Button active style={{ width: 80, height: 32 }} />
          </div>
        </Card>
      ))}
    </div>
  );

  const ListSkeleton = ({ items = 5 }) => (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton.Avatar active size="default" shape="square" />
          <div className="flex-1">
            <Skeleton.Input active style={{ width: 200, marginBottom: 8 }} />
            <Skeleton.Input active style={{ width: 300 }} />
          </div>
          <div className="flex gap-2">
            <Skeleton.Button active style={{ width: 32, height: 32 }} />
            <Skeleton.Button active style={{ width: 32, height: 32 }} />
          </div>
        </div>
      ))}
    </div>
  );

  const ActionButton = ({
    icon,
    label,
    type = "default",
    danger = false,
    onClick,
    loading = false,
    confirm = false,
    confirmAction
  }: {
    icon: React.ReactNode;
    label: string;
    type?: "primary" | "default" | "dashed" | "link" | "text";
    danger?: boolean;
    onClick?: () => void;
    loading?: boolean;
    confirm?: boolean;
    confirmAction?: () => void;
  }) => {
    const button = (
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 250 }}
      >
        <Tooltip title={label} placement="top">
          <Button
            type={type}
            danger={danger}
            icon={icon}
            loading={loading}
            onClick={onClick}
            className={`
              flex items-center justify-center 
              transition-all duration-300 ease-in-out
              ${!danger && !type.includes('primary') ?
                'text-gray-600 hover:text-blue-600 hover:bg-blue-50 border-gray-300 hover:border-blue-300' : ''
              }
              ${danger ?
                'hover:text-red-600 hover:bg-red-50 border-gray-300 hover:border-red-300' : ''
              }
              w-10 h-10 rounded-full
            `}
            style={{
              minWidth: '40px',
              border: '1px solid #d9d9d9'
            }}
          />
        </Tooltip>
      </motion.div>
    );

    return confirm ? (
      <Popconfirm
        title="Are you sure?"
        onConfirm={confirmAction}
        okText="Yes"
        cancelText="No"
        placement="top"
      >
        {button}
      </Popconfirm>
    ) : (
      button
    );
  };

  const RefreshButton = ({ onClick, loading = false }) => (
    <Button
      icon={<ReloadOutlined />}
      onClick={onClick}
      loading={loading}
      className="flex items-center gap-2"
    >
      Refresh
    </Button>
  );

  const AddButton = ({ label, onClick, loading = false }) => (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={onClick}
      loading={loading}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
    >
      {label}
    </Button>
  );

  // View Item Modal
  const ViewItemModal = ({ visible, onCancel, item, type }) => (
    <Modal
      title={`View ${type} Details`}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>
      ]}
      width={600}
    >
      {item && (
        <div className="space-y-4">
          <Descriptions column={1} bordered size="small">
            {Object.entries(item).map(([key, value]) => (
              <Descriptions.Item key={key} label={key.replace(/_/g, ' ').toUpperCase()}>
                {value?.toString() || '-'}
              </Descriptions.Item>
            ))}
          </Descriptions>
        </div>
      )}
    </Modal>
  );

  // Tab content components with consistent action buttons
  const MedicalRecordsTab = () => (
    <Card
      title="Medical Records"
      bodyStyle={{ padding: "1rem", overflowX: "auto" }}
      extra={
        <Space>
          <RefreshButton
            onClick={loadData}
            loading={loadingStates.medicalRecords}
          />
          {/* <AddButton
            label="Add Record"
            onClick={() => setMedicineModalVisible(true)}
          /> */}
        </Space>
      }
    >
      {/* Skeleton Loader */}
      {loadingStates.medicalRecords ? (
        <div className="space-y-3 p-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-gray-100 pb-2"
            >
              {[...Array(5)].map((__, j) => (
                <div key={j} className="flex-1 px-2">
                  <Skeleton.Input active size="small" style={{ width: "100%" }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table
            dataSource={medicalRecords}
            onChange={handleTableChange}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            columns={[
              {
                title: "Patient ID",
                dataIndex: ["user", "id"],
                key: "patientId",
                render: (id) => id || "N/A",
              },
              {
                title: "Patient Name",
                dataIndex: ["user", "name"],
                key: "patientName",
                render: (name) => name || "Unknown",
              },
              {
                title: "Date",
                dataIndex: "created_at",
                key: "date",
                render: (date) =>
                  date ? dayjs(date).format("MMM DD, YYYY") : "N/A",
              },
              {
                title: "Notes",
                dataIndex: "notes",
                key: "notes",
                ellipsis: true,
              },
              // {
              //   title: "Actions",
              //   key: "actions",
              //   width: 200,
              //   render: (_, record) => (
              //     <div className="flex flex-wrap gap-1 justify-center items-center">
              //       <ActionButton
              //         icon={<EyeOutlined />}
              //         label="View"
              //         onClick={() => {
              //           setSelectedItem(record);
              //           setViewModalVisible(true);
              //         }}
              //       />
              //       <ActionButton
              //         icon={<EditOutlined />}
              //         label="Edit"
              //         onClick={() => handleEditPatient(record)}
              //       />
              //       <ActionButton
              //         icon={<FileTextOutlined />}
              //         label="Add Notes"
              //         onClick={() => handleAddMedicalRecord(record)}
              //       />
              //     </div>
              //   ),
              // },
            ]}
          />
        </div>
      )}
    </Card>
  );

  const PrescriptionsTab = () => (
    <Card
      title="Prescriptions"
      extra={
        <Space>
          <RefreshButton onClick={loadData} loading={loadingStates.prescriptions} />
          {/* <AddButton
            label="Add Prescription"
            onClick={() => setMedicineModalVisible(true)}
          /> */}
        </Space>
      }
    >
      {loadingStates.prescriptions ? (
        <ListSkeleton items={4} />
      ) : (
        <List
          dataSource={prescriptions}
          renderItem={(item) => (
            <List.Item
              // actions={[
              //   <ActionButton
              //     icon={<EyeOutlined />}
              //     label="View Prescription"
              //     onClick={() => {
              //       setSelectedItem(item);
              //       setViewModalVisible(true);
              //     }}
              //   />,
              //   <ActionButton
              //     icon={<EditOutlined />}
              //     label="Edit Prescription"
              //     onClick={() => {/* Edit logic */ }}
              //   />,
              //   <ActionButton
              //     icon={<DeleteOutlined />}
              //     label="Delete Prescription"
              //     danger
              //     confirm
              //     confirmAction={() => handleDeleteItem('Prescription', item.id, '/prescriptions')}
              //     loading={loadingActionId === item.id}
              //   />
              // ]}
            >
              <List.Item.Meta
                title={item.user?.name || 'Unknown Patient'}
                description={
                  <Space direction="vertical" size={2}>
                    {/* Prescription Notes */}
                    {item.prescription?.notes && <Text>Notes: {item.prescription.notes}</Text>}

                    {/* Medicines */}
                    {item.medicines?.length > 0 && (
                      <div>
                        <Text strong>Medicines:</Text>
                        {item.medicines.map((med, idx) => (
                          <Text key={idx}>
                            {med.medicine?.name} - Qty: {med.quantity}
                          </Text>
                        ))}
                      </div>
                    )}

                    {/* Lab Tests */}
                    {item.lab_tests?.length > 0 && (
                      <div>
                        <Text strong>Lab Tests:</Text>
                        {item.lab_tests.map((test, idx) => (
                          <Text key={idx}>
                            {test.lab_test?.name} - Status: {test.status}
                          </Text>
                        ))}
                      </div>
                    )}

                    {/* Surgeries */}
                    {item.surgeries?.length > 0 && (
                      <div>
                        <Text strong>Surgeries:</Text>
                        {item.surgeries.map((surgery, idx) => (
                          <Text key={idx}>
                            {surgery.surgery_type?.name} - Status: {surgery.status}
                          </Text>
                        ))}
                      </div>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );
  
  const MedicinesTab = () => (
    <Card
    title="Medicines"
    extra={
      <Space>
          <RefreshButton onClick={loadData} loading={loadingStates.medicines} />
          {/* <AddButton
            label="Add Medicine"
            onClick={() => setMedicineModalVisible(true)}
            /> */}
        </Space>
      }
      >
      {loadingStates.medicines ? (
        <TableSkeleton columns={5} rows={6} />
      ) : (
        <List
          dataSource={medicines}
          renderItem={(item) => (
            <List.Item
              // actions={[
              //   <ActionButton
              //     icon={<EyeOutlined />}
              //     label="View Prescription"
              //     onClick={() => {
              //       setSelectedItem(item);
              //       setViewModalVisible(true);
              //     }}
              //   />,
              //   <ActionButton
              //     icon={<EditOutlined />}
              //     label="Edit Prescription"
              //     onClick={() => {/* Edit logic */ }}
              //   />,
              //   <ActionButton
              //     icon={<DeleteOutlined />}
              //     label="Delete Prescription"
              //     danger
              //     confirm
              //     confirmAction={() => handleDeleteItem('Prescription', item.id, '/prescriptions')}
              //     loading={loadingActionId === item.id}
              //   />
              // ]}
            >
              <List.Item.Meta
                title={item.user?.name || 'Unknown Patient'}
                description={
                  <Space direction="vertical" size={2}>
                    {/* Prescription Notes */}
                    {item.prescription?.notes && <Text>Notes: {item.prescription.notes}</Text>}
      
                    {/* Medicines */}
                    {item.medicines?.length > 0 && (
                      <div>
                        <Text strong>Medicines:</Text>
                        {item.medicines.map((med, idx) => (
                          <Text key={idx}>
                            {med.medicine?.name} - Qty: {med.quantity}
                          </Text>
                        ))}
                      </div>
                    )}
      
                    {/* Lab Tests */}
                    {item.lab_tests?.length > 0 && (
                      <div>
                        <Text strong>Lab Tests:</Text>
                        {item.lab_tests.map((test, idx) => (
                          <Text key={idx}>
                            {test.lab_test?.name} - Status: {test.status}
                          </Text>
                        ))}
                      </div>
                    )}
      
                    {/* Surgeries */}
                    {item.surgeries?.length > 0 && (
                      <div>
                        <Text strong>Surgeries:</Text>
                        {item.surgeries.map((surgery, idx) => (
                          <Text key={idx}>
                            {surgery.surgery_type?.name} - Status: {surgery.status}
                          </Text>
                        ))}
                      </div>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
        // <Table
        //   dataSource={medicines}
        //   onChange={handleTableChange}
        //   columns={[
          //     { title: "Medicine Name", dataIndex: "name", key: "name" },
          //     { title: "Dosage", dataIndex: "dosage", key: "dosage" },
          //     { title: "Frequency", dataIndex: "frequency", key: "frequency" },
          //     { title: "Duration", dataIndex: "duration", key: "duration" },
          //     {
        //       title: "Price",
        //       dataIndex: "price",
        //       key: "price",
        //       render: (price) => price ? `$${price}` : 'N/A'
        //     },
        //     {
          //       title: "Actions",
          //       key: "actions",
          //       width: 120,
          //       render: (_, record) => (
        //         <Space size="small">
        //           <ActionButton
        //             icon={<EyeOutlined />}
        //             label="View Medicine"
        //             onClick={() => {
          //               setSelectedItem(record);
          //               setViewModalVisible(true);
          //             }}
          //           />
          //           <ActionButton
          //             icon={<EditOutlined />}
          //             label="Edit Medicine"
          //             onClick={() => {/* Edit logic */ }}
          //           />
          //           <ActionButton
          //             icon={<DeleteOutlined />}
          //             label="Delete Medicine"
          //             danger
          //             confirm
          //             confirmAction={() => handleDeleteItem('Medicine', record.id, '/medicines')}
          //             loading={loadingActionId === record.id}
          //           />
          //         </Space>
          //       ),
          //     },
          //   ]}
          //   rowKey="id"
          //   pagination={{ pageSize: 10 }}
          // />
        )}
    </Card>
  );
  
  const LabTestsTab = () => (
    <Card
    title="Lab Tests"
    extra={
        <Space>
          <RefreshButton onClick={loadData} loading={loadingStates.labTests} />
          {/* <AddButton
            label="Add Lab Test"
            onClick={() => setLabTestModalVisible(true)}
            /> */}
        </Space>
      }
      >
      {loadingStates.labTests ? (
        <TableSkeleton columns={6} rows={6} />
      ) : (
        <List
          dataSource={labTests}
          renderItem={(item) => (
            <List.Item
              // actions={[
              //   <ActionButton
              //     icon={<EyeOutlined />}
              //     label="View Prescription"
              //     onClick={() => {
              //       setSelectedItem(item);
              //       setViewModalVisible(true);
              //     }}
              //   />,
              //   <ActionButton
              //     icon={<EditOutlined />}
              //     label="Edit Prescription"
              //     onClick={() => {/* Edit logic */ }}
              //   />,
              //   <ActionButton
              //     icon={<DeleteOutlined />}
              //     label="Delete Prescription"
              //     danger
              //     confirm
              //     confirmAction={() => handleDeleteItem('Prescription', item.id, '/prescriptions')}
              //     loading={loadingActionId === item.id}
              //   />
              // ]}
            >
              <List.Item.Meta
                title={item.user?.name || 'Unknown Patient'}
                description={
                  <Space direction="vertical" size={2}>
                    {/* Prescription Notes */}
                    {item.prescription?.notes && <Text>Notes: {item.prescription.notes}</Text>}
      
                    {/* Medicines */}
                    {item.medicines?.length > 0 && (
                      <div>
                        <Text strong>Medicines:</Text>
                        {item.medicines.map((med, idx) => (
                          <Text key={idx}>
                            {med.medicine?.name} - Qty: {med.quantity}
                          </Text>
                        ))}
                      </div>
                    )}
      
                    {/* Lab Tests */}
                    {item.lab_tests?.length > 0 && (
                      <div>
                        <Text strong>Lab Tests:</Text>
                        {item.lab_tests.map((test, idx) => (
                          <Text key={idx}>
                            {test.lab_test?.name} - Status: {test.status}
                          </Text>
                        ))}
                      </div>
                    )}
      
                    {/* Surgeries */}
                    {item.surgeries?.length > 0 && (
                      <div>
                        <Text strong>Surgeries:</Text>
                        {item.surgeries.map((surgery, idx) => (
                          <Text key={idx}>
                            {surgery.surgery_type?.name} - Status: {surgery.status}
                          </Text>
                        ))}
                      </div>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
        // <Table
        //   dataSource={labTests}
        //   onChange={handleTableChange}
        //   columns={[
          //     { title: "Test Name", dataIndex: "name", key: "name" },
          //     {
        //       title: "Date",
        //       dataIndex: "date",
        //       key: "date",
        //       render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : 'N/A'
        //     },
        //     { title: "Result", dataIndex: "result", key: "result" },
        //     {
        //       title: "Status",
        //       dataIndex: "status",
        //       key: "status",
        //       render: (status) => {
          //         const statusConfig = statusOptions.find(s => s.value === status) ||
          //           statusOptions.find(s => s.label === status);
          //         return (
            //           <Tag color={statusConfig?.color || 'blue'}>
            //             {statusConfig?.label || status || 'Pending'}
            //           </Tag>
            //         );
            //       },
            //     },
            //     {
              //       title: "Cost",
              //       dataIndex: "cost",
              //       key: "cost",
              //       render: (cost) => cost ? `$${cost}` : 'N/A'
              //     },
              //     {
                //       title: "Actions",
                //       key: "actions",
                //       width: 100,
        //       render: (_, record) => (
          //         <Space size="small">
          //           <ActionButton
          //             icon={<EyeOutlined />}
          //             label="View Lab Test"
          //             onClick={() => {
            //               setSelectedItem(record);
            //               setViewModalVisible(true);
            //             }}
            //           />
            //           <ActionButton
            //             icon={<EditOutlined />}
            //             label="Edit Lab Test"
            //             onClick={() => {/* Edit logic */ }}
            //           />
            //         </Space>
            //       ),
            //     },
            //   ]}
            //   rowKey="id"
            //   pagination={{ pageSize: 10 }}
            // />
          )}
    </Card>
  );
  
  const OperationsTab = () => (
    <Card
      title="Operations"
      extra={
        <Space>
          <RefreshButton onClick={loadData} loading={loadingStates.surgeries} />
          {/* <AddButton
            label="Add Operation"
            onClick={() => setOperationModalVisible(true)}
            /> */}
        </Space>
      }
      >
      {loadingStates.surgeries ? (
        <TableSkeleton columns={6} rows={6} />
      ) : (
        <List
          dataSource={surgeries}
          renderItem={(item) => (
            <List.Item
              // actions={[
              //   <ActionButton
              //     icon={<EyeOutlined />}
              //     label="View Prescription"
              //     onClick={() => {
              //       setSelectedItem(item);
              //       setViewModalVisible(true);
              //     }}
              //   />,
              //   <ActionButton
              //     icon={<EditOutlined />}
              //     label="Edit Prescription"
              //     onClick={() => {/* Edit logic */ }}
              //   />,
              //   <ActionButton
              //     icon={<DeleteOutlined />}
              //     label="Delete Prescription"
              //     danger
              //     confirm
              //     confirmAction={() => handleDeleteItem('Prescription', item.id, '/prescriptions')}
              //     loading={loadingActionId === item.id}
              //   />
              // ]}
            >
              <List.Item.Meta
                title={item.user?.name || 'Unknown Patient'}
                description={
                  <Space direction="vertical" size={2}>
                    {/* Prescription Notes */}
                    {item.prescription?.notes && <Text>Notes: {item.prescription.notes}</Text>}
      
                    {/* Medicines */}
                    {item.medicines?.length > 0 && (
                      <div>
                        <Text strong>Medicines:</Text>
                        {item.medicines.map((med, idx) => (
                          <Text key={idx}>
                            {med.medicine?.name} - Qty: {med.quantity}
                          </Text>
                        ))}
                      </div>
                    )}
      
                    {/* Lab Tests */}
                    {item.lab_tests?.length > 0 && (
                      <div>
                        <Text strong>Lab Tests:</Text>
                        {item.lab_tests.map((test, idx) => (
                          <Text key={idx}>
                            {test.lab_test?.name} - Status: {test.status}
                          </Text>
                        ))}
                      </div>
                    )}
      
                    {/* Surgeries */}
                    {item.surgeries?.length > 0 && (
                      <div>
                        <Text strong>Surgeries:</Text>
                        {item.surgeries.map((surgery, idx) => (
                          <Text key={idx}>
                            {surgery.surgery_type?.name} - Status: {surgery.status}
                          </Text>
                        ))}
                      </div>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
        // <Table
        //   dataSource={surgeries}
        //   onChange={handleTableChange}
        //   columns={[
        //     { title: "Operation Name", dataIndex: "name", key: "name" },
        //     {
        //       title: "Date",
        //       dataIndex: "date",
        //       key: "date",
        //       render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : 'N/A'
        //     },
        //     { title: "Surgeon", dataIndex: "surgeon", key: "surgeon" },
        //     { title: "Assistants", dataIndex: "assistants", key: "assistants" },
        //     {
        //       title: "Status",
        //       dataIndex: "status",
        //       key: "status",
        //       render: (status) => (
        //         <Tag color={status === "Successful" ? "green" : status === "Scheduled" ? "orange" : "red"}>
        //           {status}
        //         </Tag>
        //       ),
        //     },
        //     {
        //       title: "Actions",
        //       key: "actions",
        //       width: 100,
        //       render: (_, record) => (
        //         <Space size="small">
        //           <ActionButton
        //             icon={<EyeOutlined />}
        //             label="View Operation"
        //             onClick={() => {
        //               setSelectedItem(record);
        //               setViewModalVisible(true);
        //             }}
        //           />
        //           <ActionButton
        //             icon={<EditOutlined />}
        //             label="Edit Operation"
        //             onClick={() => {/* Edit logic */ }}
        //           />
        //         </Space>
        //       ),
        //     },
        //   ]}
        //   rowKey="id"
        //   pagination={{ pageSize: 10 }}
        // />
      )}
    </Card>
  );

  const ConsultationsTab = () => (
    <Card
      title="Consultations"
      extra={
        <Space>
          <RefreshButton onClick={loadData} loading={loadingStates.consultations} />
          {/* <AddButton
            label="Add Consultation"
            onClick={() => setConsultationModalVisible(true)}
          /> */}
        </Space>
      }
    >
      {loadingStates.consultations ? (
        <TableSkeleton columns={5} rows={6} />
      ) : (
        <Table
          dataSource={consultations}
          onChange={handleTableChange}
          columns={[
            { title: "Doctor", dataIndex: ["doctor", 'name'], key: "doctor" },
            {
              title: "Date",
              dataIndex: "appointment_date",
              key: "date",
              render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : 'N/A'
            },
            // {
            //   title: "Actions",
            //   key: "actions",
            //   width: 100,
            //   render: (_, record) => (
            //     <Space size="small">
            //       <ActionButton
            //         icon={<EyeOutlined />}
            //         label="View Consultation"
            //         onClick={() => {
            //           setSelectedItem(record);
            //           setViewModalVisible(true);
            //         }}
            //       />
            //       <ActionButton
            //         icon={<EditOutlined />}
            //         label="Edit Consultation"
            //         onClick={() => {/* Edit logic */ }}
            //       />
            //     </Space>
            //   ),
            // },
          ]}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}
    </Card>
  );

  const PaymentsTab = () => (
    <Card
      title="Payments"
      extra={
        <Space>
          <RefreshButton onClick={loadData} loading={loadingStates.payments} />
          {/* <AddButton
            label="Add Payment"
            onClick={() => setPaymentModalVisible(true)}
          /> */}
        </Space>
      }
    >
      {loadingStates.payments ? (
        <TableSkeleton columns={6} rows={6} />
      ) : (
        <Table
          dataSource={payments}
          onChange={handleTableChange}
          columns={[
            {
              title: "Date",
              dataIndex: "timestamp",
              key: "date",
              render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : 'N/A'
            },
            {
              title: "Amount",
              dataIndex: "amount",
              key: "amount",
              render: (amount) => amount ? `$${amount}` : '$0'
            },
            {
              title: "Method",
              dataIndex: "method",
              key: "method",
              render: (method) => {
                const methodConfig = paymentMethods.find(m => m.value === method);
                return methodConfig?.label || method || 'N/A';
              }
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (status) => (
                <Tag color={status === "Paid" ? "green" : status === "Pending" ? "orange" : "red"}>
                  {status}
                </Tag>
              ),
            },
            // { title: "Reference", dataIndex: "reference", key: "reference" },
            // {
            //   title: "Actions",
            //   key: "actions",
            //   width: 100,
            //   render: (_, record) => (
            //     <Space size="small">
            //       <ActionButton
            //         icon={<EyeOutlined />}
            //         label="View Payment"
            //         onClick={() => {
            //           setSelectedItem(record);
            //           setViewModalVisible(true);
            //         }}
            //       />
            //       <ActionButton
            //         icon={<EditOutlined />}
            //         label="Edit Payment"
            //         onClick={() => {/* Edit logic */ }}
            //       />
            //     </Space>
            //   ),
            // },
          ]}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}
    </Card>
  );

  const InvoiceTab = () => (
    <Card
      title="Invoices"
      extra={
        <Space>
          <RefreshButton onClick={loadData} loading={loadingStates.bills} />
          {/* <AddButton
            label="Create Invoice"
            onClick={() => setInvoiceModalVisible(true)}
          /> */}
        </Space>
      }
    >
      {loadingStates.bills ? (
        <TableSkeleton columns={6} rows={6} />
      ) : (
        <Table
          dataSource={bills}
          onChange={handleTableChange}
          columns={[
            {
              title: "Invoice #",
              dataIndex: "invoice_number",
              key: "invoice_number"
            },
            {
              title: "Date",
              dataIndex: "date",
              key: "date",
              render: (date) => date ? dayjs(date).format('MMM DD, YYYY') : 'N/A'
            },
            {
              title: "Amount",
              dataIndex: "amount",
              key: "amount",
              render: (amount) => amount ? `$${amount}` : '$0'
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (status) => (
                <Tag color={status === "Paid" ? "green" : status === "Pending" ? "orange" : "red"}>
                  {status}
                </Tag>
              ),
            },
            {
              title: "Items",
              dataIndex: "items",
              key: "items",
              render: (items) => Array.isArray(items) ? items.join(', ') : items
            },
            // {
            //   title: "Actions",
            //   key: "actions",
            //   width: 120,
            //   render: (_, record) => (
            //     <Space size="small">
            //       <ActionButton
            //         icon={<EyeOutlined />}
            //         label="View Invoice"
            //         onClick={() => {
            //           setSelectedItem(record);
            //           setViewModalVisible(true);
            //         }}
            //       />
            //       <ActionButton
            //         icon={<EditOutlined />}
            //         label="Edit Invoice"
            //         onClick={() => {/* Edit logic */ }}
            //       />
            //       <ActionButton
            //         icon={<DeleteOutlined />}
            //         label="Delete Invoice"
            //         danger
            //         confirm
            //         confirmAction={() => handleDeleteItem('Invoice', record.id, '/billing')}
            //         loading={loadingActionId === record.id}
            //       />
            //     </Space>
            //   ),
            // },
          ]}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      )}
    </Card>
  );

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      {/* Fullscreen Loading Spinner */}
      <FullscreenLoader
        active={showFullscreenLoader}
        onComplete={() => setShowFullscreenLoader(false)}
        speed={100}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title level={2} className="m-0 text-gray-800">Patient Management</Title>
          <Text type="secondary" className="text-lg">Medical Records & Billing</Text>
        </div>
        <Input.Search
          placeholder="Search patients, records..."
          allowClear
          value={search}
          onSearch={() => loadData(pagination.current, pagination.pageSize)}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
          size="large"
        />
      </div>

      <Tabs
        defaultActiveKey="1"
        onChange={(value) => {
          setPagination({
            current: 1,
            pageSize: 10,
            total: 0
          })
          setActiveTab(value)
        }}
        items={[
          {
            key: "1",
            label: "Medical Records",
            children: <MedicalRecordsTab />
          },
          {
            key: "2",
            label: "Prescriptions",
            children: <PrescriptionsTab />
          },
          {
            key: "3",
            label: "Medicines",
            children: <MedicinesTab />
          },
          {
            key: "4",
            label: "Lab Tests",
            children: <LabTestsTab />
          },
          {
            key: "5",
            label: "Operations",
            children: <OperationsTab />
          },
          {
            key: "6",
            label: "Consultations",
            children: <ConsultationsTab />
          },
          {
            key: "7",
            label: "Payments",
            children: <PaymentsTab />
          },
          // {
          //   key: "8",
          //   label: "Invoices",
          //   children: <InvoiceTab />
          // },
        ]}
      />

      {/* Medical Record Modal */}
      <Modal
        title={`Update Medical Record`}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedPatient(null);
          setMedicalRecordData({});
        }}
        onOk={handleAddRecord}
        okText="Update Record"
        cancelText="Cancel"
        width={600}
        confirmLoading={loadingActionId !== null}
      >
        <div className="space-y-4">
          {selectedPatient && (
            <div className="p-3 bg-gray-50 rounded">
              <Text strong>Patient: </Text>
              <Text>{selectedPatient.user?.name}</Text>
            </div>
          )}
          <Form layout="vertical">
            <Form.Item label="Medical Notes">
              <TextArea
                value={medicalRecordData?.notes}
                onChange={(e) => setMedicalRecordData({ ...medicalRecordData, notes: e.target.value })}
                rows={6}
                placeholder="Enter medical notes, observations, treatment plans..."
              />
            </Form.Item>
          </Form>
        </div>
      </Modal>

      {/* Medicine Modal */}
      <Modal
        title="Add Medicine"
        open={medicineModalVisible}
        onCancel={() => {
          setMedicineModalVisible(false);
          medicineForm.resetFields();
        }}
        onOk={() => handleAddItem('Medicine', medicineForm, '/medicines')}
        okText="Add Medicine"
        cancelText="Cancel"
        width={500}
      >
        <Form form={medicineForm} layout="vertical">
          <Form.Item name="name" label="Medicine Name" rules={[{ required: true, message: 'Please enter medicine name' }]}>
            <Input placeholder="Enter medicine name" />
          </Form.Item>
          <Form.Item name="dosage" label="Dosage" rules={[{ required: true, message: 'Please enter dosage' }]}>
            <Input placeholder="e.g., 500mg, 10ml" />
          </Form.Item>
          <Form.Item name="frequency" label="Frequency" rules={[{ required: true, message: 'Please enter frequency' }]}>
            <Input placeholder="e.g., 3 times daily, every 6 hours" />
          </Form.Item>
          <Form.Item name="duration" label="Duration" rules={[{ required: true, message: 'Please enter duration' }]}>
            <Input placeholder="e.g., 7 days, 2 weeks" />
          </Form.Item>
          <Form.Item name="instructions" label="Instructions">
            <TextArea rows={3} placeholder="Additional instructions for use" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Lab Test Modal */}
      <Modal
        title="Add Lab Test"
        open={labTestModalVisible}
        onCancel={() => {
          setLabTestModalVisible(false);
          labTestForm.resetFields();
        }}
        onOk={() => handleAddItem('Lab Test', labTestForm, '/lab-requests')}
        okText="Add Lab Test"
        cancelText="Cancel"
        width={500}
      >
        <Form form={labTestForm} layout="vertical">
          <Form.Item name="name" label="Test Name" rules={[{ required: true, message: 'Please enter test name' }]}>
            <Input placeholder="Enter lab test name" />
          </Form.Item>
          <Form.Item name="date" label="Test Date" rules={[{ required: true, message: 'Please select date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Test description or notes" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Operation Modal */}
      <Modal
        title="Add Operation"
        open={operationModalVisible}
        onCancel={() => {
          setOperationModalVisible(false);
          operationForm.resetFields();
        }}
        onOk={() => handleAddItem('Operation', operationForm, '/surgery')}
        okText="Add Operation"
        cancelText="Cancel"
        width={500}
      >
        <Form form={operationForm} layout="vertical">
          <Form.Item name="name" label="Operation Name" rules={[{ required: true, message: 'Please enter operation name' }]}>
            <Input placeholder="Enter operation name" />
          </Form.Item>
          <Form.Item name="surgeon" label="Surgeon" rules={[{ required: true, message: 'Please enter surgeon name' }]}>
            <Input placeholder="Enter surgeon name" />
          </Form.Item>
          <Form.Item name="date" label="Operation Date" rules={[{ required: true, message: 'Please select date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label="Operation Notes">
            <TextArea rows={3} placeholder="Operation details and notes" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Consultation Modal */}
      <Modal
        title="Add Consultation"
        open={consultationModalVisible}
        onCancel={() => {
          setConsultationModalVisible(false);
          consultationForm.resetFields();
        }}
        onOk={() => handleAddItem('Consultation', consultationForm, '/appointment')}
        okText="Add Consultation"
        cancelText="Cancel"
        width={500}
      >
        <Form form={consultationForm} layout="vertical">
          <Form.Item name="doctor" label="Doctor" rules={[{ required: true, message: 'Please enter doctor name' }]}>
            <Input placeholder="Enter doctor name" />
          </Form.Item>
          <Form.Item name="diagnosis" label="Diagnosis" rules={[{ required: true, message: 'Please enter diagnosis' }]}>
            <Input placeholder="Enter diagnosis" />
          </Form.Item>
          <Form.Item name="date" label="Consultation Date" rules={[{ required: true, message: 'Please select date' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <TextArea rows={3} placeholder="Consultation notes and recommendations" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Payment Modal */}
      <Modal
        title="Add Payment"
        open={paymentModalVisible}
        onCancel={() => {
          setPaymentModalVisible(false);
          paymentForm.resetFields();
        }}
        onOk={() => handleAddItem('Payment', paymentForm, '/payment')}
        okText="Add Payment"
        cancelText="Cancel"
        width={500}
      >
        <Form form={paymentForm} layout="vertical">
          <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Please enter amount' }]}>
            <Input type="number" placeholder="Enter amount" prefix="$" />
          </Form.Item>
          <Form.Item name="method" label="Payment Method" rules={[{ required: true, message: 'Please select payment method' }]}>
            <Select placeholder="Select payment method">
              {paymentMethods.map(method => (
                <Option key={method.value} value={method.value}>{method.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="reference" label="Reference Number">
            <Input placeholder="Payment reference number" />
          </Form.Item>
          <Form.Item name="notes" label="Payment Notes">
            <TextArea rows={2} placeholder="Additional payment notes" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Invoice Modal */}
      <Modal
        title="Create Invoice"
        open={invoiceModalVisible}
        onCancel={() => {
          setInvoiceModalVisible(false);
          invoiceForm.resetFields();
        }}
        onOk={() => handleAddItem('Invoice', invoiceForm, '/billing')}
        okText="Create Invoice"
        cancelText="Cancel"
        width={500}
      >
        <Form form={invoiceForm} layout="vertical">
          <Form.Item name="amount" label="Amount" rules={[{ required: true, message: 'Please enter amount' }]}>
            <Input type="number" placeholder="Enter amount" prefix="$" />
          </Form.Item>
          <Form.Item name="items" label="Items" rules={[{ required: true, message: 'Please add at least one item' }]}>
            <Select mode="tags" placeholder="Add invoice items">
              <Option value="Consultation">Consultation</Option>
              <Option value="Medicines">Medicines</Option>
              <Option value="Lab Tests">Lab Tests</Option>
              <Option value="Operation">Operation</Option>
              <Option value="Room Charges">Room Charges</Option>
              <Option value="Other Services">Other Services</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Invoice description and details" />
          </Form.Item>
        </Form>
      </Modal>

      {/* View Item Modal */}
      {/* <ViewItemModal
        visible={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        type={selectedItem?.name || 'Item'}
      /> */}
    </div>
  );
}