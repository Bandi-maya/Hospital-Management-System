// import { useState } from "react";

// // Modal for adding a new ward
// const AddWardModal = ({ show, onClose, onSave, departments }: any) => {
//     const [name, setName] = useState("");
//     const [department, setDepartment] = useState(departments[0]?.name || ""); // Default to first department
//     const [createdBy, setCreatedBy] = useState(""); // User ID for creator

//     const handleSave = () => {
//         if (name && department && createdBy) {
//             onSave({ name, department, createdBy });
//             setName("");
//             setDepartment(departments[0]?.name || ""); // Reset to default
//             setCreatedBy("");
//             onClose(); // Close modal after saving
//         } else {
//             alert("All fields are required.");
//         }
//     };

//     if (!show) return null;

//     return (
//         <div className="modal-overlay">
//             <div className="modal-content">
//                 <h2>Add New Ward</h2>
//                 <label>Ward Name:</label>
//                 <input
//                     type="text"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     placeholder="Enter ward name"
//                 />
//                 <label>Department:</label>
//                 <select
//                     value={department}
//                     onChange={(e) => setDepartment(e.target.value)}
//                 >
//                     {departments.map((dept: any) => (
//                         <option key={dept.id} value={dept.name}>
//                             {dept.name}
//                         </option>
//                     ))}
//                 </select>
//                 <label>Created By (User ID):</label>
//                 <input
//                     type="text"
//                     value={createdBy}
//                     onChange={(e) => setCreatedBy(e.target.value)}
//                     placeholder="Enter creator's user ID"
//                 />
//                 <div className="modal-actions">
//                     <button onClick={handleSave}>Save</button>
//                     <button onClick={onClose}>Cancel</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default function Wards() {
//     // Sample wards data (this would be fetched from an API in a real app)
//     const [wards, setWards] = useState([
//         { id: 1, name: "Ward 1", department: "Department 1", createdBy: 1 },
//         // Add more wards here as needed
//     ]);

//     // Sample departments data (this would also be fetched from an API in a real app)
//     const departments = [
//         { id: 1, name: "Department 1" },
//         { id: 2, name: "Department 2" },
//         // Add more departments here as needed
//     ];

//     const [showModal, setShowModal] = useState(false);

//     function handleAddWard(newWard: any) {
//         const newId = wards.length + 1; // Simple ID generation
//         const wardWithId = { id: newId, ...newWard };
//         setWards([...wards, wardWithId]);
//     };

//     return (
//         <>
//             <h1>Wards</h1>

//             <div>
//                 <button className="add-btn" onClick={() => setShowModal(true)}>
//                     Add Ward
//                 </button>

//                 <table>
//                     <thead>
//                         <tr>
//                             <th>ID</th>
//                             <th>Name</th>
//                             <th>Department</th>
//                             <th>Created by</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {wards.map((ward) => (
//                             <tr key={ward.id}>
//                                 <td>{ward.id}</td>
//                                 <td>{ward.name}</td>
//                                 <td>{ward.department}</td>
//                                 <td>{ward.createdBy}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Add Ward Modal */}
//             <AddWardModal
//                 show={showModal}
//                 onClose={() => setShowModal(false)}
//                 onSave={handleAddWard}
//                 departments={departments}
//             />
//         </>
//     );
// }

export default {}