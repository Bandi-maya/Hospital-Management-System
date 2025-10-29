import { useState } from "react";

// Modal for adding a new department
const AddDepartmentModal = ({ show, onClose, onSave }: any) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [createdBy, setCreatedBy] = useState(""); // Assume it's a user ID for simplicity

    const handleSave = () => {
        if (name && description && createdBy) {
            onSave({ name, description, createdBy });
            setName("");
            setDescription("");
            setCreatedBy("");
            onClose(); // Close the modal after saving
        } else {
            alert("All fields are required.");
        }
    };

    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Add New Department</h2>
                <label>Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter department name"
                />
                <label>Description:</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter department description"
                />
                <label>Created By (User ID):</label>
                <input
                    type="text"
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value)}
                    placeholder="Enter creator's user ID"
                />
                <div className="modal-actions">
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default function Departments() {
    // Sample department data (this would be fetched from an API in a real app)
    const [departments, setDepartments] = useState([
        { id: 1, name: "Department 1", description: "Description 1", createdBy: 1 },
        // Add more departments here as needed
    ]);

    const [showModal, setShowModal] = useState(false);

    function handleAddDepartment(newDepartment: any) {
        const newId = departments.length + 1; // Simple ID generation
        const departmentWithId = { id: newId, ...newDepartment };
        setDepartments([...departments, departmentWithId]);
    };

    return (
        <>
            <h1>Departments</h1>

            <div>
                <button className="add-btn" onClick={() => setShowModal(true)}>
                    Add Department
                </button>

                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Created by</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map((department) => (
                            <tr key={department.id}>
                                <td>{department.id}</td>
                                <td>{department.name}</td>
                                <td>{department.description}</td>
                                <td>{department.createdBy}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Department Modal */}
            <AddDepartmentModal
                show={showModal}
                onClose={() => setShowModal(false)}
                onSave={handleAddDepartment}
            />
        </>
    );
}
