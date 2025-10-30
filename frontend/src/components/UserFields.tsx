// import { useState } from "react";
// import { useLocation, useParams } from "react-router-dom";

// // Modal for adding a new user field
// const AddUserFieldModal = ({ show, onClose, onSave }: any) => {
//     const [type, setType] = useState("PATIENT"); // Default type
//     const [fieldName, setFieldName] = useState("");
//     const [isMandatory, setIsMandatory] = useState(false);

//     const handleSave = () => {
//         if (fieldName) {
//             onSave({ type, fieldName, isMandatory });
//             setFieldName("");
//             setIsMandatory(false);
//             setType("PATIENT"); // Reset form
//             onClose(); // Close modal after saving
//         } else {
//             alert("Field name is required.");
//         }
//     };

//     if (!show) return null;

//     return (
//         <div className="modal-overlay">
//             <div className="modal-content">
//                 <h2>Add New User Field</h2>
//                 <label>Type:</label>
//                 <select value={type} onChange={(e) => setType(e.target.value)}>
//                     <option value="PATIENT">Patient</option>
//                     <option value="DOCTOR">Doctor</option>
//                     <option value="NURSE">Nurse</option>
//                     {/* Add more types as needed */}
//                 </select>
//                 <label>Field Name:</label>
//                 <input
//                     type="text"
//                     value={fieldName}
//                     onChange={(e) => setFieldName(e.target.value)}
//                     placeholder="Enter field name"
//                 />
//                 <label>Is Mandatory:</label>
//                 <input
//                     type="checkbox"
//                     checked={isMandatory}
//                     onChange={(e) => setIsMandatory(e.target.checked)}
//                 />
//                 <div className="modal-actions">
//                     <button onClick={handleSave}>Save</button>
//                     <button onClick={onClose}>Cancel</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default function UserFields() {
//     const location = useLocation();
//     const { id } = useParams(); // Get user type ID from route params
//     const splitPath = location.pathname.split('/');
//     const isSubPath = splitPath.length > 2;

//     // Example user fields data (This could be fetched from an API)
//     const [userFields, setUserFields] = useState([
//         { id: 1, type: "PATIENT", fieldName: "Reason", isMandatory: true },
//         // Add more fields here as needed
//     ]);

//     const [showModal, setShowModal] = useState(false);

//     function handleAddUserField(newField: any) {
//         const newId = userFields.length + 1; // Assign a new ID
//         const fieldWithId = { id: newId, ...newField };
//         setUserFields([...userFields, fieldWithId]);
//     };

//     return (
//         <>
//             {isSubPath ? (
//                 <h2>User Fields for {id} Type</h2>
//             ) : (
//                 <h1>User Fields List</h1>
//             )}

//             <div>
//                 <button className="add-btn" onClick={() => setShowModal(true)}>
//                     Add User Field
//                 </button>

//                 <table>
//                     <thead>
//                         <tr>
//                             <th>ID</th>
//                             <th>Type</th>
//                             <th>Field Name</th>
//                             <th>Is Mandatory</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {userFields.map((field) => (
//                             <tr key={field.id}>
//                                 <td>{field.id}</td>
//                                 <td>{field.type}</td>
//                                 <td>{field.fieldName}</td>
//                                 <td>{field.isMandatory ? "Yes" : "No"}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Add User Field Modal */}
//             <AddUserFieldModal
//                 show={showModal}
//                 onClose={() => setShowModal(false)}
//                 onSave={handleAddUserField}
//             />
//         </>
//     );
// }

export default {}