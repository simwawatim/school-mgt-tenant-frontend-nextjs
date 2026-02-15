"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";

interface HeaderProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const HeaderComp = ({ isOpen, toggleSidebar }: HeaderProps) => {
  const [profileImage, setProfileImage] = useState("/default-profile.png");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setProfileImage("/profile.png");
  }, []);

  return (
    <header
      className="
        flex shadow-lg py-4 px-4 sm:px-10 bg-white text-white min-h-[70px] relative z-30
        lg:ml-[250px] lg:w-[calc(100%-250px)]
      "
    >
      {/* Mobile view: left toggle + right profile */}
      <div className="flex items-center justify-between w-full lg:hidden">
        <button
          onClick={toggleSidebar}
          className="text-white text-2xl focus:outline-none"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className="relative" ref={dropdownRef}>
          <img
            src={profileImage}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-gray-600 shadow-sm object-cover cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg overflow-hidden z-50">
              <Link
                href="/profile"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Desktop view: profile on the right (sidebar offset already applied to header) */}
      <div className="hidden lg:flex items-center justify-between w-full">
        {/* Optional left placeholder */}
        <div></div>

        <div className="relative" ref={dropdownRef}>
          <img
            src={profileImage}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-gray-600 shadow-sm cursor-pointer object-cover"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg overflow-hidden z-50">
              <Link
                href="/profile"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-2 hover:bg-gray-200"
                onClick={() => setDropdownOpen(false)}
              >
                Settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderComp;