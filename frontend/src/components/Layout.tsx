// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { FaBars, FaHome, FaUser, FaHospital, FaPills, FaFlask, FaFileInvoiceDollar, FaCogs, FaHeadset } from "react-icons/fa";

// const Layout = ({ children }: any) => {
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const navigate = useNavigate();

//   const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

//   const sidebarItems = [
//     { name: "Dashboard", icon: <FaHome />, path: "/" },
//     {
//       name: "Users",
//       icon: <FaUser />,
//       path: "/users",
//       subItems: [
//         { name: "User Types", path: "/user-types" },
//         { name: "Users", path: "/users" },
//       ],
//     },
//     {
//       name: "Departments",
//       icon: <FaHospital />,
//       path: "/departments",
//     },
//     {
//       name: "Appointments",
//       icon: <FaHospital />,
//       path: "/appointments",
//     },
//     {
//       name: "Pharmacy",
//       icon: <FaPills />,
//       path: "/pharmacy",
//     },
//     {
//       name: "Laboratory",
//       icon: <FaFlask />,
//       path: "/laboratory",
//     },
//     {
//       name: "Billing",
//       icon: <FaFileInvoiceDollar />,
//       path: "/billing",
//     },
//     {
//       name: "Admin",
//       icon: <FaCogs />,
//       path: "/admin",
//     },
//     {
//       name: "Support",
//       icon: <FaHeadset />,
//       path: "/support",
//     },
//   ];

//   return (
//     <div className="flex h-screen bg-gray-100">
//       {/* Sidebar */}
//       <aside
//         className={`bg-white shadow-md transition-all duration-300 ${
//           sidebarOpen ? "w-64" : "w-16"
//         }`}
//       >
//         <div className="flex items-center justify-between p-4 border-b">
//           <span className={`font-bold text-lg ${!sidebarOpen && "hidden"}`}>HospitalMS</span>
//           <button onClick={toggleSidebar}>
//             <FaBars />
//           </button>
//         </div>

//         <nav className="mt-4">
//           {sidebarItems.map((item, idx) => (
//             <div key={idx}>
//               <Link
//                 to={item.path}
//                 className="flex items-center p-3 hover:bg-gray-200 transition rounded"
//               >
//                 <span className="text-xl">{item.icon}</span>
//                 <span className={`ml-3 ${!sidebarOpen && "hidden"}`}>{item.name}</span>
//               </Link>
//               {/* Sub-items */}
//               {item.subItems && sidebarOpen && (
//                 <div className="ml-10">
//                   {item.subItems.map((sub, i) => (
//                     <Link
//                       key={i}
//                       to={sub.path}
//                       className="block p-2 text-gray-600 hover:text-black hover:underline"
//                     >
//                       {sub.name}
//                     </Link>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </nav>
//       </aside>

//       {/* Main content */}
//       <div className="flex-1 flex flex-col">
//         {/* Header */}
//         <header className="bg-white shadow p-4 flex justify-between items-center">
//           <h1 className="text-xl font-bold">Hospital Management System</h1>
//           <button
//             className="bg-red-500 text-white px-3 py-1 rounded"
//             onClick={() => navigate("/login")}
//           >
//             Logout
//           </button>
//         </header>

//         {/* Content */}
//         <main className="flex-1 p-6 overflow-auto">{children}</main>
//       </div>
//     </div>
//   );
// };

// export default Layout;

export default {}