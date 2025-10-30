// import { Card, CardContent } from "../UI/Card";

// const Billing = () => {
//   const bills = [
//     {
//       id: 101,
//       patient: "John Doe",
//       amount: 2500,
//       status: "Paid",
//       date: "2025-09-15",
//     },
//     {
//       id: 102,
//       patient: "Jane Doe",
//       amount: 1800,
//       status: "Pending",
//       date: "2025-09-16",
//     },
//   ];

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4">Billing</h2>
//       <Card>
//         <CardContent>
//           <table className="w-full border">
//             <thead>
//               <tr className="bg-gray-100">
//                 <th className="border p-2">Invoice ID</th>
//                 <th className="border p-2">Patient</th>
//                 <th className="border p-2">Amount</th>
//                 <th className="border p-2">Status</th>
//                 <th className="border p-2">Date</th>
//                 <th className="border p-2">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {bills.map((bill) => (
//                 <tr key={bill.id}>
//                   <td className="border p-2">{bill.id}</td>
//                   <td className="border p-2">{bill.patient}</td>
//                   <td className="border p-2">₹{bill.amount}</td>
//                   <td className="border p-2">{bill.status}</td>
//                   <td className="border p-2">{bill.date}</td>
//                   <td className="border p-2">
//                     <button className="px-3 py-1 bg-blue-500 text-white rounded">
//                       View
//                     </button>
//                     <button className="ml-2 px-3 py-1 bg-green-500 text-white rounded">
//                       Print
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default Billing;

export default {}