// import { useState, useEffect } from "react";
// import {
//   Card,
//   Tabs,
//   Form,
//   Input,
//   Switch,
//   Button,
//   Select,
//   Space,
//   Row,
//   Col,
//   Alert,
//   message,
//   InputNumber,
//   TimePicker,
//   Statistic,
//   Avatar,
//   Badge,
//   Tag,
//   Progress,
//   Radio,
//   Checkbox,
//   Slider,
//   Skeleton,
//   Dropdown,
//   Menu,
//   Modal,
//   Drawer,
//   FloatButton,
//   Timeline,
//   Watermark,
//   theme,
//   Typography,
//   Tooltip,
//   Flex,
//   Collapse
// } from "antd";
// import {
//   LockOutlined,
//   BellOutlined,
//   SaveOutlined,
//   ReloadOutlined,
//   DatabaseOutlined,
//   SettingOutlined,
//   CheckCircleOutlined,
//   DashboardOutlined,
//   EyeOutlined,
//   HeartOutlined,
//   ThunderboltOutlined,
//   MessageOutlined,
//   CloudDownloadOutlined,
//   CloseOutlined,
//   MoreOutlined,
//   QuestionCircleOutlined,
//   SyncOutlined,
//   UserOutlined,
//   AppstoreOutlined,
//   ExclamationCircleFilled,
//   CheckCircleFilled,
//   BulbFilled,
//   ExportOutlined,
//   ImportOutlined} from "@ant-design/icons";
// import dayjs from "dayjs";

// const { TabPane } = Tabs;
// const { Option } = Select;
// const { TextArea } = Input;
// const { Title, Text } = Typography;
// const { Panel } = Collapse;
// const { useToken } = theme;

// // Default user settings
// const defaultUserSettings = {
//   // Personalization
//   personalization: {
//     theme: "light",
//     language: "en",
//     timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//     dateFormat: "MM/DD/YYYY",
//     timeFormat: "12h",
//     fontSize: "medium",
//     compactMode: false,
//     reduceAnimations: false,
//     highContrast: false,
//     colorBlindMode: false,
//   },

//   // Privacy & Security
//   privacy: {
//     profileVisibility: "public",
//     activityStatus: true,
//     readReceipts: true,
//     twoFactorAuth: false,
//     loginAlerts: true,
//     dataExport: true,
//     autoLogout: 30,
//     clearHistoryOnExit: false,
//     cookieConsent: true,
//     locationSharing: false,
//   },

//   // Notifications
//   notifications: {
//     emailNotifications: true,
//     pushNotifications: true,
//     smsNotifications: false,
//     soundEnabled: true,
//     vibrationEnabled: true,
//     desktopNotifications: true,
//     marketingEmails: false,
//     securityAlerts: true,
//     systemUpdates: true,
//     appointmentReminders: true,
//     medicationReminders: true,
//     billingAlerts: true,
//   },

//   // Communication
//   communication: {
//     autoReply: false,
//     autoReplyMessage: "Thank you for your message. I will get back to you soon.",
//     emailSignature: "Best regards,\n[Your Name]",
//     defaultEmailClient: "browser",
//     chatAvailability: "available",
//     doNotDisturb: false,
//     dndStartTime: "22:00",
//     dndEndTime: "08:00",
//     messageFormat: "rich",
//     fontFamily: "system",
//   },

//   // Display & Accessibility
//   accessibility: {
//     screenReader: false,
//     keyboardNavigation: true,
//     largeText: false,
//     boldText: false,
//     increaseContrast: false,
//     reduceMotion: false,
//     captioning: false,
//     audioDescription: false,
//     dyslexiaFont: false,
//     cursorSize: "normal",
//   },

//   // Data & Storage
//   dataStorage: {
//     autoBackup: true,
//     backupFrequency: "weekly",
//     cloudSync: true,
//     localStorage: true,
//     dataRetention: 365,
//     autoDeleteOldData: false,
//     exportFormat: "json",
//     compressFiles: true,
//     maxFileSize: 25,
//     syncAcrossDevices: true,
//   },

//   // Health & Wellness
//   health: {
//     stepGoal: 10000,
//     sleepGoal: 8,
//     waterReminder: true,
//     medicationReminders: true,
//     exerciseReminders: false,
//     mentalHealthCheckins: true,
//     healthReports: true,
//     emergencyContacts: true,
//     bloodType: "",
//     allergies: "",
//     conditions: "",
//   },

//   // Social & Sharing
//   social: {
//     shareActivity: true,
//     shareAchievements: true,
//     friendSuggestions: true,
//     groupInvitations: true,
//     eventInvitations: true,
//     socialFeed: true,
//     commentsEnabled: true,
//     likesVisible: true,
//     profileDiscoverable: true,
//     connectionNotifications: true,
//   },

//   // Payment & Billing
//   billing: {
//     paymentMethod: "card",
//     autoRenew: true,
//     paperlessBilling: true,
//     billingAlerts: true,
//     taxDocuments: true,
//     invoiceEmails: true,
//     currency: "USD",
//     savePaymentInfo: false,
//     billingAddress: "",
//     receiptStorage: true,
//   },

//   // Advanced
//   advanced: {
//     developerMode: false,
//     betaFeatures: false,
//     analyticsSharing: true,
//     crashReports: true,
//     performanceData: true,
//     diagnosticData: false,
//     apiAccess: false,
//     webhooks: false,
//     customCSS: "",
//     experimentalFeatures: false,
//   }
// };

// export default function UserSettings() {
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState("personalization");
//   const [settings, setSettings] = useState(defaultUserSettings);
//   const [drawerVisible, setDrawerVisible] = useState(false);
//   const { token } = useToken();

//   // Skeleton components
//   const StatisticSkeleton = () => (
//     <Card>
//       <Skeleton active paragraph={{ rows: 1 }} />
//     </Card>
//   );

//   const CardSkeleton = () => (
//     <Card>
//       <Skeleton active avatar paragraph={{ rows: 3 }} />
//     </Card>
//   );

//   const FormSkeleton = () => (
//     <Card>
//       <Skeleton active paragraph={{ rows: 6 }} />
//     </Card>
//   );

//   useEffect(() => {
//     // Simulate loading user settings
//     const timer = setTimeout(() => {
//       const savedSettings = localStorage.getItem("userSettings");
//       if (savedSettings) {
//         try {
//           const parsedSettings = JSON.parse(savedSettings);
//           setSettings(parsedSettings);
//           form.setFieldsValue(parsedSettings);
//         } catch (error) {
//           console.error("Error loading saved settings:", error);
//           message.error("Error loading saved settings. Using defaults.");
//           form.setFieldsValue(defaultUserSettings);
//         }
//       } else {
//         localStorage.setItem("userSettings", JSON.stringify(defaultUserSettings));
//         form.setFieldsValue(defaultUserSettings);
//       }
//       setLoading(false);
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, [form]);

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const values = await form.validateFields();
//       const updatedSettings = { ...settings, ...values };
      
//       setSettings(updatedSettings);
//       localStorage.setItem("userSettings", JSON.stringify(updatedSettings));
//       localStorage.setItem('userSettingsLastSaved', new Date().toLocaleString());
      
//       message.success({
//         content: 'Settings saved successfully!',
//         icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
//       });
//     } catch (error) {
//       console.error("Validation failed:", error);
//       message.error("Please fix the errors before saving.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleReset = () => {
//     Modal.confirm({
//       title: 'Reset All Settings?',
//       content: 'This will reset all your settings to their default values. This action cannot be undone.',
//       okText: 'Reset',
//       okType: 'danger',
//       cancelText: 'Cancel',
//       icon: <ExclamationCircleFilled />,
//       onOk() {
//         setSettings(defaultUserSettings);
//         form.setFieldsValue(defaultUserSettings);
//         localStorage.setItem("userSettings", JSON.stringify(defaultUserSettings));
//         message.info("All settings have been reset to default values.");
//       },
//     });
//   };

//   const handleExportSettings = () => {
//     try {
//       const dataStr = JSON.stringify(settings, null, 2);
//       const dataBlob = new Blob([dataStr], { type: 'application/json' });
//       const url = URL.createObjectURL(dataBlob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `user-settings-${dayjs().format('YYYY-MM-DD')}.json`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(url);
//       message.success("Settings exported successfully!");
//     } catch (error) {
//       message.error("Failed to export settings.");
//     }
//   };

//   const getSettingsStats = () => {
//     const totalSettings = Object.keys(settings).reduce((acc, category) => 
//       acc + Object.keys(settings[category as keyof typeof settings]).length, 0
//     );
    
//     const enabledFeatures = Object.values(settings).flatMap(category =>
//       Object.values(category).filter(val => val === true)
//     ).length;

//     return {
//       totalSettings,
//       enabledFeatures,
//       lastSaved: localStorage.getItem('userSettingsLastSaved') || 'Never',
//       categories: Object.keys(settings).length,
//     };
//   };

//   const stats = getSettingsStats();

//   const moreActionsMenu = (
//     <Menu
//       items={[
//         {
//           key: 'export',
//           icon: <ExportOutlined />,
//           label: 'Export Settings',
//           onClick: handleExportSettings,
//         },
//         {
//           key: 'import',
//           icon: <ImportOutlined />,
//           label: 'Import Settings',
//         },
//         {
//           type: 'divider',
//         },
//         {
//           key: 'backup',
//           icon: <CloudDownloadOutlined />,
//           label: 'Backup All Data',
//         },
//         {
//           key: 'help',
//           icon: <QuestionCircleOutlined />,
//           label: 'Help & Support',
//         },
//       ]}
//     />
//   );

//   if (loading) {
//     return (
//       <Watermark content="User Settings">
//         <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
//           {/* Header Skeleton */}
//           <CardSkeleton />
          
//           {/* Statistics Skeleton */}
//           <Row gutter={[16, 16]}>
//             {[...Array(4)].map((_, i) => (
//               <Col key={i} xs={24} sm={12} md={6}>
//                 <StatisticSkeleton />
//               </Col>
//             ))}
//           </Row>

//           {/* Tabs Skeleton */}
//           <Card>
//             <Skeleton active paragraph={{ rows: 8 }} />
//           </Card>
//         </div>
//       </Watermark>
//     );
//   }

//   return (
    
//       <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
//         {/* Header */}
//         <Card className="shadow-sm border-0">
//           <Flex justify="space-between" align="center">
//             <div>
//               <Space size="large">
//                 <Avatar 
//                   size={64} 
//                   icon={<SettingOutlined />} 
//                   style={{ 
//                     backgroundColor: token.colorPrimary,
//                     fontSize: '24px'
//                   }} 
//                 />
//                 <div>
//                   <Title level={2} style={{ margin: 0, color: token.colorTextHeading }}>
//                     ⚙️ User Settings
//                   </Title>
//                   <Text type="secondary" style={{ margin: 0 }}>
//                     <DashboardOutlined /> Customize your experience and preferences
//                   </Text>
//                 </div>
//               </Space>
//             </div>
//             <Space>
//               <Tooltip title="Auto Save">
//                 <Switch 
//                   checkedChildren={<CheckCircleOutlined />}
//                   unCheckedChildren={<CloseOutlined />}
//                   defaultChecked
//                 />
//               </Tooltip>
//               <Dropdown overlay={moreActionsMenu} placement="bottomRight">
//                 <Button icon={<MoreOutlined />} size="large">
//                   More Actions
//                 </Button>
//               </Dropdown>
//               <Button 
//                 danger 
//                 icon={<ReloadOutlined />} 
//                 onClick={handleReset}
//                 size="large"
//               >
//                 Reset All
//               </Button>
//               <Button 
//                 type="primary" 
//                 icon={<SaveOutlined />} 
//                 onClick={handleSave}
//                 loading={saving}
//                 size="large"
//               >
//                 Save Changes
//               </Button>
//             </Space>
//           </Flex>
//         </Card>

//         {/* Statistics Cards */}
//         <Row gutter={[16, 16]}>
//           <Col xs={24} sm={12} md={6}>
//             <Card>
//               <Statistic 
//                 title="Total Settings" 
//                 value={stats.totalSettings} 
//                 prefix={<SettingOutlined />}
//                 valueStyle={{ color: token.colorPrimary }}
//               />
//             </Card>
//           </Col>
//           <Col xs={24} sm={12} md={6}>
//             <Card>
//               <Statistic 
//                 title="Enabled Features" 
//                 value={stats.enabledFeatures} 
//                 valueStyle={{ color: '#52c41a' }}
//                 prefix={<CheckCircleFilled />}
//               />
//             </Card>
//           </Col>
//           <Col xs={24} sm={12} md={6}>
//             <Card>
//               <Statistic 
//                 title="Categories" 
//                 value={stats.categories} 
//                 valueStyle={{ color: '#fa8c16' }}
//                 prefix={<AppstoreOutlined />}
//               />
//             </Card>
//           </Col>
//           <Col xs={24} sm={12} md={6}>
//             <Card>
//               <Space direction="vertical" style={{ width: '100%' }}>
//                 <div className="text-gray-600">Last Saved</div>
//                 <div className="font-semibold text-lg">{stats.lastSaved}</div>
//                 <Progress percent={100} status="active" size="small" />
//               </Space>
//             </Card>
//           </Col>
//         </Row>

//         <Alert
//           message="Personalize Your Experience"
//           description="Adjust settings to match your preferences. Changes are saved automatically to your browser's local storage."
//           type="info"
//           showIcon
//           closable
//           icon={<BulbFilled />}
//         />

//         <Card className="shadow-lg border-0" bodyStyle={{ padding: 0 }}>
//           <Tabs
//             activeKey={activeTab}
//             onChange={setActiveTab}
//             tabPosition="left"
//             size="large"
//             style={{ minHeight: 600 }}
//             items={[
//               {
//                 key: "personalization",
//                 label: (
//                   <Space>
//                     <UserOutlined style={{ color: token.colorPrimary }} />
//                     Personalization
//                   </Space>
//                 ),
//                 children: (
//                   <div className="p-6">
//                     <Title level={3}>🎨 Personalization Settings</Title>
//                     <Form form={form} layout="vertical" initialValues={settings.personalization}>
//                       <Row gutter={[24, 16]}>
//                         <Col span={12}>
//                           <Form.Item label="Theme" name="theme">
//                             <Select size="large">
//                               <Option value="light">Light</Option>
//                               <Option value="dark">Dark</Option>
//                               <Option value="auto">Auto</Option>
//                             </Select>
//                           </Form.Item>
//                         </Col>
//                         <Col span={12}>
//                           <Form.Item label="Language" name="language">
//                             <Select size="large">
//                               <Option value="en">English</Option>
//                               <Option value="es">Spanish</Option>
//                               <Option value="fr">French</Option>
//                               <Option value="de">German</Option>
//                             </Select>
//                           </Form.Item>
//                         </Col>
//                       </Row>

//                       <Row gutter={[24, 16]}>
//                         <Col span={12}>
//                           <Form.Item label="Font Size" name="fontSize">
//                             <Radio.Group>
//                               <Radio value="small">Small</Radio>
//                               <Radio value="medium">Medium</Radio>
//                               <Radio value="large">Large</Radio>
//                             </Radio.Group>
//                           </Form.Item>
//                         </Col>
//                         <Col span={12}>
//                           <Form.Item label="Time Format" name="timeFormat">
//                             <Radio.Group>
//                               <Radio value="12h">12-hour</Radio>
//                               <Radio value="24h">24-hour</Radio>
//                             </Radio.Group>
//                           </Form.Item>
//                         </Col>
//                       </Row>

//                       <Space direction="vertical" style={{ width: '100%' }}>
//                         <Form.Item name="compactMode" valuePropName="checked">
//                           <Checkbox>Compact Mode</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="reduceAnimations" valuePropName="checked">
//                           <Checkbox>Reduce Animations</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="highContrast" valuePropName="checked">
//                           <Checkbox>High Contrast Mode</Checkbox>
//                         </Form.Item>
//                       </Space>
//                     </Form>
//                   </div>
//                 ),
//               },
//               {
//                 key: "privacy",
//                 label: (
//                   <Space>
//                     <LockOutlined style={{ color: '#f5222d' }} />
//                     Privacy & Security
//                   </Space>
//                 ),
//                 children: (
//                   <div className="p-6">
//                     <Title level={3}>🔒 Privacy & Security</Title>
//                     <Form form={form} layout="vertical" initialValues={settings.privacy}>
//                       <Row gutter={[24, 16]}>
//                         <Col span={12}>
//                           <Form.Item label="Profile Visibility" name="profileVisibility">
//                             <Select size="large">
//                               <Option value="public">Public</Option>
//                               <Option value="friends">Friends Only</Option>
//                               <Option value="private">Private</Option>
//                             </Select>
//                           </Form.Item>
//                         </Col>
//                         <Col span={12}>
//                           <Form.Item label="Auto Logout (minutes)" name="autoLogout">
//                             <InputNumber min={5} max={480} style={{ width: '100%' }} />
//                           </Form.Item>
//                         </Col>
//                       </Row>

//                       <Space direction="vertical" style={{ width: '100%' }}>
//                         <Form.Item name="twoFactorAuth" valuePropName="checked">
//                           <Checkbox>Two-Factor Authentication</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="loginAlerts" valuePropName="checked">
//                           <Checkbox>Login Alerts</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="activityStatus" valuePropName="checked">
//                           <Checkbox>Show Activity Status</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="readReceipts" valuePropName="checked">
//                           <Checkbox>Read Receipts</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="clearHistoryOnExit" valuePropName="checked">
//                           <Checkbox>Clear History on Exit</Checkbox>
//                         </Form.Item>
//                       </Space>
//                     </Form>
//                   </div>
//                 ),
//               },
//               {
//                 key: "notifications",
//                 label: (
//                   <Space>
//                     <BellOutlined style={{ color: '#fa8c16' }} />
//                     Notifications
//                     <Badge count={5} size="small" />
//                   </Space>
//                 ),
//                 children: (
//                   <div className="p-6">
//                     <Title level={3}>🔔 Notification Preferences</Title>
//                     <Form form={form} layout="vertical" initialValues={settings.notifications}>
//                       <Row gutter={[24, 16]}>
//                         <Col span={12}>
//                           <Form.Item name="emailNotifications" valuePropName="checked">
//                             <Checkbox>Email Notifications</Checkbox>
//                           </Form.Item>
//                         </Col>
//                         <Col span={12}>
//                           <Form.Item name="pushNotifications" valuePropName="checked">
//                             <Checkbox>Push Notifications</Checkbox>
//                           </Form.Item>
//                         </Col>
//                       </Row>

//                       <Row gutter={[24, 16]}>
//                         <Col span={12}>
//                           <Form.Item name="appointmentReminders" valuePropName="checked">
//                             <Checkbox>Appointment Reminders</Checkbox>
//                           </Form.Item>
//                         </Col>
//                         <Col span={12}>
//                           <Form.Item name="medicationReminders" valuePropName="checked">
//                             <Checkbox>Medication Reminders</Checkbox>
//                           </Form.Item>
//                         </Col>
//                       </Row>

//                       <Row gutter={[24, 16]}>
//                         <Col span={12}>
//                           <Form.Item name="soundEnabled" valuePropName="checked">
//                             <Checkbox>Sound Enabled</Checkbox>
//                           </Form.Item>
//                         </Col>
//                         <Col span={12}>
//                           <Form.Item name="vibrationEnabled" valuePropName="checked">
//                             <Checkbox>Vibration Enabled</Checkbox>
//                           </Form.Item>
//                         </Col>
//                       </Row>

//                       <Alert
//                         message="Notification Settings"
//                         description="Customize how and when you receive notifications"
//                         type="info"
//                         showIcon
//                       />
//                     </Form>
//                   </div>
//                 ),
//               },
//               {
//                 key: "communication",
//                 label: (
//                   <Space>
//                     <MessageOutlined style={{ color: '#13c2c2' }} />
//                     Communication
//                   </Space>
//                 ),
//                 children: (
//                   <div className="p-6">
//                     <Title level={3}>💬 Communication Settings</Title>
//                     <Form form={form} layout="vertical" initialValues={settings.communication}>
//                       <Row gutter={[24, 16]}>
//                         <Col span={12}>
//                           <Form.Item name="autoReply" valuePropName="checked">
//                             <Checkbox>Auto-Reply Messages</Checkbox>
//                           </Form.Item>
//                         </Col>
//                         <Col span={12}>
//                           <Form.Item name="doNotDisturb" valuePropName="checked">
//                             <Checkbox>Do Not Disturb</Checkbox>
//                           </Form.Item>
//                         </Col>
//                       </Row>

//                       <Form.Item label="Auto-Reply Message" name="autoReplyMessage">
//                         <TextArea rows={3} placeholder="Your auto-reply message..." />
//                       </Form.Item>

//                       <Form.Item label="Email Signature" name="emailSignature">
//                         <TextArea rows={2} placeholder="Your email signature..." />
//                       </Form.Item>

//                       <Row gutter={[24, 16]}>
//                         <Col span={12}>
//                           <Form.Item label="Do Not Disturb Start" name="dndStartTime">
//                             <TimePicker format="HH:mm" style={{ width: '100%' }} />
//                           </Form.Item>
//                         </Col>
//                         <Col span={12}>
//                           <Form.Item label="Do Not Disturb End" name="dndEndTime">
//                             <TimePicker format="HH:mm" style={{ width: '100%' }} />
//                           </Form.Item>
//                         </Col>
//                       </Row>
//                     </Form>
//                   </div>
//                 ),
//               },
//               {
//                 key: "accessibility",
//                 label: (
//                   <Space>
//                     <EyeOutlined style={{ color: '#722ed1' }} />
//                     Accessibility
//                   </Space>
//                 ),
//                 children: (
//                   <div className="p-6">
//                     <Title level={3}>♿ Accessibility Settings</Title>
//                     <Form form={form} layout="vertical" initialValues={settings.accessibility}>
//                       <Space direction="vertical" style={{ width: '100%' }}>
//                         <Form.Item name="screenReader" valuePropName="checked">
//                           <Checkbox>Screen Reader Support</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="keyboardNavigation" valuePropName="checked">
//                           <Checkbox>Enhanced Keyboard Navigation</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="largeText" valuePropName="checked">
//                           <Checkbox>Large Text</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="boldText" valuePropName="checked">
//                           <Checkbox>Bold Text</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="increaseContrast" valuePropName="checked">
//                           <Checkbox>Increase Contrast</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="reduceMotion" valuePropName="checked">
//                           <Checkbox>Reduce Motion</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="dyslexiaFont" valuePropName="checked">
//                           <Checkbox>Dyslexia-Friendly Font</Checkbox>
//                         </Form.Item>
//                       </Space>
//                     </Form>
//                   </div>
//                 ),
//               },
//               {
//                 key: "health",
//                 label: (
//                   <Space>
//                     <HeartOutlined style={{ color: '#eb2f96' }} />
//                     Health & Wellness
//                   </Space>
//                 ),
//                 children: (
//                   <div className="p-6">
//                     <Title level={3}>❤️ Health & Wellness Settings</Title>
//                     <Form form={form} layout="vertical" initialValues={settings.health}>
//                       <Row gutter={[24, 16]}>
//                         <Col span={12}>
//                           <Form.Item label="Daily Step Goal" name="stepGoal">
//                             <InputNumber 
//                               min={1000} 
//                               max={50000} 
//                               style={{ width: '100%' }}
//                               addonAfter="steps"
//                             />
//                           </Form.Item>
//                         </Col>
//                         <Col span={12}>
//                           <Form.Item label="Sleep Goal" name="sleepGoal">
//                             <InputNumber 
//                               min={4} 
//                               max={12} 
//                               style={{ width: '100%' }}
//                               addonAfter="hours"
//                             />
//                           </Form.Item>
//                         </Col>
//                       </Row>

//                       <Space direction="vertical" style={{ width: '100%' }}>
//                         <Form.Item name="waterReminder" valuePropName="checked">
//                           <Checkbox>Water Reminder</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="medicationReminders" valuePropName="checked">
//                           <Checkbox>Medication Reminders</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="exerciseReminders" valuePropName="checked">
//                           <Checkbox>Exercise Reminders</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="mentalHealthCheckins" valuePropName="checked">
//                           <Checkbox>Mental Health Check-ins</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="emergencyContacts" valuePropName="checked">
//                           <Checkbox>Emergency Contacts</Checkbox>
//                         </Form.Item>
//                       </Space>

//                       <Form.Item label="Allergies" name="allergies">
//                         <Input placeholder="List any allergies..." />
//                       </Form.Item>

//                       <Form.Item label="Medical Conditions" name="conditions">
//                         <TextArea rows={2} placeholder="List any medical conditions..." />
//                       </Form.Item>
//                     </Form>
//                   </div>
//                 ),
//               },
//               {
//                 key: "data",
//                 label: (
//                   <Space>
//                     <DatabaseOutlined style={{ color: '#fa541c' }} />
//                     Data & Storage
//                   </Space>
//                 ),
//                 children: (
//                   <div className="p-6">
//                     <Title level={3}>💾 Data & Storage Settings</Title>
//                     <Form form={form} layout="vertical" initialValues={settings.dataStorage}>
//                       <Row gutter={[24, 16]}>
//                         <Col span={12}>
//                           <Form.Item name="autoBackup" valuePropName="checked">
//                             <Checkbox>Auto Backup</Checkbox>
//                           </Form.Item>
//                         </Col>
//                         <Col span={12}>
//                           <Form.Item name="cloudSync" valuePropName="checked">
//                             <Checkbox>Cloud Sync</Checkbox>
//                           </Form.Item>
//                         </Col>
//                       </Row>

//                       <Row gutter={[24, 16]}>
//                         <Col span={12}>
//                           <Form.Item label="Backup Frequency" name="backupFrequency">
//                             <Select>
//                               <Option value="daily">Daily</Option>
//                               <Option value="weekly">Weekly</Option>
//                               <Option value="monthly">Monthly</Option>
//                             </Select>
//                           </Form.Item>
//                         </Col>
//                         <Col span={12}>
//                           <Form.Item label="Data Retention (days)" name="dataRetention">
//                             <InputNumber min={30} max={1095} style={{ width: '100%' }} />
//                           </Form.Item>
//                         </Col>
//                       </Row>

//                       <Form.Item label="Max File Size (MB)" name="maxFileSize">
//                         <Slider
//                           min={1}
//                           max={100}
//                           marks={{
//                             1: '1MB',
//                             25: '25MB',
//                             50: '50MB',
//                             75: '75MB',
//                             100: '100MB'
//                           }}
//                         />
//                       </Form.Item>

//                       <Space direction="vertical" style={{ width: '100%' }}>
//                         <Form.Item name="compressFiles" valuePropName="checked">
//                           <Checkbox>Compress Files</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="syncAcrossDevices" valuePropName="checked">
//                           <Checkbox>Sync Across Devices</Checkbox>
//                         </Form.Item>
//                         <Form.Item name="autoDeleteOldData" valuePropName="checked">
//                           <Checkbox>Auto Delete Old Data</Checkbox>
//                         </Form.Item>
//                       </Space>
//                     </Form>
//                   </div>
//                 ),
//               },
//             ]}
//           />

//           <div className="border-t bg-gray-50 px-6 py-4">
//             <Flex justify="space-between" align="center">
//               <Space>
//                 <Text type="secondary">
//                   Current: {activeTab === "personalization" ? "Personalization" : 
//                            activeTab === "privacy" ? "Privacy & Security" :
//                            activeTab === "notifications" ? "Notifications" :
//                            activeTab === "communication" ? "Communication" :
//                            activeTab === "accessibility" ? "Accessibility" :
//                            activeTab === "health" ? "Health & Wellness" : "Data & Storage"}
//                 </Text>
//                 <Tag color="blue">{stats.enabledFeatures} Features Enabled</Tag>
//               </Space>
//               <Space>
//                 <Button onClick={handleReset} disabled={saving}>
//                   Reset to Defaults
//                 </Button>
//                 <Button 
//                   type="primary" 
//                   onClick={handleSave} 
//                   loading={saving} 
//                   icon={<SaveOutlined />}
//                   size="large"
//                 >
//                   Save All Changes
//                 </Button>
//               </Space>
//             </Flex>
//           </div>
//         </Card>

//         {/* Quick Settings Drawer */}
//         <Drawer
//           title="Quick Settings"
//           placement="right"
//           onClose={() => setDrawerVisible(false)}
//           open={drawerVisible}
//           width={400}
//         >
//           <Space direction="vertical" style={{ width: '100%' }} size="large">
//             <Card size="small" title="Quick Actions">
//               <Space direction="vertical" style={{ width: '100%' }}>
//                 <Button icon={<CloudDownloadOutlined />} block>
//                   Export Settings
//                 </Button>
//                 <Button icon={<SyncOutlined />} block onClick={handleSave}>
//                   Save Changes
//                 </Button>
//                 <Button icon={<ReloadOutlined />} block onClick={handleReset}>
//                   Reset All
//                 </Button>
//               </Space>
//             </Card>
            
//             <Card size="small" title="Recent Changes">
//               <Timeline>
//                 <Timeline.Item color="green">
//                   <div>Theme changed to Dark</div>
//                   <small>2 hours ago</small>
//                 </Timeline.Item>
//                 <Timeline.Item color="blue">
//                   <div>Notifications enabled</div>
//                   <small>1 day ago</small>
//                 </Timeline.Item>
//                 <Timeline.Item color="gray">
//                   <div>Privacy settings updated</div>
//                   <small>3 days ago</small>
//                 </Timeline.Item>
//               </Timeline>
//             </Card>
//           </Space>
//         </Drawer>

//         {/* Floating Action Button */}
//         {/* <FloatButton.Group
//           shape="circle"
//           style={{ right: 24 }}
//           icon={<ThunderboltOutlined />}
//         >
//           <FloatButton
//             icon={<SaveOutlined />}
//             tooltip="Save Settings"
//             onClick={handleSave}
//           />
//           <FloatButton
//             icon={<SettingOutlined />}
//             tooltip="Quick Settings"
//             onClick={() => setDrawerVisible(true)}
//           />
//           <FloatButton.BackTop visibilityHeight={0} />
//         </FloatButton.Group> */}
//       </div>
    
//   );
// }
export default {};