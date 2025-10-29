import { useState } from "react";
import { useLocation, useParams } from "react-router-dom";

// Modal for adding a new user
const AddUserModal = ({ show, onClose, onSave }: any) => {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [type, setType] = useState("PATIENT"); // Default type, adjust as needed

    const handleSave = () => {
        if (name && username && email) {
            onSave({ name, username, email, type });
            setName("");
            setUsername("");
            setEmail("");
            setType("PATIENT"); // Reset the form
            onClose(); // Close the modal after saving
        } else {
            alert("All fields are required.");
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add New User</h2>
                <label>Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                />
                <label>Username:</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                />
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                />
                <label>Type:</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="NURSE">Nurse</option>
                    {/* Add more types as needed */}
                </select>
                <div className="modal-actions">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default function Users() {
    const location = useLocation();
    const { id } = useParams(); // Get the user type ID from the route params
    const splitPath = location.pathname.split('/');
    const isSubPath = splitPath.length > 2;

    const [users, setUsers] = useState([
        { id: 1, name: "Vignesh", username: "Vignesh", email: "Vignesh@gmail.com", type: "PATIENT" },
        // Add more users here as needed
    ]);

    const [showModal, setShowModal] = useState(false);

    function handleAddUser(newUser: any) {
        // Assign a new ID (simple method here, you might want to adjust it for your use case)
        const newId = users.length + 1;
        const userWithId = { id: newId, ...newUser };
        setUsers([...users, userWithId]);
    };

    return (
        <>
            {isSubPath ? (
                <h2>Users for {id} Type</h2>
            ) : (
                <h1>Users List</h1>
            )}

            <div>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                    Add User
                </button>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.type}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            <AddUserModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleAddUser}
            />
        </>
    );
}
