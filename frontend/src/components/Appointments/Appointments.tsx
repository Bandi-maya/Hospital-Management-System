// import { Link } from "react-router-dom";
// import { Card, CardContent } from "../UI/Card";

// export default function Appointments() {
//   const appointments = [
//     { id: 1, patient: "Alice Smith", doctor: "Dr. John Doe", date: "2025-09-20", time: "10:00 AM" },
//     { id: 2, patient: "Bob Johnson", doctor: "Dr. Emily Carter", date: "2025-09-20", time: "11:00 AM" },
//   ];

//   return (
//     <Card className="p-4">
//       <h2 className="text-xl font-semibold mb-4">Appointments</h2>
//       <CardContent>
//         <div className="flex justify-end mb-4">
//           <Link
//             to="/appointments/new"
//             className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
//           >
//             + New Appointment
//           </Link>
//         </div>

//         <table className="w-full border border-gray-300 rounded-md">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="p-2 text-left">ID</th>
//               <th className="p-2 text-left">Patient</th>
//               <th className="p-2 text-left">Doctor</th>
//               <th className="p-2 text-left">Date</th>
//               <th className="p-2 text-left">Time</th>
//               <th className="p-2 text-left">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {appointments.map((appt) => (
//               <tr key={appt.id} className="border-t">
//                 <td className="p-2">{appt.id}</td>
//                 <td className="p-2">{appt.patient}</td>
//                 <td className="p-2">{appt.doctor}</td>
//                 <td className="p-2">{appt.date}</td>
//                 <td className="p-2">{appt.time}</td>
//                 <td className="p-2">
//                   <Link
//                     to={`/appointments/${appt.id}`}
//                     className="text-blue-500 hover:underline"
//                   >
//                     View
//                   </Link>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </CardContent>
//     </Card>
//   );
// }

export default {}