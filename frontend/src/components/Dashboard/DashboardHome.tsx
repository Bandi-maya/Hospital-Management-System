// Components/Dashboard/DashboardHome.jsx
import { Users, Calendar, BedDouble, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../UI/Card";

export default function DashboardHome() {
    const stats = [
        { title: "Total Patients", value: 1280, icon: Users, color: "text-blue-600", link: "/users" },
        { title: "Appointments Today", value: 52, icon: Calendar, color: "text-green-600", link: "/appointments" },
        { title: "Available Beds", value: 18, icon: BedDouble, color: "text-purple-600", link: "/wards" },
        { title: "Monthly Revenue", value: "₹ 4.8L", icon: DollarSign, color: "text-yellow-600", link: "/billing" },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <h1 className="text-2xl font-bold text-gray-800">🏥 Hospital Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <Link to={stat.link} key={index}>
                        <Card className="hover:shadow-lg transition-shadow duration-200 rounded-2xl">
                            <CardContent className="flex items-center justify-between p-6">
                                <div>
                                    <p className="text-gray-500 text-sm">{stat.title}</p>
                                    <h2 className="text-2xl font-bold">{stat.value}</h2>
                                </div>
                                <stat.icon className={`h-10 w-10 ${stat.color}`} />
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick Links */}
            <div className="bg-white shadow-md rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                    <Link to="/appointments" className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600">
                        ➕ Book Appointment
                    </Link>
                    <Link to="/admissions" className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600">
                        🏥 Admit Patient
                    </Link>
                    <Link to="/billing" className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600">
                        💳 Generate Bill
                    </Link>
                    <Link to="/lab-tests" className="px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600">
                        🧪 Request Lab Test
                    </Link>
                </div>
            </div>
        </div>
    );
}
