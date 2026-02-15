"use client";

import React, { useState, useEffect } from "react";
import {
  FaSave, FaTimes, FaTrash, FaPlus, FaEdit, FaSearch, FaFilter,
  FaSort, FaSortUp, FaSortDown, FaCalendarAlt, FaFlag, FaSpinner,
  FaClock
} from "react-icons/fa";
import Swal from "sweetalert2";

// ----------------------------------------------------------------------
// Mock Data & Types
// ----------------------------------------------------------------------

export interface Term {
  id: number;
  name: string;           // e.g., "Fall 2025"
  startDate: string;      // ISO date string (YYYY-MM-DD)
  endDate: string;
  isActive: boolean;      // whether this is the current term
}

// Initial mock terms data
const mockTerms: Term[] = [
  {
    id: 1,
    name: "Fall 2024",
    startDate: "2024-09-01",
    endDate: "2024-12-20",
    isActive: false
  },
  {
    id: 2,
    name: "Spring 2025",
    startDate: "2025-01-15",
    endDate: "2025-05-10",
    isActive: true
  },
  {
    id: 3,
    name: "Summer 2025",
    startDate: "2025-06-01",
    endDate: "2025-08-15",
    isActive: false
  },
  {
    id: 4,
    name: "Fall 2025",
    startDate: "2025-09-01",
    endDate: "2025-12-20",
    isActive: false
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export async function fetchTerms(): Promise<Term[]> {
  await delay(800);
  return [...mockTerms];
}

export async function createTerm(term: Omit<Term, 'id'>): Promise<Term> {
  await delay(600);
  const newId = Math.max(...mockTerms.map(t => t.id), 0) + 1;
  const newTerm = { ...term, id: newId };
  mockTerms.push(newTerm);
  return newTerm;
}

export async function updateTerm(id: number, updates: Partial<Term>): Promise<Term> {
  await delay(600);
  const index = mockTerms.findIndex(t => t.id === id);
  if (index === -1) throw new Error("Term not found");
  mockTerms[index] = { ...mockTerms[index], ...updates };
  return mockTerms[index];
}

export async function deleteTerm(id: number): Promise<void> {
  await delay(500);
  const index = mockTerms.findIndex(t => t.id === id);
  if (index === -1) throw new Error("Term not found");
  mockTerms.splice(index, 1);
}

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

const ITEMS_PER_PAGE = 5;

interface FormData {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const TermTable = () => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [editTerm, setEditTerm] = useState<Term | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    isActive: false,
  });

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTerms();
      setTerms(data);
    } catch (error) {
      console.error("Error loading terms:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load terms.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering
  const filteredTerms = terms.filter((term) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      term.name.toLowerCase().includes(searchLower) ||
      term.startDate.includes(searchTerm) ||
      term.endDate.includes(searchTerm);

    const matchesStatus =
      filterStatus === "active" ? term.isActive :
      filterStatus === "inactive" ? !term.isActive :
      true;

    return matchesSearch && matchesStatus;
  });

  // Sorting
  const sortedTerms = [...filteredTerms].sort((a, b) => {
    let aVal: any = a[sortField as keyof Term];
    let bVal: any = b[sortField as keyof Term];

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

  const totalPages = Math.ceil(sortedTerms.length / ITEMS_PER_PAGE);
  const paginatedTerms = sortedTerms.slice(
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

  const openModal = (term?: Term) => {
    if (term) {
      setEditTerm(term);
      setFormData({
        name: term.name,
        startDate: term.startDate,
        endDate: term.endDate,
        isActive: term.isActive,
      });
    } else {
      setEditTerm(null);
      setFormData({
        name: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        isActive: false,
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (key: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Swal.fire({ title: "Missing", text: "Term name is required", icon: "warning" });
      return false;
    }
    if (!formData.startDate) {
      Swal.fire({ title: "Missing", text: "Start date is required", icon: "warning" });
      return false;
    }
    if (!formData.endDate) {
      Swal.fire({ title: "Missing", text: "End date is required", icon: "warning" });
      return false;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      Swal.fire({ title: "Invalid", text: "End date must be after start date", icon: "warning" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      if (editTerm) {
        await updateTerm(editTerm.id, formData);
        Swal.fire({ title: "Updated!", text: "Term updated successfully", icon: "success" });
      } else {
        await createTerm(formData as Omit<Term, 'id'>);
        Swal.fire({ title: "Created!", text: "New term added successfully", icon: "success" });
      }
      await loadTerms();
      setShowModal(false);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Operation failed" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (term: Term) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete term "${term.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSaving(true);
        try {
          await deleteTerm(term.id);
          await loadTerms();
          Swal.fire("Deleted!", "Term has been removed.", "success");
        } catch {
          Swal.fire("Error", "Could not delete term", "error");
        } finally {
          setIsSaving(false);
        }
      }
    });
  };

  const toggleActive = async (term: Term) => {
    // If setting this term active, you may want to deactivate others
    // For simplicity, we just toggle this one.
    const newStatus = !term.isActive;
    try {
      await updateTerm(term.id, { isActive: newStatus });
      await loadTerms();
      Swal.fire({
        title: "Status Updated",
        text: `${term.name} is now ${newStatus ? "Active" : "Inactive"}`,
        icon: "success",
        timer: 1500,
      });
    } catch {
      Swal.fire("Error", "Could not update status", "error");
    }
  };

  // Table headers
  const tableHeaders = [
    { key: "name", label: "Term Name" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "isActive", label: "Status" },
  ];

  // Statistics
  const totalTerms = terms.length;
  const activeTerm = terms.filter(t => t.isActive).length;
  const upcomingTerms = terms.filter(t => new Date(t.startDate) > new Date()).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Term Management</h1>
            <p className="text-gray-600 mt-1">Manage academic terms and sessions</p>
          </div>
          <button
            onClick={() => openModal()}
            className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
            disabled={isLoading}
          >
            <FaPlus /> Add Term
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search terms by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center gap-3">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))
          ) : (
            <>
              <StatCard title="Total Terms" value={totalTerms} icon={FaCalendarAlt} color="indigo" />
              <StatCard title="Active Term" value={activeTerm} icon={FaFlag} color="green" />
              <StatCard title="Upcoming Terms" value={upcomingTerms} icon={FaClock} color="purple" />
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="w-full py-20 flex flex-col items-center justify-center">
            <FaSpinner className="w-16 h-16 text-indigo-500 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Terms...</h3>
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
                  {paginatedTerms.length > 0 ? (
                    paginatedTerms.map((term) => (
                      <tr key={term.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{term.name}</td>
                        <td className="px-6 py-4 text-gray-700">{new Date(term.startDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-gray-700">{new Date(term.endDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleActive(term)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border cursor-pointer hover:opacity-90 transition-opacity ${
                              term.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"
                            }`}
                          >
                            {term.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal(term)}
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <FaEdit className="text-lg" />
                            </button>
                            <button
                              onClick={() => handleDelete(term)}
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
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FaCalendarAlt className="text-4xl text-gray-300 mb-3" />
                          <h3 className="text-lg font-medium text-gray-900">No terms found</h3>
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
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedTerms.length)} of {sortedTerms.length}
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

      {/* Term Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editTerm ? "Edit Term" : "Add New Term"}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    {editTerm ? "Update term information" : "Enter term details"}
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
              <div className="space-y-4">
                {/* Term Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                    placeholder="e.g., Fall 2025"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleFormChange("startDate", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleFormChange("endDate", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    disabled={isSaving}
                  />
                </div>

                {/* Active Status (only for edit) */}
                {editTerm && (
                  <div className="flex items-center gap-4">
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
                {editTerm && (
                  <button
                    onClick={() => handleDelete(editTerm)}
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
                    {isSaving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> {editTerm ? "Update" : "Create"}</>}
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

export default TermTable;