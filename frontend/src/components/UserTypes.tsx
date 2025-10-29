import { useState } from "react";
import { FaBars } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Modal Component
function Modal({ showModal, onClose, onSave }: any) {
    const [userType, setUserType] = useState("");

    const handleSave = () => {
        if (userType.trim() !== "") {
            onSave(userType);
            setUserType(""); // Clear input field after saving
        }
    };

    if (!showModal) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add New User Type</h2>
                <label>User Type Name:</label>
                <input
                    type="text"
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    placeholder="Enter user type"
                />
                <div className="modal-actions">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default function UserTypes() {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [userTypes, setUserTypes] = useState([
        { id: 1, type: "PATIENT" },
        { id: 2, type: "DOCTOR" },
        { id: 3, type: "NURSE" }
    ]);

    function handleAddUserType(newType: any) {
        const newUserType = { id: userTypes.length + 1, type: newType };
        setUserTypes([...userTypes, newUserType]);
        setShowModal(false); // Close the modal after saving
    };

    return (
        <>
            <h1>User Types</h1>
            <div>
                <button onClick={() => setShowModal(true)} className="add-btn">
                    Add User Type
                </button>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Type</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userTypes.map((userType) => (
                            <tr key={userType.id}>
                                <td>{userType.id}</td>
                                <td>{userType.type}</td>
                                <td>
                                    <button onClick={() => navigate(`/user-types/${userType.id}/users`)}>
                                        <FaBars />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal Component */}
            <Modal
                showModal={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleAddUserType}
            />
        </>
    );
}
