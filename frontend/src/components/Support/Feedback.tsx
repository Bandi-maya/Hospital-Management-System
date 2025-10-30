// import { useState } from "react";
// import { Card, CardContent } from "../UI/Card";

// const Feedback = () => {
//   const [feedbackList, setFeedbackList] = useState([
//     { id: 1, user: "John Doe", message: "Great service!", rating: 5 },
//     { id: 2, user: "Alice", message: "Waiting time was long.", rating: 3 },
//   ]);

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold mb-4">Patient Feedback</h2>
//       <Card>
//         <CardContent>
//           {feedbackList.length === 0 ? (
//             <p>No feedback received yet.</p>
//           ) : (
//             <ul className="space-y-4">
//               {feedbackList.map((fb) => (
//                 <li key={fb.id} className="border p-3 rounded-md">
//                   <div className="flex justify-between">
//                     <span className="font-semibold">{fb.user}</span>
//                     <span className="text-yellow-500">{"⭐".repeat(fb.rating)}</span>
//                   </div>
//                   <p>{fb.message}</p>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default Feedback;
export default {}