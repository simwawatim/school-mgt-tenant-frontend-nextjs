"use client";

import React, { useState, useEffect } from "react";
import {
  FaSave, FaTimes, FaTrash, FaPlus, FaEdit, FaSearch, FaFilter,
  FaSort, FaSortUp, FaSortDown, FaUserGraduate, FaBook, FaAward,
  FaSpinner
} from "react-icons/fa";
import Swal from "sweetalert2";

// ----------------------------------------------------------------------
// Mock Data & Types
// ----------------------------------------------------------------------

export interface Result {
  id: number;
  studentId: string;
  studentName: string;
  subject: string;
  marks: number;
  grade: string;        // e.g., "A", "B+", etc.
  term: string;         // e.g., "Fall 2025"
  isPassed: boolean;
}

// Mock students
const students = [
  { id: "S001", name: "Alice Johnson" },
  { id: "S002", name: "Bob Smith" },
  { id: "S003", name: "Charlie Brown" },
  { id: "S004", name: "Diana Prince" },
  { id: "S005", name: "Ethan Hunt" },
];

const subjects = ["Mathematics", "Physics", "Chemistry", "Biology", "Computer Science"];
const terms = ["Fall 2024", "Spring 2025", "Summer 2025", "Fall 2025"];

const mockResults: Result[] = [
  { id: 1, studentId: "S001", studentName: "Alice Johnson", subject: "Mathematics", marks: 85, grade: "A", term: "Fall 2024", isPassed: true },
  { id: 2, studentId: "S002", studentName: "Bob Smith", subject: "Physics", marks: 72, grade: "B", term: "Fall 2024", isPassed: true },
  { id: 3, studentId: "S003", studentName: "Charlie Brown", subject: "Chemistry", marks: 45, grade: "F", term: "Spring 2025", isPassed: false },
  { id: 4, studentId: "S004", studentName: "Diana Prince", subject: "Biology", marks: 91, grade: "A+", term: "Spring 2025", isPassed: true },
  { id: 5, studentId: "S005", studentName: "Ethan Hunt", subject: "Computer Science", marks: 68, grade: "C", term: "Summer 2025", isPassed: true },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchResults(): Promise<Result[]> {
  await delay(800);
  return [...mockResults];
}

export async function createResult(result: Omit<Result, 'id'>): Promise<Result> {
  await delay(600);
  const newId = Math.max(...mockResults.map(r => r.id), 0) + 1;
  const newResult = { ...result, id: newId };
  mockResults.push(newResult);
  return newResult;
}

export async function updateResult(id: number, updates: Partial<Result>): Promise<Result> {
  await delay(600);
  const index = mockResults.findIndex(r => r.id === id);
  if (index === -1) throw new Error("Result not found");
  mockResults[index] = { ...mockResults[index], ...updates };
  return mockResults[index];
}

export async function deleteResult(id: number): Promise<void> {
  await delay(500);
  const index = mockResults.findIndex(r => r.id === id);
  if (index === -1) throw new Error("Result not found");
  mockResults.splice(index, 1);
}

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

const ITEMS_PER_PAGE = 5;

interface FormData {
  studentId: string;
  studentName: string;
  subject: string;
  marks: number;
  grade: string;
  term: string;
  isPassed: boolean;
}

const ResultTable = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editResult, setEditResult] = useState<Result | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("studentName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterSubject, setFilterSubject] = useState<string>("");
  const [filterTerm, setFilterTerm] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    studentId: students[0].id,
    studentName: students[0].name,
    subject: subjects[0],
    marks: 0,
    grade: "",
    term: terms[0],
    isPassed: true,
  });

  useEffect(() => { loadResults(); }, []);

  const loadResults = async () => {
    setIsLoading(true);
    try {
      const data = await fetchResults();
      setResults(data);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load results." });
    } finally { setIsLoading(false); }
  };

  // Filtering
  const filteredResults = results.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      r.studentName.toLowerCase().includes(searchLower) ||
      r.studentId.toLowerCase().includes(searchLower) ||
      r.subject.toLowerCase().includes(searchLower) ||
      r.term.toLowerCase().includes(searchLower);
    const matchesSubject = filterSubject ? r.subject === filterSubject : true;
    const matchesTerm = filterTerm ? r.term === filterTerm : true;
    return matchesSearch && matchesSubject && matchesTerm;
  });

  // Sorting
  const sortedResults = [...filteredResults].sort((a, b) => {
    let aVal: any = a[sortField as keyof Result];
    let bVal: any = b[sortField as keyof Result];
    if (typeof aVal === 'string' && typeof bVal === 'string')
      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    if (typeof aVal === 'number' && typeof bVal === 'number')
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    return 0;
  });

  const totalPages = Math.ceil(sortedResults.length / ITEMS_PER_PAGE);
  const paginatedResults = sortedResults.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const openModal = (res?: Result) => {
    if (res) {
      setEditResult(res);
      setFormData({ ...res });
    } else {
      setEditResult(null);
      setFormData({
        studentId: students[0].id,
        studentName: students[0].name,
        subject: subjects[0],
        marks: 0,
        grade: "",
        term: terms[0],
        isPassed: true,
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (key: keyof FormData, value: any) => {
    // If studentId changes, update studentName automatically
    if (key === "studentId") {
      const student = students.find(s => s.id === value);
      setFormData(prev => ({ ...prev, studentId: value, studentName: student ? student.name : "" }));
    } else {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.studentId) {
      Swal.fire({ title: "Missing", text: "Student is required", icon: "warning" });
      return false;
    }
    if (!formData.subject) {
      Swal.fire({ title: "Missing", text: "Subject is required", icon: "warning" });
      return false;
    }
    if (formData.marks < 0 || formData.marks > 100) {
      Swal.fire({ title: "Invalid", text: "Marks must be between 0 and 100", icon: "warning" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      if (editResult) {
        await updateResult(editResult.id, formData);
        Swal.fire({ title: "Updated!", text: "Result updated successfully", icon: "success" });
      } else {
        await createResult(formData as Omit<Result, 'id'>);
        Swal.fire({ title: "Created!", text: "New result added successfully", icon: "success" });
      }
      await loadResults();
      setShowModal(false);
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Operation failed" });
    } finally { setIsSaving(false); }
  };

  const handleDelete = (res: Result) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete result for ${res.studentName} - ${res.subject}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSaving(true);
        try {
          await deleteResult(res.id);
          await loadResults();
          Swal.fire("Deleted!", "Result has been removed.", "success");
        } catch {
          Swal.fire("Error", "Could not delete result", "error");
        } finally { setIsSaving(false); }
      }
    });
  };

  const tableHeaders = [
    { key: "studentId", label: "Student ID" },
    { key: "studentName", label: "Student Name" },
    { key: "subject", label: "Subject" },
    { key: "marks", label: "Marks" },
    { key: "grade", label: "Grade" },
    { key: "term", label: "Term" },
    { key: "isPassed", label: "Passed" },
  ];

  const totalResults = results.length;
  const passCount = results.filter(r => r.isPassed).length;
  const avgMarks = results.reduce((sum, r) => sum + r.marks, 0) / (results.length || 1);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Result Management</h1>
            <p className="text-gray-600 mt-1">Manage student exam results</p>
          </div>
          <button onClick={() => openModal()} className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
            <FaPlus /> Add Result
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name, ID, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
            <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg">
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg">
              <option value="">All Terms</option>
              {terms.map(t => <option key={t} value={t}>{t}</option>)}
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
              <StatCard title="Total Results" value={totalResults} icon={FaUserGraduate} color="indigo" />
              <StatCard title="Passed" value={passCount} icon={FaAward} color="green" />
              <StatCard title="Average Marks" value={Math.round(avgMarks * 10) / 10} icon={FaBook} color="purple" />
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="w-full py-20 flex flex-col items-center"><FaSpinner className="w-16 h-16 text-indigo-500 animate-spin mb-4" /><h3>Loading Results...</h3></div>
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
                  {paginatedResults.length > 0 ? (
                    paginatedResults.map(res => (
                      <tr key={res.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm">{res.studentId}</td>
                        <td className="px-6 py-4 font-medium">{res.studentName}</td>
                        <td className="px-6 py-4">{res.subject}</td>
                        <td className="px-6 py-4">{res.marks}</td>
                        <td className="px-6 py-4">{res.grade}</td>
                        <td className="px-6 py-4">{res.term}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${res.isPassed ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}`}>
                            {res.isPassed ? "Pass" : "Fail"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => openModal(res)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><FaEdit /></button>
                            <button onClick={() => handleDelete(res)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={8} className="px-6 py-12 text-center"><FaUserGraduate className="text-4xl text-gray-300 mx-auto mb-3" /><h3>No results found</h3></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination (same as previous) */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedResults.length)} of {sortedResults.length}
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
                <h2 className="text-xl font-bold">{editResult ? "Edit Result" : "Add New Result"}</h2>
                <p className="text-gray-600 text-sm">{editResult ? "Update result information" : "Enter result details"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaTimes /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                  <select value={formData.studentId} onChange={(e) => handleFormChange("studentId", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black">
                    {students.map(s => <option key={s.id} value={s.id}>{s.id} - {s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <select value={formData.subject} onChange={(e) => handleFormChange("subject", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black">
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marks (0-100) *</label>
                  <input type="number" min="0" max="100" value={formData.marks} onChange={(e) => handleFormChange("marks", parseInt(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <input type="text" value={formData.grade} onChange={(e) => handleFormChange("grade", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" placeholder="e.g., A, B+" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                  <select value={formData.term} onChange={(e) => handleFormChange("term", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black">
                    {terms.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Passed?</span>
                  <input type="checkbox" checked={formData.isPassed} onChange={(e) => handleFormChange("isPassed", e.target.checked)} className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-xl flex justify-between items-center">
              {editResult && (
                <button onClick={() => handleDelete(editResult)} className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2">
                  <FaTrash /> Delete
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
                  {isSaving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> {editResult ? "Update" : "Create"}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const StatCard = ({ title, value, icon: Icon, color }: any) => {
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

export default ResultTable;