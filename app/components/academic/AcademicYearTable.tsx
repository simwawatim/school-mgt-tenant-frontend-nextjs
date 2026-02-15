"use client";

import React, { useState, useEffect } from "react";
import {
  FaSave, FaTimes, FaTrash, FaPlus, FaEdit, FaSearch, FaFilter,
  FaSort, FaSortUp, FaSortDown, FaSpinner, FaCalendarAlt
} from "react-icons/fa";
import Swal from "sweetalert2";
import { StatCard } from "@/components/StatCard";
import {
  AcademicYear,
  fetchAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear
} from "./mockAcademicYear";

const ITEMS_PER_PAGE = 5;

interface FormData {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const AcademicYearTable = () => {
  const [items, setItems] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<AcademicYear | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    startDate: "",
    endDate: "",
    isActive: false,
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAcademicYears();
      setItems(data);
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load academic years." });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtering
  const filteredItems = items.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchLower);
    const matchesStatus = filterStatus === "" ||
      (filterStatus === "active" ? item.isActive : !item.isActive);
    return matchesSearch && matchesStatus;
  });

  // Sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aVal = a[sortField as keyof AcademicYear];
    const bVal = b[sortField as keyof AcademicYear];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
      return sortDirection === "asc" ? (aVal ? -1 : 1) : (aVal ? 1 : -1);
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
  const paginatedItems = sortedItems.slice(
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

  const openModal = (item?: AcademicYear) => {
    if (item) {
      setEditItem(item);
      setFormData({
        name: item.name,
        startDate: item.startDate,
        endDate: item.endDate,
        isActive: item.isActive,
      });
    } else {
      setEditItem(null);
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        isActive: false,
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Swal.fire({ title: "Missing", text: "Name is required", icon: "warning" });
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
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      if (editItem) {
        await updateAcademicYear(editItem.id, formData);
        Swal.fire({ title: "Updated!", icon: "success", timer: 1500 });
      } else {
        await createAcademicYear(formData);
        Swal.fire({ title: "Created!", icon: "success", timer: 1500 });
      }
      await loadItems();
      setShowModal(false);
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Operation failed" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (item: AcademicYear) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete ${item.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteAcademicYear(item.id);
          await loadItems();
          Swal.fire("Deleted!", "", "success");
        } catch {
          Swal.fire("Error", "Could not delete", "error");
        }
      }
    });
  };

  const toggleStatus = async (item: AcademicYear) => {
    try {
      await updateAcademicYear(item.id, { isActive: !item.isActive });
      await loadItems();
    } catch {
      Swal.fire("Error", "Could not update status", "error");
    }
  };

  const tableHeaders = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "isActive", label: "Status" },
  ];

  const total = items.length;
  const active = items.filter(i => i.isActive).length;
  const inactive = total - active;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Academic Years</h1>
          </div>
          <button onClick={() => openModal()} className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2" disabled={isLoading}>
            <FaPlus /> Add Academic Year
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border rounded-lg"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white p-4 rounded-xl animate-pulse h-24" />)
          ) : (
            <>
              <StatCard title="Total" value={total} icon={FaCalendarAlt} color="indigo" />
              <StatCard title="Active" value={active} icon={FaCalendarAlt} color="green" />
              <StatCard title="Inactive" value={inactive} icon={FaCalendarAlt} color="yellow" />
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <FaSpinner className="w-16 h-16 text-indigo-500 animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders.map(header => (
                      <th key={header.key} className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase cursor-pointer hover:bg-gray-100" onClick={() => handleSort(header.key)}>
                        <div className="flex items-center gap-1">
                          {header.label}
                          {sortField === header.key ? (
                            sortDirection === "asc" ? <FaSortUp className="text-gray-500" /> : <FaSortDown className="text-gray-500" />
                          ) : <FaSort className="text-gray-400" />}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{item.id}</td>
                      <td className="px-6 py-4">{item.name}</td>
                      <td className="px-6 py-4">{item.startDate}</td>
                      <td className="px-6 py-4">{item.endDate}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(item)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            item.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => openModal(item)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <FaEdit />
                          </button>
                          <button onClick={() => handleDelete(item)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedItems.length === 0 && (
                    <tr><td colSpan={6} className="py-12 text-center">No academic years found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination (same as StudentTable) */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage-1)*ITEMS_PER_PAGE+1} to {Math.min(currentPage*ITEMS_PER_PAGE, sortedItems.length)} of {sortedItems.length}
                  </div>
                  <div className="flex gap-2">
                    <button disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Previous</button>
                    <button disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)} className="px-4 py-2 border rounded-lg disabled:opacity-50">Next</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{editItem ? "Edit" : "Add"} Academic Year</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaTimes /></button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => handleFormChange("name", e.target.value)} className="w-full border rounded-lg px-4 py-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" value={formData.startDate} onChange={(e) => handleFormChange("startDate", e.target.value)} className="w-full border rounded-lg px-4 py-2.5" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input type="date" value={formData.endDate} onChange={(e) => handleFormChange("endDate", e.target.value)} className="w-full border rounded-lg px-4 py-2.5" />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <button
                  type="button"
                  onClick={() => handleFormChange("isActive", !formData.isActive)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border ${formData.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                >
                  {formData.isActive ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex justify-between">
              {editItem && (
                <button onClick={() => handleDelete(editItem)} className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2">
                  <FaTrash /> Delete
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2">
                  {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />} {editItem ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicYearTable;