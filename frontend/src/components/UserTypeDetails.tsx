import { useLocation, useNavigate } from "react-router-dom";
import UserFields from "./UserFields";
import Users from "./Users";

export default function UserTypeDetails() {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract tab from URL path (this is improved for flexibility)
    const segments = location.pathname.split('/');
    const selectedTab = segments[segments.length - 1];  // Last part of the URL

    const userTypeId = segments[segments.length - 2];  // Second last part for user type ID
    const userTypeName = "PATIENT"; // Replace with dynamic name, if needed (based on userTypeId)

    // Helper function for navigation
    function handleNavigate(tab: any) {
        navigate(`/user-types/${userTypeId}/${tab}`);
    };

    return (
        <>
            <h1>{userTypeName}</h1>
            <div className="tabs">
                <button
                    disabled={selectedTab === 'users'}
                    onClick={() => handleNavigate('users')}
                >
                    Users
                </button>
                <button
                    disabled={selectedTab === 'user-fields'}
                    onClick={() => handleNavigate('user-fields')}
                >
                    User Fields
                </button>
            </div>
            <div>
                {selectedTab === 'users' ? <Users /> : <UserFields />}
            </div>
        </>
    );
}
