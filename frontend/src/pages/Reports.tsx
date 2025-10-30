// // src/pages/Reports.tsx
// import { useQuery } from "@tanstack/react-query";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { toast } from "sonner";
// import {
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
// } from "recharts";

// // Dummy API (replace with real backend)
// const api = {
//   async getReports() {
//     return {
//       metrics: {
//         patients: 120,
//         appointments: 85,
//         revenue: 45000,
//         doctors: 12,
//       },
//       monthlyAppointments: [
//         { month: "Jan", count: 20 },
//         { month: "Feb", count: 25 },
//         { month: "Mar", count: 40 },
//         { month: "Apr", count: 30 },
//       ],
//       revenueTrends: [
//         { month: "Jan", revenue: 10000 },
//         { month: "Feb", revenue: 12000 },
//         { month: "Mar", revenue: 15000 },
//         { month: "Apr", revenue: 8000 },
//       ],
//       topDoctors: [
//         { id: 1, name: "Dr. Maya", patients: 45, revenue: 15000 },
//         { id: 2, name: "Dr. John", patients: 30, revenue: 12000 },
//         { id: 3, name: "Dr. Smith", patients: 25, revenue: 9000 },
//       ],
//     };
//   },
// };

// export default function Reports() {
//   const { data, isLoading, isError } = useQuery({
//     queryKey: ["reports"],
//     queryFn: api.getReports,
//   });

//   if (isLoading) {
//     return <div className="p-6">Loading reports...</div>;
//   }

//   if (isError || !data) {
//     toast.error("Failed to load reports");
//     return <div className="p-6">Error loading reports</div>;
//   }

//   const { metrics, monthlyAppointments, revenueTrends, topDoctors } = data;

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-bold">Reports & Analytics</h1>

//       {/* Quick Metrics */}
//       <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
//         <Card>
//           <CardHeader>
//             <CardTitle>Patients</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold">{metrics.patients}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Appointments</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold">{metrics.appointments}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Revenue</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold">₹{metrics.revenue}</p>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardHeader>
//             <CardTitle>Doctors</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <p className="text-2xl font-bold">{metrics.doctors}</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Charts */}
//       <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
//         <Card>
//           <CardHeader>
//             <CardTitle>Monthly Appointments</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart data={monthlyAppointments}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="count" fill="#0ea5e9" />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Revenue Trends</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={250}>
//               <LineChart data={revenueTrends}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="month" />
//                 <YAxis />
//                 <Tooltip />
//                 <Line
//                   type="monotone"
//                   dataKey="revenue"
//                   stroke="#10b981"
//                   strokeWidth={2}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Top Doctors Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Top Performing Doctors</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Doctor</TableHead>
//                 <TableHead>Patients</TableHead>
//                 <TableHead>Revenue</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {topDoctors.map((doc) => (
//                 <TableRow key={doc.id}>
//                   <TableCell>{doc.name}</TableCell>
//                   <TableCell>{doc.patients}</TableCell>
//                   <TableCell>₹{doc.revenue}</TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

export default {}