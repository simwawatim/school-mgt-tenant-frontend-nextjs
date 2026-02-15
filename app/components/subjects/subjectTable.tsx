"use client";

import React, { useState, useEffect } from "react";
import {
  FaSave, FaTimes, FaTrash, FaPlus, FaEdit, FaSearch, FaFilter,
  FaSort, FaSortUp, FaSortDown, FaBook, FaLayerGroup, FaUserGraduate,
  FaSpinner, FaChalkboardTeacher
} from "react-icons/fa";
import Swal from "sweetalert2";

// ----------------------------------------------------------------------
// Mock Data & Types
// ----------------------------------------------------------------------

export interface Subject {
  id: number;
  name: string;
  code: string;
  department: string;
  credits: number;
  teacher: string;          // assigned teacher's name (for simplicity)
  semester: number;         // which semester the subject is taught
  isActive: boolean;
}

// Mock departments (reuse from teacher page or define separately)
export const departments = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Art"
];

// Mock teachers list (for assignment dropdown)
export const teachers = [
  "Dr. John Smith",
  "Prof. Emily Davis",
  "Dr. Michael Brown",
  "Ms. Sarah Wilson",
  "Mr. David Lee",
  "Dr. Anna Taylor"
];

// Initial mock subjects data
const mockSubjects: Subject[] = [
  {
    id: 1,
    name: "Introduction to Programming",
    code: "CS101",
    department: "Computer Science",
    credits: 3,
    teacher: "Dr. John Smith",
    semester: 1,
    isActive: true
  },
  {
    id: 2,
    name: "Data Structures",
    code: "CS201",
    department: "Computer Science",
    credits: 4,
    teacher: "Prof. Emily Davis",
    semester: 3,
    isActive: true
  },
  {
    id: 3,
    name: "Calculus I",
    code: "MATH101",
    department: "Mathematics",
    credits: 3,
    teacher: "Dr. Michael Brown",
    semester: 1,
    isActive: true
  },
  {
    id: 4,
    name: "Linear Algebra",
    code: "MATH201",
    department: "Mathematics",
    credits: 3,
    teacher: "Dr. Michael Brown",
    semester: 2,
    isActive: true
  },
  {
    id: 5,
    name: "Quantum Mechanics",
    code: "PHY301",
    department: "Physics",
    credits: 4,
    teacher: "Ms. Sarah Wilson",
    semester: 5,
    isActive: false
  },
  {
    id: 6,
    name: "Organic Chemistry",
    code: "CHEM201",
    department: "Chemistry",
    credits: 4,
    teacher: "Mr. David Lee",
    semester: 3,
    isActive: true
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export async function fetchSubjects(): Promise<Subject[]> {
  await delay(800);
  return [...mockSubjects];
}

export async function createSubject(subject: Omit<Subject, 'id'>): Promise<Subject> {
  await delay(600);
  const newId = Math.max(...mockSubjects.map(s => s.id), 0) + 1;
  const newSubject = { ...subject, id: newId };
  mockSubjects.push(newSubject);
  return newSubject;
}

export async function updateSubject(id: number, updates: Partial<Subject>): Promise<Subject> {
  await delay(600);
  const index = mockSubjects.findIndex(s => s.id === id);
  if (index === -1) throw new Error("Subject not found");
  mockSubjects[index] = { ...mockSubjects[index], ...updates };
  return mockSubjects[index];
}

export async function deleteSubject(id: number): Promise<void> {
  await delay(500);
  const index = mockSubjects.findIndex(s => s.id === id);
  if (index === -1) throw new Error("Subject not found");
  mockSubjects.splice(index, 1);
}

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

const ITEMS_PER_PAGE = 5;

interface FormData {
  name: string;
  code: string;
  department: string;
  credits: number;
  teacher: string;
  semester: number;
  isActive: boolean;
}

const SubjectTable = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterDepartment, setFilterDepartment] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: "",
    department: departments[0],
    credits: 3,
    teacher: teachers[0],
    semester: 1,
    isActive: true,
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSubjects();
      setSubjects(data);
    } catch (error) {
      console.error("Error loading subjects:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load subjects.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering
  const filteredSubjects = subjects.filter((subject) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      subject.name.toLowerCase().includes(searchLower) ||
      subject.code.toLowerCase().includes(searchLower) ||
      subject.department.toLowerCase().includes(searchLower) ||
      subject.teacher.toLowerCase().includes(searchLower);

    const matchesDepartment = filterDepartment ? subject.department === filterDepartment : true;
    const matchesStatus =
      filterStatus === "active" ? subject.isActive :
      filterStatus === "inactive" ? !subject.isActive :
      true;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Sorting
  const sortedSubjects = [...filteredSubjects].sort((a, b) => {
    let aVal: any = a[sortField as keyof Subject];
    let bVal: any = b[sortField as keyof Subject];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      return sortDirection === "asc"
        ? (aVal === bVal ? 0 : aVal ? -1 : 1)
        : (aVal === bVal ? 0 : aVal ? 1 : -1);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedSubjects.length / ITEMS_PER_PAGE);
  const paginatedSubjects = sortedSubjects.slice(
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

  const openModal = (subject?: Subject) => {
    if (subject) {
      setEditSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code,
        department: subject.department,
        credits: subject.credits,
        teacher: subject.teacher,
        semester: subject.semester,
        isActive: subject.isActive,
      });
    } else {
      setEditSubject(null);
      setFormData({
        name: "",
        code: "",
        department: departments[0],
        credits: 3,
        teacher: teachers[0],
        semester: 1,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (key: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Swal.fire({ title: "Missing", text: "Subject name is required", icon: "warning" });
      return false;
    }
    if (!formData.code.trim()) {
      Swal.fire({ title: "Missing", text: "Subject code is required", icon: "warning" });
      return false;
    }
    if (!formData.credits || formData.credits <= 0) {
      Swal.fire({ title: "Invalid", text: "Credits must be a positive number", icon: "warning" });
      return false;
    }
    if (!formData.semester || formData.semester < 1) {
      Swal.fire({ title: "Invalid", text: "Semester must be at least 1", icon: "warning" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (editSubject) {
        await updateSubject(editSubject.id, formData);
        Swal.fire({ title: "Updated!", text: "Subject updated successfully", icon: "success" });
      } else {
        await createSubject(formData as Omit<Subject, 'id'>);
        Swal.fire({ title: "Created!", text: "New subject added successfully", icon: "success" });
      }
      await loadSubjects();
      setShowModal(false);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Operation failed" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (subject: Subject) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete ${subject.name} (${subject.code})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSaving(true);
        try {
          await deleteSubject(subject.id);
          await loadSubjects();
          Swal.fire("Deleted!", "Subject has been removed.", "success");
        } catch {
          Swal.fire("Error", "Could not delete subject", "error");
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const toggleStatus = async (subject: Subject) => {
    const newStatus = !subject.isActive;
    try {
      await updateSubject(subject.id, { isActive: newStatus });
      await loadSubjects();
      Swal.fire({
        title: "Status Updated",
        text: `${subject.name} is now ${newStatus ? "Active" : "Inactive"}`,
        icon: "success",
        timer: 1500,
      });
    } catch {
      Swal.fire("Error", "Could not update status", "error");
    }
  };

  // Table headers
  const tableHeaders = [
    { key: "code", label: "Code" },
    { key: "name", label: "Subject Name" },
    { key: "department", label: "Department" },
    { key: "credits", label: "Credits" },
    { key: "teacher", label: "Teacher" },
    { key: "semester", label: "Semester" },
    { key: "isActive", label: "Status" },
  ];

  // Statistics
  const totalSubjects = subjects.length;
  const activeSubjects = subjects.filter(s => s.isActive).length;
  const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
  const departmentsCount = new Set(subjects.map(s => s.department)).size;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Subject Management</h1>
            <p className="text-gray-600 mt-1">Manage course subjects and assignments</p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            disabled={isLoading}
          >
            <FaPlus /> Add Subject
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search subjects by name, code, department, teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                disabled={isLoading}
              >
                <option value="">All Departments</option>
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
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
              <StatCard title="Total Subjects" value={totalSubjects} icon={FaBook} color="indigo" />
              <StatCard title="Active Subjects" value={activeSubjects} icon={FaChalkboardTeacher} color="green" />
              <StatCard title="Total Credits" value={totalCredits} icon={FaLayerGroup} color="purple" />
              <StatCard title="Departments" value={departmentsCount} icon={FaUserGraduate} color="yellow" />
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center">
            <FaSpinner className="w-16 h-16 text-indigo-500 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Subjects...</h3>
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
                  {paginatedSubjects.length > 0 ? (
                    paginatedSubjects.map((subject) => (
                      <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-sm text-gray-900">{subject.code}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{subject.name}</td>
                        <td className="px-6 py-4 text-gray-700">{subject.department}</td>
                        <td className="px-6 py-4 text-gray-900">{subject.credits}</td>
                        <td className="px-6 py-4 text-gray-700">{subject.teacher}</td>
                        <td className="px-6 py-4 text-gray-900">{subject.semester}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleStatus(subject)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border cursor-pointer hover:opacity-90 transition-opacity ${
                              subject.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            {subject.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal(subject)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FaEdit className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDelete(subject)}
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
                      <td colSpan={8} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FaBook className="text-4xl text-gray-300 mb-3" />
                          <h3 className="text-lg font-medium text-gray-900">No subjects found</h3>
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
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedSubjects.length)} of {sortedSubjects.length}
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
                              currentPage === pageNum ? "bg-secondary text-white" : "text-gray-700 hover:bg-gray-100"
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

      {/* Subject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editSubject ? "Edit Subject" : "Add New Subject"}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {editSubject ? "Update subject information" : "Enter subject details"}
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
                {/* Subject Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* Subject Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleFormChange("code", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleFormChange("department", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  >
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Credits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credits *</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.credits}
                    onChange={(e) => handleFormChange("credits", parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* Teacher */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Teacher</label>
                  <select
                    value={formData.teacher}
                    onChange={(e) => handleFormChange("teacher", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  >
                    {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => handleFormChange("semester", parseInt(e.target.value) || 1)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* Status Toggle (edit only) */}
                {editSubject && (
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
                {editSubject && (
                  <button
                    onClick={() => handleDelete(editSubject)}
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
                    {isSaving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> {editSubject ? "Update" : "Create"}</>}
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
const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) => {
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

export default SubjectTable;