"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  FaTachometerAlt,
  FaChalkboardTeacher,
  FaSchool,
  FaUser,
  FaSignOutAlt,
  FaBook,
  FaUserGraduate,
  FaChartLine,
  FaBullhorn,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaBus,
  FaBed,
  FaPencilAlt,
  FaBookOpen,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { MOCK_TENANT_INFO } from "./tenantSettings";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  href: string;
}

const mockLogout = () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "/";
};

const SidebarComp = ({ isOpen, toggleSidebar }: SidebarProps) => {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [tenantInfo] = useState(MOCK_TENANT_INFO);

  useEffect(() => setIsClient(true), []);

  const menuItems: MenuItem[] = useMemo(
    () => [
      { name: "Dashboard", icon: <FaTachometerAlt />, href: "/dashboard" },
      { name: "Teachers", icon: <FaChalkboardTeacher />, href: "/teachers" },
      { name: "Students", icon: <FaUser />, href: "/students" },
      { name: "Classes", icon: <FaSchool />, href: "/classes" },
      { name: "Subjects", icon: <FaBook />, href: "/subjects" },
      { name: "Attendance", icon: <FaCalendarAlt />, href: "/attendance" },
      { name: "Fees", icon: <FaMoneyBillWave />, href: "/fees" },
      { name: "Exams", icon: <FaPencilAlt />, href: "/exams" },
      { name: "Timetable", icon: <FaClock />, href: "/timetable" },
      { name: "Library", icon: <FaBookOpen />, href: "/library" },
      { name: "Transport", icon: <FaBus />, href: "/transport" },
      { name: "Hostel", icon: <FaBed />, href: "/hostel" },
      { name: "Announcements", icon: <FaBullhorn />, href: "/announcements" },
      { name: "Results", icon: <FaChartLine />, href: "/results" },
      { name: "Enrollment", icon: <FaUserGraduate />, href: "/enrollment" },
    ],
    []
  );

  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname === href || pathname.startsWith(href + "/");
    },
    [pathname]
  );

  const handleLinkClick = useCallback(() => {
    if (window.innerWidth < 1024) toggleSidebar();
  }, [toggleSidebar]);

  const handleLogout = useCallback(() => {
    handleLinkClick();
    mockLogout();
  }, [handleLinkClick]);

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-white lg:hidden shadow-lg hover:bg-primary/90"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-primary to-primary/95
          text-white z-50 shadow-2xl transition-all duration-300
          flex flex-col min-w-[250px] max-w-[250px]
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6 border-b border-white/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={handleLinkClick}
          >
            <div className="shrink-0">
              <FaSchool size={28} />
            </div>
            <div className="min-w-0 flex-1">
              {isClient ? (
                <h1 className="text-lg font-bold truncate" title={tenantInfo.name}>
                  {tenantInfo.name}
                </h1>
              ) : (
                <h1 className="text-lg font-bold truncate">Loading...</h1>
              )}
              <p className="text-xs text-white/60 mt-1">Dashboard</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-lg
                      transition-all duration-200
                      ${
                        active
                          ? "bg-white/20 text-white shadow-lg"
                          : "hover:bg-white/10 hover:translate-x-1"
                      }
                    `}
                  >
                    {item.icon}
                    <span className="text-sm font-medium truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default SidebarComp;