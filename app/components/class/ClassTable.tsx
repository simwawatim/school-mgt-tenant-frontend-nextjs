"use client";

import React, { useState, useEffect } from "react";
import {
  FaSave, FaTimes, FaTrash, FaPlus, FaEdit, FaSearch, FaFilter,
  FaSort, FaSortUp, FaSortDown, FaDoorOpen, FaUsers, FaChalkboardTeacher,
  FaSpinner
} from "react-icons/fa";
import Swal from "sweetalert2";

// ----------------------------------------------------------------------
// Mock Data & Types
// ----------------------------------------------------------------------

export interface Class {
  id: number;
  name: string;           // e.g., "Mathematics 101"
  section: string;        // e.g., "A", "B"
  subject: string;
  teacher: string;
  room: string;
  capacity: number;
  isActive: boolean;
}

// Mock subjects (reuse or define)
const subjects = [
  "Mathematics", "Physics", "Chemistry", "Biology",
  "Computer Science", "English", "History", "Art"
];

// Mock teachers
const teachers = [
  "Dr. John Smith", "Prof. Emily Davis", "Dr. Michael Brown",
  "Ms. Sarah Wilson", "Mr. David Lee", "Dr. Anna Taylor"
];

// Mock rooms
const rooms = ["A101", "A102", "B201", "B202", "C301", "Lab1", "Lab2"];

const mockClasses: Class[] = [
  {
    id: 1,
    name: "Mathematics 101",
    section: "A",
    subject: "Mathematics",
    teacher: "Dr. Michael Brown",
    room: "A101",
    capacity: 30,
    isActive: true
  },
  {
    id: 2,
    name: "Physics 201",
    section: "B",
    subject: "Physics",
    teacher: "Ms. Sarah Wilson",
    room: "B201",
    capacity: 25,
    isActive: true
  },
  {
    id: 3,
    name: "Computer Science 101",
    section: "A",
    subject: "Computer Science",
    teacher: "Dr. John Smith",
    room: "Lab1",
    capacity: 20,
    isActive: true
  },
  {
    id: 4,
    name: "Chemistry 101",
    section: "C",
    subject: "Chemistry",
    teacher: "Mr. David Lee",
    room: "C301",
    capacity: 30,
    isActive: false
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchClasses(): Promise<Class[]> {
  await delay(800);
  return [...mockClasses];
}

export async function createClass(cls: Omit<Class, 'id'>): Promise<Class> {
  await delay(600);
  const newId = Math.max(...mockClasses.map(c => c.id), 0) + 1;
  const newClass = { ...cls, id: newId };
  mockClasses.push(newClass);
  return newClass;
}

export async function updateClass(id: number, updates: Partial<Class>): Promise<Class> {
  await delay(600);
  const index = mockClasses.findIndex(c => c.id === id);
  if (index === -1) throw new Error("Class not found");
  mockClasses[index] = { ...mockClasses[index], ...updates };
  return mockClasses[index];
}

export async function deleteClass(id: number): Promise<void> {
  await delay(500);
  const index = mockClasses.findIndex(c => c.id === id);
  if (index === -1) throw new Error("Class not found");
  mockClasses.splice(index, 1);
}

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

const ITEMS_PER_PAGE = 5;

interface FormData {
  name: string;
  section: string;
  subject: string;
  teacher: string;
  room: string;
  capacity: number;
  isActive: boolean;
}

const ClassTable = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [editClass, setEditClass] = useState<Class | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    section: "",
    subject: subjects[0],
    teacher: teachers[0],
    room: rooms[0],
    capacity: 30,
    isActive: true,
  });

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setIsLoading(true);
    try {
      const data = await fetchClasses();
      setClasses(data);
    } catch (error) {
      console.error("Error loading classes:", error);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load classes." });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering
  const filteredClasses = classes.filter(cls => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      cls.name.toLowerCase().includes(searchLower) ||
      cls.section.toLowerCase().includes(searchLower) ||
      cls.subject.toLowerCase().includes(searchLower) ||
      cls.teacher.toLowerCase().includes(searchLower) ||
      cls.room.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus ? (filterStatus === "active" ? cls.isActive : !cls.isActive) : true;
    return matchesSearch && matchesStatus;
  });

  // Sorting
  const sortedClasses = [...filteredClasses].sort((a, b) => {
    let aVal: any = a[sortField as keyof Class];
    let bVal: any = b[sortField as keyof Class];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedClasses.length / ITEMS_PER_PAGE);
  const paginatedClasses = sortedClasses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const openModal = (cls?: Class) => {
    if (cls) {
      setEditClass(cls);
      setFormData({ ...cls });
    } else {
      setEditClass(null);
      setFormData({
        name: "", section: "", subject: subjects[0], teacher: teachers[0],
        room: rooms[0], capacity: 30, isActive: true
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Swal.fire({ title: "Missing", text: "Class name is required", icon: "warning" });
      return false;
    }
    if (!formData.capacity || formData.capacity <= 0) {
      Swal.fire({ title: "Invalid", text: "Capacity must be a positive number", icon: "warning" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      if (editClass) {
        await updateClass(editClass.id, formData);
        Swal.fire({ title: "Updated!", text: "Class updated successfully", icon: "success" });
      } else {
        await createClass(formData as Omit<Class, 'id'>);
        Swal.fire({ title: "Created!", text: "New class added successfully", icon: "success" });
      }
      await loadClasses();
      setShowModal(false);
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Operation failed" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (cls: Class) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete class "${cls.name} - Section ${cls.section}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSaving(true);
        try {
          await deleteClass(cls.id);
          await loadClasses();
          Swal.fire("Deleted!", "Class has been removed.", "success");
        } catch {
          Swal.fire("Error", "Could not delete class", "error");
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const toggleStatus = async (cls: Class) => {
    try {
      await updateClass(cls.id, { isActive: !cls.isActive });
      await loadClasses();
      Swal.fire({
        title: "Status Updated",
        text: `${cls.name} is now ${!cls.isActive ? "Active" : "Inactive"}`,
        icon: "success",
        timer: 1500,
      });
    } catch {
      Swal.fire("Error", "Could not update status", "error");
    }
  };

  const tableHeaders = [
    { key: "name", label: "Class Name" },
    { key: "section", label: "Section" },
    { key: "subject", label: "Subject" },
    { key: "teacher", label: "Teacher" },
    { key: "room", label: "Room" },
    { key: "capacity", label: "Capacity" },
    { key: "isActive", label: "Status" },
  ];

  const totalClasses = classes.length;
  const activeClasses = classes.filter(c => c.isActive).length;
  const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
            <p className="text-gray-600 mt-1">Manage class sections and assignments</p>
          </div>
          <button onClick={() => openModal()} className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50">
            <FaPlus /> Add Class
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes by name, subject, teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:border-indigo-500"
                disabled={isLoading}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900"
              disabled={isLoading}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <FaFilter /> Filter
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white p-4 rounded-xl shadow-sm animate-pulse"><div className="h-4 bg-gray-200 rounded w-24 mb-2"></div><div className="h-8 bg-gray-200 rounded w-16"></div></div>)
          ) : (
            <>
              <StatCard title="Total Classes" value={totalClasses} icon={FaDoorOpen} color="indigo" />
              <StatCard title="Active Classes" value={activeClasses} icon={FaChalkboardTeacher} color="green" />
              <StatCard title="Total Capacity" value={totalCapacity} icon={FaUsers} color="purple" />
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="w-full py-20 flex flex-col items-center"><FaSpinner className="w-16 h-16 text-indigo-500 animate-spin mb-4" /><h3>Loading Classes...</h3></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders.map(header => (
                      <th key={header.key} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort(header.key)}>
                        <div className="flex items-center gap-1">
                          {header.label}
                          {sortField === header.key ? (sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort className="text-gray-400" />}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedClasses.length > 0 ? (
                    paginatedClasses.map(cls => (
                      <tr key={cls.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-black">{cls.name}</td>
                        <td className="px-6 py-4 text-black">{cls.section}</td>
                        <td className="px-6 py-4 text-black">{cls.subject}</td>
                        <td className="px-6 py-4 text-black">{cls.teacher}</td>
                        <td className="px-6 py-4 text-black">{cls.room}</td>
                        <td className="px-6 py-4 text-black">{cls.capacity}</td>
                        <td className="px-6 py-4 text-black">
                          <button onClick={() => toggleStatus(cls)} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${cls.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>
                            {cls.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-black">
                          <div className="flex gap-2">
                            <button onClick={() => openModal(cls)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><FaEdit /></button>
                            <button onClick={() => handleDelete(cls)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={8} className="px-6 py-12 text-center"><FaDoorOpen className="text-4xl text-gray-300 mx-auto mb-3" /><h3>No classes found</h3></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedClasses.length)} of {sortedClasses.length}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Previous</button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5) {
                        if (currentPage > 3) pageNum = currentPage - 3 + i;
                        if (currentPage > totalPages - 2) pageNum = totalPages - 4 + i;
                      }
                      return (
                        <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`px-3 py-1.5 text-sm font-medium rounded-lg ${currentPage === pageNum ? "bg-secondary text-white" : "text-gray-700 hover:bg-gray-100"}`}>
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{editClass ? "Edit Class" : "Add New Class"}</h2>
                <p className="text-gray-600 text-sm">{editClass ? "Update class information" : "Enter class details"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaTimes /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => handleFormChange("name", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" disabled={isSaving} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input type="text" value={formData.section} onChange={(e) => handleFormChange("section", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" disabled={isSaving} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select value={formData.subject} onChange={(e) => handleFormChange("subject", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black">
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                  <select value={formData.teacher} onChange={(e) => handleFormChange("teacher", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black">
                    {teachers.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                  <select value={formData.room} onChange={(e) => handleFormChange("room", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black">
                    {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <input type="number" min="1" value={formData.capacity} onChange={(e) => handleFormChange("capacity", parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" />
                </div>
                {editClass && (
                  <div className="md:col-span-2 flex items-center gap-4">
                    <span className="text-sm font-medium">Status:</span>
                    <button type="button" onClick={() => handleFormChange("isActive", !formData.isActive)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${formData.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>
                      {formData.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-xl flex justify-between items-center">
              {editClass && (
                <button onClick={() => handleDelete(editClass)} className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2">
                  <FaTrash /> Delete
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
                  {isSaving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> {editClass ? "Update" : "Create"}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// StatCard component (same as before)
const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) => {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  }[color] || "bg-gray-50 text-gray-600";
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses}`}><Icon className="text-xl" /></div>
      </div>
    </div>
  );
};

export default ClassTable;