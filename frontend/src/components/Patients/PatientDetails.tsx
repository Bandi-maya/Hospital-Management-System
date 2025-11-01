import React, { useEffect, useState } from "react";
import { Card, Tabs, List, Space, Typography, Timeline, Spin, Tag, Divider, Col, Row, Descriptions, Statistic } from "antd";
import {
    ClockCircleOutlined,
    MedicineBoxOutlined,
    FileTextOutlined,
    ExperimentOutlined,
    ScheduleOutlined,
    UserOutlined,
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    HeartOutlined,
    DropboxOutlined,
    DollarOutlined,
    CreditCardOutlined,
    SyncOutlined
} from '@ant-design/icons';
import { useParams } from "react-router-dom";
import { getApi } from "@/ApiService";

const { Text, Title } = Typography;
const { TabPane } = Tabs;

const PatientDetails = () => {
    const { patientId } = useParams()
    const [patient, setPatient] = useState<any>(null);
    const [loading, setLoading] = useState<any>(true);

    useEffect(() => {
        // Fetch patient details
        getApi(`/patients/${patientId}`)
            .then(res => {
                setPatient(res);
            })
            .catch(error => {
                console.error("Error fetching patient details:", error);
            })
            .finally(() => setLoading(false));
    }, [patientId]);

    if (loading) return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;

    if (!patient) return <Text>Patient not found</Text>;

    // Helper function to get field value safely
    const getFieldValue = (fields: any, fieldName: string) => {
        return fields?.[fieldName] || "N/A";
    };

    // Get patient basic info
    const patientInfo = patient.user || {};
    const extraFields = patientInfo.extra_fields?.fields_data || {};
    const address = patientInfo.address || {};

    return (
        <div style={{ padding: '20px' }}>
            {/* Basic Info */}
            <Card
                title={
                    <Space>
                        <UserOutlined />
                        <span>Patient Information</span>
                    </Space>
                }
                style={{ marginBottom: 20, borderRadius: '12px' }}
                extra={
                    <Tag color="blue" icon={<HeartOutlined />}>
                        {getFieldValue(extraFields, 'blood_type') || 'Blood Type N/A'}
                    </Tag>
                }
            >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8}>
                            <Space direction="vertical">
                                <Text strong>Personal Information</Text>
                                <Text><UserOutlined /> Name: {getFieldValue(extraFields, 'first_name')} {getFieldValue(extraFields, 'last_name')}</Text>
                                <Text>Gender: {patientInfo?.gender || "N/A"}</Text>
                                <Text>Age: {patientInfo?.age || "N/A"}</Text>
                                <Text><DropboxOutlined /> Disease: {getFieldValue(extraFields, 'disease')}</Text>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Space direction="vertical">
                                <Text strong>Contact Information</Text>
                                <Text><PhoneOutlined /> Phone: {patientInfo?.phone_no || "N/A"}</Text>
                                <Text><MailOutlined /> Email: {patientInfo?.email || "N/A"}</Text>
                            </Space>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Space direction="vertical">
                                <Text strong>Address</Text>
                                <Text><EnvironmentOutlined /> {[address.street, address.city, address.state, address.country]
                                    .filter(Boolean).join(', ') || "N/A"}</Text>
                                <Text>ZIP: {address.zip_code || "N/A"}</Text>
                            </Space>
                        </Col>
                    </Row>
                </Space>
            </Card>

            {/* Tabs for Prescriptions, Medicines, Lab Tests, Surgeries */}
            <Tabs defaultActiveKey="1" type="card">
                {/* Prescriptions */}
                <TabPane tab={<span><FileTextOutlined /> Prescriptions</span>} key="1">
                    <List
                        dataSource={patient.prescriptions || []}
                        renderItem={(prescription: any) => (
                            <List.Item>
                                <Card
                                    style={{ width: '100%' }}
                                    title={`Prescription by Dr. ${prescription?.doctor?.name || 'Unknown'}`}
                                    extra={
                                        <Tag color="green">
                                            {new Date(prescription?.created_at).toLocaleDateString()}
                                        </Tag>
                                    }
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                                        {/* Medicines in this prescription */}
                                        {prescription.medicines && prescription.medicines.length > 0 && (
                                            <div>
                                                <Text strong>Medicines:</Text>
                                                <List
                                                    dataSource={prescription.medicines}
                                                    renderItem={(medicineItem: any) => (
                                                        <List.Item>
                                                            <Card size="small" style={{ width: '100%' }}>
                                                                <Space direction="vertical">
                                                                    <Text strong>{medicineItem.medicine?.name}</Text>
                                                                    <Text>Quantity: {medicineItem.quantity}</Text>
                                                                    <Text>Description: {medicineItem.medicine?.description || "N/A"}</Text>
                                                                    {medicineItem.medicine?.medicine_stock?.length > 0 && (
                                                                        <div>
                                                                            <Text strong>Stock Information:</Text>
                                                                            {medicineItem.medicine.medicine_stock.map((stock: any) => (
                                                                                <Tag key={stock.id} color="blue">
                                                                                    Batch: {stock.batch_no} | Qty: {stock.quantity} | ₹{stock.price}
                                                                                </Tag>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    <Tag color={medicineItem.medicine?.is_active ? "green" : "red"}>
                                                                        {medicineItem.medicine?.is_active ? "Active" : "Inactive"}
                                                                    </Tag>
                                                                </Space>
                                                            </Card>
                                                        </List.Item>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {/* Lab Tests in this prescription */}
                                        {prescription.lab_tests && prescription.lab_tests.length > 0 && (
                                            <div>
                                                <Text strong>Lab Tests:</Text>
                                                <List
                                                    dataSource={prescription.lab_tests}
                                                    renderItem={(test: any) => (
                                                        <List.Item>
                                                            <Card size="small" style={{ width: '100%' }}>
                                                                <Space direction="vertical">
                                                                    <Text strong>{test.lab_test?.name}</Text>
                                                                    <Tag color={
                                                                        test.status === 'completed' ? 'green' :
                                                                            test.status === 'in_progress' ? 'orange' : 'blue'
                                                                    }>
                                                                        Status: {test.status}
                                                                    </Tag>
                                                                    <Text>Notes: {test.notes || "N/A"}</Text>
                                                                    <Text>Result: {test.result || "Pending"}</Text>
                                                                    <Text>Price: ₹{test.lab_test?.price}</Text>
                                                                </Space>
                                                            </Card>
                                                        </List.Item>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {/* Surgeries in this prescription */}
                                        {prescription.surgeries && prescription.surgeries.length > 0 && (
                                            <div>
                                                <Text strong>Surgeries:</Text>
                                                <List
                                                    dataSource={prescription.surgeries}
                                                    renderItem={(surgery: any) => (
                                                        <List.Item>
                                                            <Card size="small" style={{ width: '100%' }}>
                                                                <Space direction="vertical">
                                                                    <Text strong>{surgery.surgery_type?.name}</Text>
                                                                    <Text>Department: {surgery.surgery_type?.department?.name}</Text>
                                                                    <Tag color={
                                                                        surgery.status === 'completed' ? 'green' :
                                                                            surgery.status === 'scheduled' ? 'blue' : 'orange'
                                                                    }>
                                                                        Status: {surgery.status}
                                                                    </Tag>
                                                                    <Text>Price: ₹{surgery.price}</Text>
                                                                    <Text>Notes: {surgery.notes || "N/A"}</Text>
                                                                </Space>
                                                            </Card>
                                                        </List.Item>
                                                    )}
                                                />
                                            </div>
                                        )}

                                        {!prescription.medicines?.length && !prescription.lab_tests?.length && !prescription.surgeries?.length && (
                                            <Text type="secondary">No items in this prescription</Text>
                                        )}
                                    </Space>
                                </Card>
                            </List.Item>
                        )}
                        locale={{ emptyText: "No prescriptions found" }}
                    />
                </TabPane>

                {/* Medicines */}
                <TabPane tab={<span><MedicineBoxOutlined /> Medicines</span>} key="2">
                    <List
                        dataSource={patient.medicines || []}
                        renderItem={(medicineItem: any) => (
                            <List.Item>
                                <List
                                    dataSource={medicineItem.medicines}
                                    renderItem={(medicineItem: any) => (
                                        <List.Item>
                                            <Card size="small" style={{ width: '100%' }}>
                                                <Space direction="vertical">
                                                    <Text strong>{medicineItem.medicine?.name}</Text>
                                                    <Text>Quantity: {medicineItem.quantity}</Text>
                                                    <Text>Description: {medicineItem.medicine?.description || "N/A"}</Text>
                                                    {medicineItem.medicine?.medicine_stock?.length > 0 && (
                                                        <div>
                                                            <Text strong>Stock Information:</Text>
                                                            {medicineItem.medicine.medicine_stock.map((stock: any) => (
                                                                <Tag key={stock.id} color="blue">
                                                                    Batch: {stock.batch_no} | Qty: {stock.quantity} | ₹{stock.price}
                                                                </Tag>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <Tag color={medicineItem.medicine?.is_active ? "green" : "red"}>
                                                        {medicineItem.medicine?.is_active ? "Active" : "Inactive"}
                                                    </Tag>
                                                </Space>
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </List.Item>
                        )}
                        locale={{ emptyText: "No medicines found" }}
                    />
                </TabPane>

                {/* Lab Tests */}
                <TabPane tab={<span><ExperimentOutlined /> Lab Tests</span>} key="3">
                    <List
                        dataSource={patient.lab_tests || []}
                        renderItem={(test: any) => (
                            <List.Item>
                                <List
                                    dataSource={test.lab_tests}
                                    renderItem={(test: any) => (
                                        <List.Item>
                                            <Card size="small" style={{ width: '100%' }}>
                                                <Space direction="vertical">
                                                    <Text strong>{test.lab_test?.name}</Text>
                                                    <Tag color={
                                                        test.status === 'completed' ? 'green' :
                                                            test.status === 'in_progress' ? 'orange' : 'blue'
                                                    }>
                                                        Status: {test.status}
                                                    </Tag>
                                                    <Text>Notes: {test.notes || "N/A"}</Text>
                                                    <Text>Result: {test.result || "Pending"}</Text>
                                                    <Text>Price: ₹{test.lab_test?.price}</Text>
                                                </Space>
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </List.Item>
                        )}
                        locale={{ emptyText: "No lab tests found" }}
                    />
                </TabPane>

                {/* Surgeries */}
                <TabPane tab={<span><ScheduleOutlined /> Surgeries</span>} key="4">
                    <List
                        dataSource={patient.surgeries || []}
                        renderItem={(surgery: any) => (
                            <List.Item>
                                <List
                                    dataSource={surgery.surgeries}
                                    renderItem={(surgery: any) => (
                                        <List.Item>
                                            <Card size="small" style={{ width: '100%' }}>
                                                <Space direction="vertical">
                                                    <Text strong>{surgery.surgery_type?.name}</Text>
                                                    <Text>Department: {surgery.surgery_type?.department?.name}</Text>
                                                    <Tag color={
                                                        surgery.status === 'completed' ? 'green' :
                                                            surgery.status === 'scheduled' ? 'blue' : 'orange'
                                                    }>
                                                        Status: {surgery.status}
                                                    </Tag>
                                                    <Text>Price: ₹{surgery.price}</Text>
                                                    <Text>Notes: {surgery.notes || "N/A"}</Text>
                                                </Space>
                                            </Card>
                                        </List.Item>
                                    )}
                                />
                            </List.Item>
                        )}
                        locale={{ emptyText: "No surgeries found" }}
                    />
                </TabPane>

                <TabPane tab={<span><MedicineBoxOutlined /> Tokens</span>} key="5">
                    <List
                        dataSource={patient.tokens || []}
                        renderItem={(token: any) => (
                            <List.Item>
                                {
                                    token?.appointment_date
                                }
                                {token?.doctor?.name}
                            </List.Item>
                        )}
                        locale={{ emptyText: "No Tokens found" }}
                    />
                </TabPane>

                <TabPane tab={<span><MedicineBoxOutlined /> Appointments</span>} key="6">
                    <List
                        dataSource={patient.appointments || []}
                        renderItem={(token: any) => (
                            <List.Item>
                                {token?.appointment_date}
                                {token?.doctor?.name}
                            </List.Item>
                        )}
                        locale={{ emptyText: "No v found" }}
                    />
                </TabPane>

                {/* Billing */}
                <TabPane tab={<span><DollarOutlined /> Billing</span>} key="7">
                    <List
                        dataSource={patient.billings || []}
                        renderItem={(billing: any) => (
                            <List.Item>
                                <Card
                                    style={{ width: '100%' }}
                                    title={`Billing #${billing.id}`}
                                    extra={
                                        <Tag color={
                                            billing.status === 'PAID' ? 'green' :
                                                billing.status === 'PENDING' ? 'orange' : 'red'
                                        }>
                                            {billing.status}
                                        </Tag>
                                    }
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} sm={12} md={8}>
                                                <Statistic
                                                    title="Total Amount"
                                                    value={billing.total_amount}
                                                    prefix="₹"
                                                    valueStyle={{ color: '#3f8600' }}
                                                />
                                            </Col>
                                            <Col xs={24} sm={12} md={8}>
                                                <Statistic
                                                    title="Amount Paid"
                                                    value={billing.amount_paid}
                                                    prefix="₹"
                                                    valueStyle={{
                                                        color: billing.amount_paid >= billing.total_amount ? '#3f8600' : '#cf1322'
                                                    }}
                                                />
                                            </Col>
                                            <Col xs={24} sm={12} md={8}>
                                                <Statistic
                                                    title="Balance"
                                                    value={billing.total_amount - billing.amount_paid}
                                                    prefix="₹"
                                                    valueStyle={{ color: '#cf1322' }}
                                                />
                                            </Col>
                                        </Row>

                                        <Descriptions size="small" column={1} bordered>
                                            <Descriptions.Item label="Order ID">
                                                {billing.order_id}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Created Date">
                                                {new Date(billing.created_at).toLocaleDateString()}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Last Updated">
                                                {new Date(billing.updated_at).toLocaleDateString()}
                                            </Descriptions.Item>
                                            {billing.notes && (
                                                <Descriptions.Item label="Notes">
                                                    {billing.notes}
                                                </Descriptions.Item>
                                            )}
                                        </Descriptions>

                                        {/* Order Details */}
                                        {billing.order && (
                                            <Card size="small" title="Order Details">
                                                <Space direction="vertical" style={{ width: '100%' }}>
                                                    {/* Medicines in Order */}
                                                    {billing.order.medicines && billing.order.medicines.length > 0 && (
                                                        <div>
                                                            <Text strong>Medicines:</Text>
                                                            <List
                                                                size="small"
                                                                dataSource={billing.order.medicines}
                                                                renderItem={(medicineItem: any) => (
                                                                    <List.Item>
                                                                        <Space>
                                                                            <Text>{medicineItem.medicine?.name}</Text>
                                                                            <Text type="secondary">Qty: {medicineItem.quantity}</Text>
                                                                            <Text type="secondary">₹{medicineItem.medicine?.medicine_stock?.[0]?.price || 'N/A'}</Text>
                                                                        </Space>
                                                                    </List.Item>
                                                                )}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Lab Tests in Order */}
                                                    {billing.order.lab_tests && billing.order.lab_tests.length > 0 && (
                                                        <div>
                                                            <Text strong>Lab Tests:</Text>
                                                            <List
                                                                size="small"
                                                                dataSource={billing.order.lab_tests}
                                                                renderItem={(test: any) => (
                                                                    <List.Item>
                                                                        <Space>
                                                                            <Text>{test.lab_test?.name}</Text>
                                                                            <Text type="secondary">₹{test.lab_test?.price}</Text>
                                                                            {/* <Tag size="small">{test.status}</Tag> */}
                                                                        </Space>
                                                                    </List.Item>
                                                                )}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Surgeries in Order */}
                                                    {billing.order.surgeries && billing.order.surgeries.length > 0 && (
                                                        <div>
                                                            <Text strong>Surgeries:</Text>
                                                            <List
                                                                size="small"
                                                                dataSource={billing.order.surgeries}
                                                                renderItem={(surgery: any) => (
                                                                    <List.Item>
                                                                        <Space direction="vertical" size="small">
                                                                            <Text>{surgery.surgery_type?.name}</Text>
                                                                            <Space>
                                                                                <Text type="secondary">₹{surgery.price}</Text>
                                                                                {/* <Tag size="small">{surgery.status}</Tag> */}
                                                                            </Space>
                                                                            {surgery.operation_theatre && (
                                                                                <Text type="secondary">
                                                                                    Theatre: {surgery.operation_theatre.name}
                                                                                </Text>
                                                                            )}
                                                                        </Space>
                                                                    </List.Item>
                                                                )}
                                                            />
                                                        </div>
                                                    )}
                                                </Space>
                                            </Card>
                                        )}
                                    </Space>
                                </Card>
                            </List.Item>
                        )}
                        locale={{ emptyText: "No billing records found" }}
                    />
                </TabPane>

                {/* Payments */}
                <TabPane tab={<span><CreditCardOutlined /> Payments</span>} key="8">
                    <List
                        dataSource={patient.payments || []}
                        renderItem={(payment: any) => (
                            <List.Item>
                                <Card
                                    style={{ width: '100%' }}
                                    title={`Payment #${payment.id}`}
                                    extra={
                                        <Tag
                                            color={
                                                payment.method === 'CASH' ? 'blue' :
                                                    payment.method === 'CARD' ? 'green' : 'orange'
                                            }
                                            icon={
                                                payment.method === 'CASH' ? <DollarOutlined /> :
                                                    payment.method === 'CARD' ? <CreditCardOutlined /> : <SyncOutlined />
                                            }
                                        >
                                            {payment.method}
                                        </Tag>
                                    }
                                >
                                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                        <Row gutter={[16, 16]}>
                                            <Col xs={24} sm={12} md={8}>
                                                <Statistic
                                                    title="Amount"
                                                    value={payment.amount}
                                                    prefix="₹"
                                                    valueStyle={{ color: '#3f8600' }}
                                                />
                                            </Col>
                                            <Col xs={24} sm={12} md={8}>
                                                <Statistic
                                                    title="Billing ID"
                                                    value={payment.billing_id}
                                                />
                                            </Col>
                                            <Col xs={24} sm={12} md={8}>
                                                <Statistic
                                                    title="Payment Date"
                                                    value={new Date(payment.created_at).toLocaleDateString()}
                                                />
                                            </Col>
                                        </Row>

                                        <Descriptions size="small" column={1} bordered>
                                            <Descriptions.Item label="Transaction Reference">
                                                {payment.transaction_ref || 'N/A'}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Payment Timestamp">
                                                {new Date(payment.timestamp).toLocaleString()}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Billing Status">
                                                <Tag color={
                                                    payment.billing?.status === 'PAID' ? 'green' :
                                                        payment.billing?.status === 'PENDING' ? 'orange' : 'red'
                                                }>
                                                    {payment.billing?.status || 'N/A'}
                                                </Tag>
                                            </Descriptions.Item>
                                            {payment.billing && (
                                                <Descriptions.Item label="Billing Total">
                                                    ₹{payment.billing.total_amount}
                                                </Descriptions.Item>
                                            )}
                                        </Descriptions>

                                        {/* Related Billing Info */}
                                        {payment.billing && (
                                            <Card size="small" title="Related Billing Information">
                                                <Space direction="vertical">
                                                    <Text>Order ID: {payment.billing.order_id}</Text>
                                                    <Text>
                                                        Amount Paid: ₹{payment.billing.amount_paid} / ₹{payment.billing.total_amount}
                                                    </Text>
                                                    <Text>
                                                        Balance: ₹{payment.billing.total_amount - payment.billing.amount_paid}
                                                    </Text>
                                                </Space>
                                            </Card>
                                        )}
                                    </Space>
                                </Card>
                            </List.Item>
                        )}
                        locale={{ emptyText: "No payment records found" }}
                    />
                </TabPane>
            </Tabs>
        </div>
    );
};

export default PatientDetails;