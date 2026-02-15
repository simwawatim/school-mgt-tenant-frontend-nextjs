"use client";

import React, { useState, useEffect } from "react";
import {
  FaSave, FaTimes, FaTrash, FaPlus, FaEdit, FaSearch, FaFilter,
  FaSort, FaSortUp, FaSortDown, FaExchangeAlt, FaMoneyBillWave, FaSpinner
} from "react-icons/fa";
import Swal from "sweetalert2";

// ----------------------------------------------------------------------
// Mock Data & Types
// ----------------------------------------------------------------------

export interface Transaction {
  id: number;
  date: string;           // YYYY-MM-DD
  description: string;
  accountId: number;
  accountName: string;    // denormalized for display
  amount: number;
  type: "Debit" | "Credit";
  isActive: boolean;
}

// Mock accounts (from AccountTable) – we'll reuse the same IDs
const accounts = [
  { id: 1, name: "Cash", number: "1000" },
  { id: 2, name: "Accounts Receivable", number: "1100" },
  { id: 3, name: "Tuition Fees", number: "4000" },
  { id: 4, name: "Salaries Payable", number: "2000" },
  { id: 5, name: "Office Supplies", number: "5000" },
];

const mockTransactions: Transaction[] = [
  { id: 1, date: "2025-01-15", description: "Tuition payment from student", accountId: 3, accountName: "Tuition Fees", amount: 5000, type: "Credit", isActive: true },
  { id: 2, date: "2025-01-16", description: "Paid salary", accountId: 4, accountName: "Salaries Payable", amount: 3000, type: "Debit", isActive: true },
  { id: 3, date: "2025-01-17", description: "Office supplies purchase", accountId: 5, accountName: "Office Supplies", amount: 200, type: "Debit", isActive: true },
  { id: 4, date: "2025-01-18", description: "Cash deposit", accountId: 1, accountName: "Cash", amount: 10000, type: "Debit", isActive: true },
  { id: 5, date: "2025-01-19", description: "Student fee receipt", accountId: 3, accountName: "Tuition Fees", amount: 2500, type: "Credit", isActive: false },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchTransactions(): Promise<Transaction[]> {
  await delay(800);
  return [...mockTransactions];
}

export async function createTransaction(trans: Omit<Transaction, 'id'>): Promise<Transaction> {
  await delay(600);
  const newId = Math.max(...mockTransactions.map(t => t.id), 0) + 1;
  const newTransaction = { ...trans, id: newId };
  mockTransactions.push(newTransaction);
  return newTransaction;
}

export async function updateTransaction(id: number, updates: Partial<Transaction>): Promise<Transaction> {
  await delay(600);
  const index = mockTransactions.findIndex(t => t.id === id);
  if (index === -1) throw new Error("Transaction not found");
  mockTransactions[index] = { ...mockTransactions[index], ...updates };
  return mockTransactions[index];
}

export async function deleteTransaction(id: number): Promise<void> {
  await delay(500);
  const index = mockTransactions.findIndex(t => t.id === id);
  if (index === -1) throw new Error("Transaction not found");
  mockTransactions.splice(index, 1);
}

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

const ITEMS_PER_PAGE = 5;

interface FormData {
  date: string;
  description: string;
  accountId: number;
  accountName: string;
  amount: number;
  type: "Debit" | "Credit";
  isActive: boolean;
}

const TransactionTable = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc"); // newest first
  const [filterAccount, setFilterAccount] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    description: "",
    accountId: accounts[0].id,
    accountName: accounts[0].name,
    amount: 0,
    type: "Debit",
    isActive: true,
  });

  useEffect(() => { loadTransactions(); }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load transactions." });
    } finally { setIsLoading(false); }
  };

  // Filtering
  const filteredTransactions = transactions.filter(t => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      t.description.toLowerCase().includes(searchLower) ||
      t.accountName.toLowerCase().includes(searchLower);
    const matchesAccount = filterAccount ? t.accountName.includes(filterAccount) : true;
    const matchesType = filterType ? t.type === filterType : true;
    return matchesSearch && matchesAccount && matchesType;
  });

  // Sorting
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let aVal: any = a[sortField as keyof Transaction];
    let bVal: any = b[sortField as keyof Transaction];
    if (typeof aVal === 'string' && typeof bVal === 'string')
      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    if (typeof aVal === 'number' && typeof bVal === 'number')
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    return 0;
  });

  const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = sortedTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const openModal = (trans?: Transaction) => {
    if (trans) {
      setEditTransaction(trans);
      setFormData({ ...trans });
    } else {
      setEditTransaction(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: "",
        accountId: accounts[0].id,
        accountName: accounts[0].name,
        amount: 0,
        type: "Debit",
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (key: keyof FormData, value: any) => {
    if (key === "accountId") {
      const acc = accounts.find(a => a.id === value);
      setFormData(prev => ({ ...prev, accountId: value, accountName: acc ? acc.name : "" }));
    } else {
      setFormData(prev => ({ ...prev, [key]: value }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.description.trim()) {
      Swal.fire({ title: "Missing", text: "Description is required", icon: "warning" });
      return false;
    }
    if (formData.amount <= 0) {
      Swal.fire({ title: "Invalid", text: "Amount must be greater than zero", icon: "warning" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      if (editTransaction) {
        await updateTransaction(editTransaction.id, formData);
        Swal.fire({ title: "Updated!", text: "Transaction updated successfully", icon: "success" });
      } else {
        await createTransaction(formData as Omit<Transaction, 'id'>);
        Swal.fire({ title: "Created!", text: "New transaction added successfully", icon: "success" });
      }
      await loadTransactions();
      setShowModal(false);
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Operation failed" });
    } finally { setIsSaving(false); }
  };

  const handleDelete = (trans: Transaction) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete transaction "${trans.description}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSaving(true);
        try {
          await deleteTransaction(trans.id);
          await loadTransactions();
          Swal.fire("Deleted!", "Transaction has been removed.", "success");
        } catch {
          Swal.fire("Error", "Could not delete transaction", "error");
        } finally { setIsSaving(false); }
      }
    });
  };

  const tableHeaders = [
    { key: "date", label: "Date" },
    { key: "description", label: "Description" },
    { key: "accountName", label: "Account" },
    { key: "amount", label: "Amount" },
    { key: "type", label: "Type" },
    { key: "isActive", label: "Status" },
  ];

  const totalTransactions = transactions.length;
  const totalDebits = transactions.filter(t => t.type === "Debit").reduce((sum, t) => sum + t.amount, 0);
  const totalCredits = transactions.filter(t => t.type === "Credit").reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction Management</h1>
            <p className="text-gray-600 mt-1">Record and manage financial transactions</p>
          </div>
          <button onClick={() => openModal()} className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
            <FaPlus /> Add Transaction
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by description, account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
            <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg">
              <option value="">All Accounts</option>
              {accounts.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg">
              <option value="">All Types</option>
              <option value="Debit">Debit</option>
              <option value="Credit">Credit</option>
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
              <StatCard title="Total Transactions" value={totalTransactions} icon={FaExchangeAlt} color="indigo" />
              <StatCard title="Total Debits" value={`$${totalDebits.toLocaleString()}`} icon={FaMoneyBillWave} color="green" />
              <StatCard title="Total Credits" value={`$${totalCredits.toLocaleString()}`} icon={FaMoneyBillWave} color="purple" />
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="w-full py-20 flex flex-col items-center"><FaSpinner className="w-16 h-16 text-indigo-500 animate-spin mb-4" /><h3>Loading Transactions...</h3></div>
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
                  {paginatedTransactions.length > 0 ? (
                    paginatedTransactions.map(trans => (
                      <tr key={trans.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{new Date(trans.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{trans.description}</td>
                        <td className="px-6 py-4">{trans.accountName}</td>
                        <td className="px-6 py-4 text-right">${trans.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${trans.type === "Debit" ? "bg-red-100 text-red-800 border-red-200" : "bg-green-100 text-green-800 border-green-200"}`}>
                            {trans.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => {}} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${trans.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>
                            {trans.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => openModal(trans)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><FaEdit /></button>
                            <button onClick={() => handleDelete(trans)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={7} className="px-6 py-12 text-center"><FaExchangeAlt className="text-4xl text-gray-300 mx-auto mb-3" /><h3>No transactions found</h3></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedTransactions.length)} of {sortedTransactions.length}
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
                <h2 className="text-xl font-bold">{editTransaction ? "Edit Transaction" : "Add New Transaction"}</h2>
                <p className="text-gray-600 text-sm">{editTransaction ? "Update transaction information" : "Enter transaction details"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaTimes /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={formData.date} onChange={(e) => handleFormChange("date", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                  <select value={formData.accountId} onChange={(e) => handleFormChange("accountId", parseInt(e.target.value))} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black">
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input type="text" value={formData.description} onChange={(e) => handleFormChange("description", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input type="number" min="0.01" step="0.01" value={formData.amount} onChange={(e) => handleFormChange("amount", parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={formData.type} onChange={(e) => handleFormChange("type", e.target.value as "Debit" | "Credit")} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black">
                    <option value="Debit">Debit</option>
                    <option value="Credit">Credit</option>
                  </select>
                </div>
                {editTransaction && (
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
              {editTransaction && (
                <button onClick={() => handleDelete(editTransaction)} className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2">
                  <FaTrash /> Delete
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
                  {isSaving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> {editTransaction ? "Update" : "Create"}</>}
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

export default TransactionTable;