import { useState } from "react";
import { Outlet, Link } from "react-router-dom";
import Sidebar from "../../components/Common/Sidebar";
import Topbar from "../../components/Common/Topbar";
import LogoutModal from "../../components/Common/LogoutModal";

import {
  FaFileAlt,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTachometerAlt,
  FaChartBar,
  FaHome,
} from "react-icons/fa";

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogoutClick = () => setIsLogoutModalOpen(true);
  const handleCloseModal = () => setIsLogoutModalOpen(false);
  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-gray-100 min-w-0">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        role="admin"
      >
        <Link
          to="/admin/home"
          onClick={() => setIsSidebarOpen(false)}
          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md text-gray-700"
        >
          <FaHome /> Home
        </Link>

        <Link
          to="/admin/dashboard"
          onClick={() => setIsSidebarOpen(false)}
          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md text-gray-700"
        >
          <FaChartBar /> Dashboard
        </Link>

        <Link
          to="/admin/all-papers"
          onClick={() => setIsSidebarOpen(false)}
          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md text-gray-600"
        >
          <FaFileAlt /> Papers
        </Link>

        <Link
          to="/admin/proposals"
          onClick={() => setIsSidebarOpen(false)}
          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md text-gray-600"
        >
          <FaFileAlt /> Proposals
        </Link>

        <Link
          to="/admin/waitingassignment"
          onClick={() => setIsSidebarOpen(false)}
          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md text-gray-600"
        >
          <FaClock /> Waiting Assignment
        </Link>

        <Link
          to="/admin/teams"
          onClick={() => setIsSidebarOpen(false)}
          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md text-gray-600"
        >
          <FaUsers /> Teams
        </Link>



        <Link
          to="/admin/reviewercommittee"
          onClick={() => setIsSidebarOpen(false)}
          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-md text-gray-600"
        >
          <FaUsers /> Review Committee
        </Link>

        
      </Sidebar>

      {/* Main content area */}
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <Topbar
          onMenuClick={() => setIsSidebarOpen(true)}
          onLogout={handleLogoutClick}
        />

        {/* Main content with scroll and min-w-0 */}
        <main className="flex-1 overflow-auto bg-gray-50 min-w-0">
          <Outlet context={{ toggleSidebar: () => setIsSidebarOpen(true) }} />
        </main>

        {/* Logout modal */}
        {isLogoutModalOpen && (
          <LogoutModal
            isOpen={isLogoutModalOpen}
            onClose={handleCloseModal}
            onConfirm={handleConfirmLogout}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
