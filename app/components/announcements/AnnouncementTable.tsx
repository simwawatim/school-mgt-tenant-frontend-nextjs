"use client";

import React, { useState, useEffect } from "react";
import {
  FaSave, FaTimes, FaTrash, FaPlus, FaEdit, FaSearch, FaFilter,
  FaSort, FaSortUp, FaSortDown, FaBullhorn, FaUsers, FaSpinner
} from "react-icons/fa";
import Swal from "sweetalert2";

// ----------------------------------------------------------------------
// Mock Data & Types
// ----------------------------------------------------------------------

export interface Announcement {
  id: number;
  title: string;
  content: string;
  target: string;        // e.g., "All", "Students", "Teachers", "Parents"
  date: string;           // YYYY-MM-DD
  isActive: boolean;
}

const targets = ["All", "Students", "Teachers", "Parents", "Staff"];

const mockAnnouncements: Announcement[] = [
  { id: 1, title: "School Holiday", content: "School will be closed on Friday for staff training.", target: "All", date: "2025-02-10", isActive: true },
  { id: 2, title: "Parent-Teacher Meeting", content: "Parent-teacher meetings scheduled for next week.", target: "Parents", date: "2025-02-12", isActive: true },
  { id: 3, title: "Exam Schedule", content: "Final exam schedule has been published.", target: "Students", date: "2025-02-15", isActive: true },
  { id: 4, title: "New Library Hours", content: "Library will now open at 8 AM.", target: "All", date: "2025-02-05", isActive: false },
  { id: 5, title: "Sports Day", content: "Annual sports day registration open.", target: "Students", date: "2025-02-20", isActive: true },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchAnnouncements(): Promise<Announcement[]> {
  await delay(800);
  return [...mockAnnouncements];
}

export async function createAnnouncement(ann: Omit<Announcement, 'id'>): Promise<Announcement> {
  await delay(600);
  const newId = Math.max(...mockAnnouncements.map(a => a.id), 0) + 1;
  const newAnn = { ...ann, id: newId };
  mockAnnouncements.push(newAnn);
  return newAnn;
}

export async function updateAnnouncement(id: number, updates: Partial<Announcement>): Promise<Announcement> {
  await delay(600);
  const index = mockAnnouncements.findIndex(a => a.id === id);
  if (index === -1) throw new Error("Announcement not found");
  mockAnnouncements[index] = { ...mockAnnouncements[index], ...updates };
  return mockAnnouncements[index];
}

export async function deleteAnnouncement(id: number): Promise<void> {
  await delay(500);
  const index = mockAnnouncements.findIndex(a => a.id === id);
  if (index === -1) throw new Error("Announcement not found");
  mockAnnouncements.splice(index, 1);
}

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

const ITEMS_PER_PAGE = 5;

interface FormData {
  title: string;
  content: string;
  target: string;
  date: string;
  isActive: boolean;
}

const AnnouncementTable = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterTarget, setFilterTarget] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
    target: targets[0],
    date: new Date().toISOString().split('T')[0],
    isActive: true,
  });

  useEffect(() => { loadAnnouncements(); }, []);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load announcements." });
    } finally { setIsLoading(false); }
  };

  // Filtering
  const filteredAnnouncements = announcements.filter(ann => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      ann.title.toLowerCase().includes(searchLower) ||
      ann.content.toLowerCase().includes(searchLower);
    const matchesTarget = filterTarget ? ann.target === filterTarget : true;
    const matchesStatus = filterStatus ? (filterStatus === "active" ? ann.isActive : !ann.isActive) : true;
    return matchesSearch && matchesTarget && matchesStatus;
  });

  // Sorting
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    let aVal: any = a[sortField as keyof Announcement];
    let bVal: any = b[sortField as keyof Announcement];
    if (typeof aVal === 'string' && typeof bVal === 'string')
      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    return 0;
  });

  const totalPages = Math.ceil(sortedAnnouncements.length / ITEMS_PER_PAGE);
  const paginatedAnnouncements = sortedAnnouncements.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const openModal = (ann?: Announcement) => {
    if (ann) {
      setEditAnnouncement(ann);
      setFormData({ ...ann });
    } else {
      setEditAnnouncement(null);
      setFormData({
        title: "",
        content: "",
        target: targets[0],
        date: new Date().toISOString().split('T')[0],
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      Swal.fire({ title: "Missing", text: "Title is required", icon: "warning" });
      return false;
    }
    if (!formData.content.trim()) {
      Swal.fire({ title: "Missing", text: "Content is required", icon: "warning" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      if (editAnnouncement) {
        await updateAnnouncement(editAnnouncement.id, formData);
        Swal.fire({ title: "Updated!", text: "Announcement updated successfully", icon: "success" });
      } else {
        await createAnnouncement(formData as Omit<Announcement, 'id'>);
        Swal.fire({ title: "Created!", text: "New announcement added successfully", icon: "success" });
      }
      await loadAnnouncements();
      setShowModal(false);
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Operation failed" });
    } finally { setIsSaving(false); }
  };

  const handleDelete = (ann: Announcement) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete announcement "${ann.title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSaving(true);
        try {
          await deleteAnnouncement(ann.id);
          await loadAnnouncements();
          Swal.fire("Deleted!", "Announcement has been removed.", "success");
        } catch {
          Swal.fire("Error", "Could not delete announcement", "error");
        } finally { setIsSaving(false); }
      }
    });
  };

  const toggleStatus = async (ann: Announcement) => {
    try {
      await updateAnnouncement(ann.id, { isActive: !ann.isActive });
      await loadAnnouncements();
      Swal.fire({
        title: "Status Updated",
        text: `${ann.title} is now ${!ann.isActive ? "Active" : "Inactive"}`,
        icon: "success",
        timer: 1500,
      });
    } catch {
      Swal.fire("Error", "Could not update status", "error");
    }
  };

  const tableHeaders = [
    { key: "title", label: "Title" },
    { key: "target", label: "Target" },
    { key: "date", label: "Date" },
    { key: "isActive", label: "Status" },
  ];

  const totalAnnouncements = announcements.length;
  const activeAnnouncements = announcements.filter(a => a.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Announcement Management</h1>
            <p className="text-gray-600 mt-1">Post and manage school announcements</p>
          </div>
          <button onClick={() => openModal()} className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
            <FaPlus /> Add Announcement
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
            <select value={filterTarget} onChange={(e) => setFilterTarget(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg">
              <option value="">All Targets</option>
              {targets.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => <div key={i} className="bg-white p-4 rounded-xl shadow-sm animate-pulse"><div className="h-4 bg-gray-200 rounded w-24 mb-2"></div><div className="h-8 bg-gray-200 rounded w-16"></div></div>)
          ) : (
            <>
              <StatCard title="Total Announcements" value={totalAnnouncements} icon={FaBullhorn} color="indigo" />
              <StatCard title="Active Announcements" value={activeAnnouncements} icon={FaUsers} color="green" />
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="w-full py-20 flex flex-col items-center"><FaSpinner className="w-16 h-16 text-indigo-500 animate-spin mb-4" /><h3>Loading Announcements...</h3></div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders.map(header => (
                      <th key={header.key} className="px-6 py-4 text-black text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort(header.key)}>
                        <div className="flex items-center gap-1">
                          {header.label}
                          {sortField === header.key ? (sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />) : <FaSort className="text-gray-400" />}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-black text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedAnnouncements.length > 0 ? (
                    paginatedAnnouncements.map(ann => (
                      <tr key={ann.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-black font-medium">{ann.title}</td>
                        <td className="px-6 py-4 text-black">{ann.target}</td>
                        <td className="px-6 py-4 text-black">{new Date(ann.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-black">
                          <button onClick={() => toggleStatus(ann)} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${ann.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>
                            {ann.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-black">
                          <div className="flex gap-2">
                            <button onClick={() => openModal(ann)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><FaEdit /></button>
                            <button onClick={() => handleDelete(ann)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="px-6 py-12 text-center"><FaBullhorn className="text-4xl text-gray-300 mx-auto mb-3" /><h3>No announcements found</h3></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 text-black border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedAnnouncements.length)} of {sortedAnnouncements.length}
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
            <div className="sticky top-0 bg-white px-6 py-4 text-black border-b border-gray-200 rounded-t-xl flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">{editAnnouncement ? "Edit Announcement" : "Add New Announcement"}</h2>
                <p className="text-gray-600 text-sm">{editAnnouncement ? "Update announcement information" : "Enter announcement details"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaTimes /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => handleFormChange("title", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                  <textarea rows={4} value={formData.content} onChange={(e) => handleFormChange("content", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <select value={formData.target} onChange={(e) => handleFormChange("target", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black">
                      {targets.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" value={formData.date} onChange={(e) => handleFormChange("date", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" />
                  </div>
                </div>
                {editAnnouncement && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Status:</span>
                    <button type="button" onClick={() => handleFormChange("isActive", !formData.isActive)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${formData.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>
                      {formData.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 text-black border-t border-gray-200 rounded-b-xl flex justify-between items-center">
              {editAnnouncement && (
                <button onClick={() => handleDelete(editAnnouncement)} className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2">
                  <FaTrash /> Delete
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
                  {isSaving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> {editAnnouncement ? "Update" : "Create"}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// StatCard (same as before)
type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: "indigo" | "green";
};

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => {
  const colorClasses =
    {
      indigo: "bg-indigo-50 text-indigo-600",
      green: "bg-green-50 text-green-600",
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


export default AnnouncementTable;