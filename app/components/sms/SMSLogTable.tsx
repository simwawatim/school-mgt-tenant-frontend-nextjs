"use client";

import React, { useState, useEffect } from "react";
import {
  FaSave, FaTimes, FaTrash, FaPlus, FaEdit, FaSearch, FaFilter,
  FaSort, FaSortUp, FaSortDown, FaSms, FaCheckCircle, FaTimesCircle,
  FaSpinner
} from "react-icons/fa";
import Swal from "sweetalert2";

// ----------------------------------------------------------------------
// Mock Data & Types
// ----------------------------------------------------------------------

export interface SMSLog {
  id: number;
  recipient: string;      // phone number
  message: string;
  status: "Sent" | "Failed" | "Pending";
  sentAt: string;         // ISO datetime
  isActive: boolean;
}

const mockSMSLogs: SMSLog[] = [
  { id: 1, recipient: "+1234567890", message: "Your child was marked absent today.", status: "Sent", sentAt: "2025-02-10T09:30:00", isActive: true },
  { id: 2, recipient: "+1987654321", message: "Parent-teacher meeting tomorrow at 4 PM.", status: "Sent", sentAt: "2025-02-11T14:15:00", isActive: true },
  { id: 3, recipient: "+1122334455", message: "Exam schedule published.", status: "Failed", sentAt: "2025-02-12T08:00:00", isActive: true },
  { id: 4, recipient: "+1555666777", message: "School closed on Friday.", status: "Pending", sentAt: "2025-02-13T10:45:00", isActive: true },
  { id: 5, recipient: "+1444333222", message: "Fee payment deadline approaching.", status: "Sent", sentAt: "2025-02-09T16:20:00", isActive: false },
];

const statuses = ["Sent", "Failed", "Pending"];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchSMSLogs(): Promise<SMSLog[]> {
  await delay(800);
  return [...mockSMSLogs];
}

export async function createSMSLog(log: Omit<SMSLog, 'id'>): Promise<SMSLog> {
  await delay(600);
  const newId = Math.max(...mockSMSLogs.map(l => l.id), 0) + 1;
  const newLog = { ...log, id: newId };
  mockSMSLogs.push(newLog);
  return newLog;
}

export async function updateSMSLog(id: number, updates: Partial<SMSLog>): Promise<SMSLog> {
  await delay(600);
  const index = mockSMSLogs.findIndex(l => l.id === id);
  if (index === -1) throw new Error("SMS Log not found");
  mockSMSLogs[index] = { ...mockSMSLogs[index], ...updates };
  return mockSMSLogs[index];
}

export async function deleteSMSLog(id: number): Promise<void> {
  await delay(500);
  const index = mockSMSLogs.findIndex(l => l.id === id);
  if (index === -1) throw new Error("SMS Log not found");
  mockSMSLogs.splice(index, 1);
}

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

const ITEMS_PER_PAGE = 5;

interface FormData {
  recipient: string;
  message: string;
  status: "Sent" | "Failed" | "Pending";
  sentAt: string;
  isActive: boolean;
}

const SMSLogTable = () => {
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editLog, setEditLog] = useState<SMSLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("sentAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    recipient: "",
    message: "",
    status: "Sent",
    sentAt: new Date().toISOString().slice(0, 16), // datetime-local format
    isActive: true,
  });

  useEffect(() => { loadLogs(); }, []);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSMSLogs();
      setLogs(data);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load SMS logs." });
    } finally { setIsLoading(false); }
  };

  // Filtering
  const filteredLogs = logs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      log.recipient.includes(searchTerm) ||
      log.message.toLowerCase().includes(searchLower);
    const matchesStatus = filterStatus ? log.status === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  // Sorting
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let aVal: any = a[sortField as keyof SMSLog];
    let bVal: any = b[sortField as keyof SMSLog];
    if (typeof aVal === 'string' && typeof bVal === 'string')
      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    return 0;
  });

  const totalPages = Math.ceil(sortedLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = sortedLogs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const openModal = (log?: SMSLog) => {
    if (log) {
      setEditLog(log);
      setFormData({ ...log, sentAt: log.sentAt.slice(0, 16) });
    } else {
      setEditLog(null);
      setFormData({
        recipient: "",
        message: "",
        status: "Sent",
        sentAt: new Date().toISOString().slice(0, 16),
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.recipient.trim()) {
      Swal.fire({ title: "Missing", text: "Recipient phone number is required", icon: "warning" });
      return false;
    }
    if (!formData.message.trim()) {
      Swal.fire({ title: "Missing", text: "Message is required", icon: "warning" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      // Convert datetime-local to ISO string
      const dataToSave = {
        ...formData,
        sentAt: new Date(formData.sentAt).toISOString(),
      };
      if (editLog) {
        await updateSMSLog(editLog.id, dataToSave);
        Swal.fire({ title: "Updated!", text: "SMS log updated successfully", icon: "success" });
      } else {
        await createSMSLog(dataToSave as Omit<SMSLog, 'id'>);
        Swal.fire({ title: "Created!", text: "New SMS log added successfully", icon: "success" });
      }
      await loadLogs();
      setShowModal(false);
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Operation failed" });
    } finally { setIsSaving(false); }
  };

  const handleDelete = (log: SMSLog) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete SMS log to ${log.recipient}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSaving(true);
        try {
          await deleteSMSLog(log.id);
          await loadLogs();
          Swal.fire("Deleted!", "SMS log has been removed.", "success");
        } catch {
          Swal.fire("Error", "Could not delete SMS log", "error");
        } finally { setIsSaving(false); }
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Sent": return <FaCheckCircle className="text-green-500" />;
      case "Failed": return <FaTimesCircle className="text-red-500" />;
      default: return <FaSpinner className="text-yellow-500 animate-spin" />;
    }
  };

  const tableHeaders = [
    { key: "recipient", label: "Recipient" },
    { key: "message", label: "Message" },
    { key: "status", label: "Status" },
    { key: "sentAt", label: "Sent At" },
    { key: "isActive", label: "Active" },
  ];

  const totalLogs = logs.length;
  const sentCount = logs.filter(l => l.status === "Sent").length;
  const failedCount = logs.filter(l => l.status === "Failed").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SMS Log Management</h1>
            <p className="text-gray-600 mt-1">Track all sent SMS messages</p>
          </div>
          <button onClick={() => openModal()} className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
            <FaPlus /> Add SMS Log
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by recipient or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg">
              <option value="">All Status</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
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
              <StatCard title="Total SMS" value={totalLogs} icon={FaSms} color="indigo" />
              <StatCard title="Sent" value={sentCount} icon={FaCheckCircle} color="green" />
              <StatCard title="Failed" value={failedCount} icon={FaTimesCircle} color="red" />
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="w-full py-20 flex flex-col items-center"><FaSpinner className="w-16 h-16 text-indigo-500 animate-spin mb-4" /><h3>Loading SMS Logs...</h3></div>
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
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm">{log.recipient}</td>
                        <td className="px-6 py-4 max-w-xs truncate">{log.message}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span>{log.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{new Date(log.sentAt).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${log.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>
                            {log.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => openModal(log)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><FaEdit /></button>
                            <button onClick={() => handleDelete(log)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="px-6 py-12 text-center"><FaSms className="text-4xl text-gray-300 mx-auto mb-3" /><h3>No SMS logs found</h3></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedLogs.length)} of {sortedLogs.length}
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
                <h2 className="text-xl font-bold">{editLog ? "Edit SMS Log" : "Add New SMS Log"}</h2>
                <p className="text-gray-600 text-sm">{editLog ? "Update SMS log entry" : "Enter SMS log details"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaTimes /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Phone *</label>
                  <input type="text" value={formData.recipient} onChange={(e) => handleFormChange("recipient", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" placeholder="+1234567890" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea rows={3} value={formData.message} onChange={(e) => handleFormChange("message", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black"></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={formData.status} onChange={(e) => handleFormChange("status", e.target.value as any)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black">
                      {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sent At</label>
                    <input type="datetime-local" value={formData.sentAt} onChange={(e) => handleFormChange("sentAt", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" />
                  </div>
                </div>
                {editLog && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Active:</span>
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => handleFormChange("isActive", e.target.checked)} className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-xl flex justify-between items-center">
              {editLog && (
                <button onClick={() => handleDelete(editLog)} className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2">
                  <FaTrash /> Delete
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
                  {isSaving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> {editLog ? "Update" : "Create"}</>}
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
const StatCard = ({ title, value, icon: Icon, color }: any) => {
  const colorClasses = {
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
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

export default SMSLogTable;