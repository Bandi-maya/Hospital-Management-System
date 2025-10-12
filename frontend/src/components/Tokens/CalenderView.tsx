import { useState, useEffect } from "react";
import {
  Card,
  Space,
  Tag,
  Select,
  Divider,
  Row,
  Col,
  Empty,
  Tooltip,
  message,
  Button,
  Skeleton
} from "antd";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import {
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
  DashboardOutlined,
  ReloadOutlined,
  SyncOutlined,
  IdcardOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons";
import { getApi } from "@/ApiService";
import { toast } from "sonner";

const { Option } = Select;

interface Token {
  id: number;
  patient: any;
  doctor: any;
  token_number: number;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  date: string;
  time_slot: string;
  department?: string;
}

// Skeleton Loader Components
const CalendarSkeleton = () => (
  <Card className="shadow-sm h-full">
    <div className="flex items-center gap-2 mb-4">
      <Skeleton.Avatar active size="small" />
      <Skeleton.Input active size="small" style={{ width: 100 }} />
    </div>
    <div className="flex justify-center">
      <div className="w-full max-w-md h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Skeleton.Avatar active size="large" />
          <Skeleton.Input active size="small" style={{ width: 120, marginTop: 8 }} />
        </div>
      </div>
    </div>
  </Card>
);

const FiltersSkeleton = () => (
  <Card className="shadow-sm h-full">
    <div className="flex items-center gap-2 mb-4">
      <Skeleton.Avatar active size="small" />
      <Skeleton.Input active size="small" style={{ width: 150 }} />
    </div>
    <Space direction="vertical" size="middle" className="w-full">
      {/* Department Filter Skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Skeleton.Avatar active size="small" />
          <Skeleton.Input active size="small" style={{ width: 100 }} />
        </div>
        <Skeleton.Input active size="large" style={{ width: '100%' }} />
      </div>

      {/* Doctor Filter Skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Skeleton.Avatar active size="small" />
          <Skeleton.Input active size="small" style={{ width: 80 }} />
        </div>
        <Skeleton.Input active size="large" style={{ width: '100%' }} />
      </div>

      <Divider />

      {/* Tokens List Skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Skeleton.Avatar active size="small" />
          <Skeleton.Input active size="small" style={{ width: 200 }} />
        </div>
        <Space direction="vertical" size="middle" className="w-full">
          {[...Array(3)].map((_, index) => (
            <Card key={index} size="small">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2">
                    <Skeleton.Avatar active size="small" />
                    <div>
                      <Skeleton.Input active size="small" style={{ width: 120 }} />
                      <div className="mt-1">
                        <Skeleton.Input active size="small" style={{ width: 80 }} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Skeleton.Input active size="small" style={{ width: 160 }} />
                    <Skeleton.Input active size="small" style={{ width: 140 }} />
                  </div>
                </div>
                <Skeleton.Button active size="small" style={{ width: 80 }} />
              </div>
            </Card>
          ))}
        </Space>
      </div>
    </Space>
  </Card>
);

const StatsSkeleton = () => (
  <Row gutter={[16, 16]}>
    {[...Array(3)].map((_, index) => (
      <Col key={index} xs={24} sm={8}>
        <Card className="text-center shadow-sm">
          <Skeleton.Input active size="large" style={{ width: 60, height: 32, margin: '0 auto' }} />
          <div className="mt-2">
            <Skeleton.Input active size="small" style={{ width: 80, margin: '0 auto' }} />
          </div>
        </Card>
      </Col>
    ))}
  </Row>
);

const HeaderSkeleton = () => (
  <Card className="bg-white shadow-sm border-0">
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
      <div className="flex items-center space-x-3">
        <Skeleton.Avatar active size="large" />
        <div>
          <Skeleton.Input active size="large" style={{ width: 200 }} />
          <div className="mt-1">
            <Skeleton.Input active size="small" style={{ width: 250 }} />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
        <Skeleton.Button active size="small" style={{ width: 120 }} />
        <Skeleton.Button active size="small" style={{ width: 100 }} />
      </div>
    </div>
  </Card>
);

export default function TokenCalendarView() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState({
    tokens: false,
    doctors: false,
    departments: false,
    initial: true
  });

  function getDoctors() {
    setLoading(prev => ({ ...prev, doctors: true }));
    getApi('/users?user_type=DOCTOR')
      .then((data) => {
        if (!data.error) {
          setDoctors(data.data);
        } else {
          toast.error(data.error);
        }
      }).catch((err) => {
        toast.error("Error occurred while getting doctors");
        console.error("Error: ", err);
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, doctors: false }));
      });
  }

  function getDepartments() {
    setLoading(prev => ({ ...prev, departments: true }));
    getApi('/departments')
      .then((data) => {
        if (!data.error) {
          setDepartments(data.data);
        } else {
          toast.error(data.error);
        }
      }).catch((err) => {
        toast.error("Error occurred while getting departments");
        console.error("Error: ", err);
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, departments: false }));
      });
  }

  function loadData(doctorId: string, date: Date, departmentId: string) {
    setLoading(prev => ({ ...prev, tokens: true }));
    let params = [];
    if (doctorId) {
      params.push(`doctor_id=${doctorId}`);
    }
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      params.push(`date=${year}-${month}-${day}`);
    }
    if (departmentId) {
      params.push(`department_id=${departmentId}`);
    }

    if (params.length > 0) {
      getApi(`/tokens?${params.join('&')}`)
        .then((data) => {
          if (!data.error) {
            setTokens(data.data);
          } else {
            toast.error(data.error);
          }
        }).catch((err) => {
          toast.error("Error occurred while getting tokens");
          console.error("Error: ", err);
        })
        .finally(() => {
          setLoading(prev => ({ ...prev, tokens: false, initial: false }));
        });
    } else {
      setLoading(prev => ({ ...prev, tokens: false, initial: false }));
    }
  }

  useEffect(() => {
    getDoctors();
    getDepartments();
  }, []);

  // Auto refresh notifier
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        message.info("🔄 Auto-refresh: Token calendar data reloaded");
        loadData(selectedDoctor, selectedDate, selectedDepartment);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedDoctor, selectedDate, selectedDepartment]);

  useEffect(() => {
    loadData(selectedDoctor, selectedDate, selectedDepartment);
  }, [selectedDate, selectedDoctor, selectedDepartment]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "green";
      case "Confirmed": return "blue";
      case "Pending": return "orange";
      case "Cancelled": return "red";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircleOutlined />;
      case "Confirmed": return <ClockCircleOutlined />;
      case "Pending": return <ClockCircleOutlined />;
      case "Cancelled": return <CloseCircleOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  const resetFilters = () => {
    setSelectedDoctor("");
    setSelectedDepartment("");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isLoading = loading.initial || loading.doctors || loading.departments;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      {isLoading ? (
        <HeaderSkeleton />
      ) : (
        <Card className="bg-white shadow-sm border-0">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarOutlined className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Token Calendar</h1>
                <p className="text-gray-600 mt-1">View and manage token appointments by date</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
              <Tooltip title="Auto Refresh">
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <SyncOutlined className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Auto Refresh</span>
                  <div
                    className={`w-8 h-4 rounded-full transition-colors cursor-pointer ${autoRefresh ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transform transition-transform ${autoRefresh ? 'translate-x-4' : 'translate-x-1'
                        }`}
                    />
                  </div>
                </div>
              </Tooltip>

              <Tooltip title="Reset Filters">
                <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                  Reset Filters
                </Button>
              </Tooltip>
            </div>
          </div>
        </Card>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          {/* Calendar Card */}
          {isLoading ? (
            <CalendarSkeleton />
          ) : (
            <Card
              title={
                <Space>
                  <CalendarOutlined />
                  Select Date
                </Space>
              }
              className="shadow-sm h-full"
            >
              <div className="flex justify-center">
                <Calendar
                  onChange={(value) => {
                    if (value instanceof Date) {
                      setSelectedDate(value);
                    } else if (Array.isArray(value) && value[0] instanceof Date) {
                      setSelectedDate(value[0]);
                    }
                  }}
                  value={selectedDate}
                  className="border-0 w-full max-w-md"
                />
              </div>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={12}>
          {/* Filters and Tokens Card */}
          {isLoading ? (
            <FiltersSkeleton />
          ) : (
            <Card
              title={
                <Space>
                  <DashboardOutlined />
                  Appointment Filters
                </Space>
              }
              className="shadow-sm h-full"
            >
              <Space direction="vertical" size="middle" className="w-full">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    <TeamOutlined className="mr-2" />
                    Department
                  </label>
                  <Select
                    value={selectedDepartment}
                    onChange={setSelectedDepartment}
                    placeholder="Filter by department"
                    className="w-full"
                    allowClear
                    loading={loading.departments}
                  >
                    {departments.map((dept: any) => (
                      <Option key={dept.id} value={dept.id}>
                        {dept.name}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    <UserOutlined className="mr-2" />
                    Doctor
                  </label>
                  <Select
                    value={selectedDoctor}
                    onChange={setSelectedDoctor}
                    placeholder="Filter by doctor"
                    className="w-full"
                    allowClear
                    loading={loading.doctors}
                  >
                    {doctors.map((doctor: any) => (
                      <Option key={doctor.id} value={doctor.id}>
                        {doctor.username}
                      </Option>
                    ))}
                  </Select>
                </div>

                <Divider />

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    <IdcardOutlined className="mr-2" />
                    Tokens for {formatDate(selectedDate)}
                  </h3>

                  {loading.tokens ? (
                    <Space direction="vertical" size="middle" className="w-full">
                      {[...Array(3)].map((_, index) => (
                        <Card key={index} size="small">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center space-x-2">
                                <Skeleton.Avatar active size="small" />
                                <div>
                                  <Skeleton.Input active size="small" style={{ width: 120 }} />
                                  <div className="mt-1">
                                    <Skeleton.Input active size="small" style={{ width: 80 }} />
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Skeleton.Input active size="small" style={{ width: 160 }} />
                                <Skeleton.Input active size="small" style={{ width: 140 }} />
                              </div>
                            </div>
                            <Skeleton.Button active size="small" style={{ width: 80 }} />
                          </div>
                        </Card>
                      ))}
                    </Space>
                  ) : tokens.length === 0 ? (
                    <Empty
                      description="No tokens scheduled for this day"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  ) : (
                    <Space direction="vertical" size="middle" className="w-full">
                      {tokens.map((token) => (
                        <Card
                          key={token.id}
                          size="small"
                          className="hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <IdcardOutlined className="text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    Token #{token.token_number}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {token.time_slot || "Time not specified"}
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-1 text-sm">
                                <div className="flex items-center space-x-2">
                                  <UserOutlined className="text-gray-400" />
                                  <span className="text-gray-700">
                                    <strong>Patient:</strong> {token.patient?.name || token.patient?.username || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <UserOutlined className="text-gray-400" />
                                  <span className="text-gray-700">
                                    <strong>Doctor:</strong> {token.doctor?.name || token.doctor?.username || "Not Assigned"}
                                  </span>
                                </div>
                                {token.department && (
                                  <div className="flex items-center space-x-2">
                                    <TeamOutlined className="text-gray-400" />
                                    <span className="text-gray-700">
                                      <strong>Department:</strong> {token.department}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <Tag
                              color={getStatusColor(token.status)}
                              icon={getStatusIcon(token.status)}
                              className="ml-2"
                            >
                              {token.status}
                            </Tag>
                          </div>
                        </Card>
                      ))}
                    </Space>
                  )}
                </div>
              </Space>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}