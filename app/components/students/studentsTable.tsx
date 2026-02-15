"use client";

import React, { useState, useEffect } from "react";
import {
  FaSave, FaTimes, FaTrash, FaPlus, FaEdit, FaSearch, FaFilter,
  FaSort, FaSortUp, FaSortDown, FaUser, FaEnvelope, FaPhone, FaSpinner,
  FaMapMarkerAlt, FaCalendarAlt, FaUserGraduate, FaUserTie
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  Student,
  grades,
  classNames,
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent
} from "./mockStudentData";

const ITEMS_PER_PAGE = 5;

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  grade: string;
  className: string;
  enrollmentDate: string;
  parentName: string;
  parentPhone: string;
  isActive: boolean;
}

const StudentTable = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("firstName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterGrade, setFilterGrade] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split('T')[0], // default 10 years ago
    address: "",
    grade: grades[0],
    className: classNames[0],
    enrollmentDate: new Date().toISOString().split('T')[0],
    parentName: "",
    parentPhone: "",
    isActive: true,
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await fetchStudents();
      setStudents(data);
    } catch (error) {
      console.error("Error loading students:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load students.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering
  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchLower) ||
      student.lastName.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.grade.toLowerCase().includes(searchLower) ||
      student.parentName.toLowerCase().includes(searchLower);

    const matchesGrade = filterGrade ? student.grade === filterGrade : true;
    const matchesStatus =
      filterStatus === "active" ? student.isActive :
      filterStatus === "inactive" ? !student.isActive :
      true;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  // Sorting
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aVal: any = a[sortField as keyof Student];
    let bVal: any = b[sortField as keyof Student];

    if (sortField === "fullName") {
      aVal = `${a.firstName} ${a.lastName}`;
      bVal = `${b.firstName} ${b.lastName}`;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      return sortDirection === "asc"
        ? (aVal === bVal ? 0 : aVal ? -1 : 1)
        : (aVal === bVal ? 0 : aVal ? 1 : -1);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = sortedStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const openModal = (student?: Student) => {
    if (student) {
      setEditStudent(student);
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        dateOfBirth: student.dateOfBirth,
        address: student.address,
        grade: student.grade,
        className: student.className,
        enrollmentDate: student.enrollmentDate,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        isActive: student.isActive,
      });
    } else {
      setEditStudent(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split('T')[0],
        address: "",
        grade: grades[0],
        className: classNames[0],
        enrollmentDate: new Date().toISOString().split('T')[0],
        parentName: "",
        parentPhone: "",
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (key: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      Swal.fire({ title: "Missing", text: "First name is required", icon: "warning" });
      return false;
    }
    if (!formData.lastName.trim()) {
      Swal.fire({ title: "Missing", text: "Last name is required", icon: "warning" });
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      Swal.fire({ title: "Invalid", text: "Valid email is required", icon: "warning" });
      return false;
    }
    if (!formData.phone.trim()) {
      Swal.fire({ title: "Missing", text: "Phone number is required", icon: "warning" });
      return false;
    }
    if (!formData.parentName.trim()) {
      Swal.fire({ title: "Missing", text: "Parent/Guardian name is required", icon: "warning" });
      return false;
    }
    if (!formData.parentPhone.trim()) {
      Swal.fire({ title: "Missing", text: "Parent phone is required", icon: "warning" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (editStudent) {
        await updateStudent(editStudent.id, formData);
        Swal.fire({ title: "Updated!", text: "Student updated successfully", icon: "success" });
      } else {
        await createStudent(formData as Omit<Student, 'id'>);
        Swal.fire({ title: "Created!", text: "New student added successfully", icon: "success" });
      }
      await loadStudents();
      setShowModal(false);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Operation failed" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (student: Student) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete ${student.firstName} ${student.lastName}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSaving(true);
        try {
          await deleteStudent(student.id);
          await loadStudents();
          Swal.fire("Deleted!", "Student has been removed.", "success");
        } catch {
          Swal.fire("Error", "Could not delete student", "error");
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const toggleStatus = async (student: Student) => {
    const newStatus = !student.isActive;
    try {
      await updateStudent(student.id, { isActive: newStatus });
      await loadStudents();
      Swal.fire({
        title: "Status Updated",
        text: `${student.firstName} is now ${newStatus ? "Active" : "Inactive"}`,
        icon: "success",
        timer: 1500,
      });
    } catch {
      Swal.fire("Error", "Could not update status", "error");
    }
  };

  // Table headers
  const tableHeaders = [
    { key: "id", label: "ID" },
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "grade", label: "Grade" },
    { key: "className", label: "Class" },
    { key: "parentName", label: "Parent" },
    { key: "isActive", label: "Status" },
  ];

  // Statistics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.isActive).length;
  const inactiveStudents = students.filter(s => !s.isActive).length;
  const gradeCounts = students.reduce((acc, s) => {
    acc[s.grade] = (acc[s.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostCommonGrade = Object.keys(gradeCounts).length
    ? Object.keys(gradeCounts).reduce((a, b) => gradeCounts[a] > gradeCounts[b] ? a : b)
    : "N/A";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600 mt-1">Manage student profiles and enrollment</p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            disabled={isLoading}
          >
            <FaPlus /> Add Student
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name, email, grade, parent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                disabled={isLoading}
              >
                <option value="">All Grades</option>
                {grades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                disabled={isLoading}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                disabled={isLoading}
              >
                <FaFilter /> Filter
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))
          ) : (
            <>
              <StatCard title="Total Students" value={totalStudents} icon={FaUserGraduate} color="indigo" />
              <StatCard title="Active Students" value={activeStudents} icon={FaUser} color="green" />
              <StatCard title="Most Common Grade" value={mostCommonGrade} icon={FaCalendarAlt} color="purple" />
              <StatCard title="Inactive" value={inactiveStudents} icon={FaUser} color="yellow" />
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center">
            <FaSpinner className="w-16 h-16 text-indigo-500 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Students...</h3>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders.map((header) => (
                      <th
                        key={header.key}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort(header.key)}
                      >
                        <div className="flex items-center gap-1">
                          {header.label}
                          {sortField === header.key ? (
                            sortDirection === "asc" ? <FaSortUp className="text-gray-500" /> : <FaSortDown className="text-gray-500" />
                          ) : (
                            <FaSort className="text-gray-400" />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{student.id}</td>
                        <td className="px-6 py-4 text-gray-900">{student.firstName}</td>
                        <td className="px-6 py-4 text-gray-900">{student.lastName}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FaEnvelope className="text-gray-400 text-sm" />
                            <a href={`mailto:${student.email}`} className="text-blue-600 hover:underline">{student.email}</a>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
                            {student.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{student.className}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <FaUserTie className="text-gray-400 text-sm" />
                            <span className="text-sm text-gray-900">{student.parentName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleStatus(student)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border cursor-pointer hover:opacity-90 transition-opacity ${
                              student.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            {student.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal(student)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FaEdit className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDelete(student)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <FaTrash className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FaUserGraduate className="text-4xl text-gray-300 mb-3" />
                          <h3 className="text-lg font-medium text-gray-900">No students found</h3>
                          <p className="text-gray-500">Try adjusting your filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedStudents.length)} of {sortedStudents.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (totalPages > 5) {
                          if (currentPage > 3) pageNum = currentPage - 3 + i;
                          if (currentPage > totalPages - 2) pageNum = totalPages - 4 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                              currentPage === pageNum ? "bg-blue-800 text-white" : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editStudent ? "Edit Student" : "Add New Student"}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {editStudent ? "Update student information" : "Enter student details"}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSaving}
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleFormChange("firstName", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleFormChange("lastName", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleFormChange("dateOfBirth", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-gray-400" /> Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleFormChange("address", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => handleFormChange("grade", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  >
                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {/* Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={formData.className}
                    onChange={(e) => handleFormChange("className", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  >
                    {classNames.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Enrollment Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Date</label>
                  <input
                    type="date"
                    value={formData.enrollmentDate}
                    onChange={(e) => handleFormChange("enrollmentDate", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* Parent Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Name *</label>
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => handleFormChange("parentName", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* Parent Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone *</label>
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => handleFormChange("parentPhone", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* Status Toggle (edit only) */}
                {editStudent && (
                  <div className="md:col-span-2 flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <button
                      type="button"
                      onClick={() => handleFormChange("isActive", !formData.isActive)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                        formData.isActive
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      }`}
                    >
                      {formData.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-xl">
              <div className="flex justify-between items-center">
                {editStudent && (
                  <button
                    onClick={() => handleDelete(editStudent)}
                    className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                    disabled={isSaving}
                  >
                    <FaTrash /> Delete
                  </button>
                )}
                <div className="flex gap-3 ml-auto">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                    disabled={isSaving}
                  >
                    <FaTimes /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> {editStudent ? "Update" : "Create"}</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for stats cards
const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) => {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600",
  }[color] || "bg-gray-50 text-gray-600";

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses}`}>
          <Icon className="text-xl" />
        </div>
      </div>
    </div>
  );
};

export default StudentTable;