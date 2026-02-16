"use client";

import React, { useState, useEffect } from "react";
import {
  FaSave, FaTimes, FaTrash, FaPlus, FaEdit, FaSearch, FaFilter,
  FaSort, FaSortUp, FaSortDown, FaWallet, FaMoneyBillWave, FaSpinner
} from "react-icons/fa";
import Swal from "sweetalert2";

// ----------------------------------------------------------------------
// Mock Data & Types
// ----------------------------------------------------------------------

export interface Account {
  id: number;
  accountName: string;
  accountNumber: string;
  accountType: string;   // e.g., "Asset", "Liability", "Income", "Expense"
  balance: number;
  isActive: boolean;
}

const accountTypes = ["Asset", "Liability", "Income", "Expense", "Equity"];

const mockAccounts: Account[] = [
  { id: 1, accountName: "Cash", accountNumber: "1000", accountType: "Asset", balance: 50000, isActive: true },
  { id: 2, accountName: "Accounts Receivable", accountNumber: "1100", accountType: "Asset", balance: 15000, isActive: true },
  { id: 3, accountName: "Tuition Fees", accountNumber: "4000", accountType: "Income", balance: 0, isActive: true },
  { id: 4, accountName: "Salaries Payable", accountNumber: "2000", accountType: "Liability", balance: 8000, isActive: true },
  { id: 5, accountName: "Office Supplies", accountNumber: "5000", accountType: "Expense", balance: 1200, isActive: false },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchAccounts(): Promise<Account[]> {
  await delay(800);
  return [...mockAccounts];
}

export async function createAccount(account: Omit<Account, 'id'>): Promise<Account> {
  await delay(600);
  const newId = Math.max(...mockAccounts.map(a => a.id), 0) + 1;
  const newAccount = { ...account, id: newId };
  mockAccounts.push(newAccount);
  return newAccount;
}

export async function updateAccount(id: number, updates: Partial<Account>): Promise<Account> {
  await delay(600);
  const index = mockAccounts.findIndex(a => a.id === id);
  if (index === -1) throw new Error("Account not found");
  mockAccounts[index] = { ...mockAccounts[index], ...updates };
  return mockAccounts[index];
}

export async function deleteAccount(id: number): Promise<void> {
  await delay(500);
  const index = mockAccounts.findIndex(a => a.id === id);
  if (index === -1) throw new Error("Account not found");
  mockAccounts.splice(index, 1);
}

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------

const ITEMS_PER_PAGE = 5;

interface FormData {
  accountName: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  isActive: boolean;
}

const AccountTable = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("accountName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterType, setFilterType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    accountName: "",
    accountNumber: "",
    accountType: accountTypes[0],
    balance: 0,
    isActive: true,
  });

  useEffect(() => { loadAccounts(); }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAccounts();
      setAccounts(data);
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load accounts." });
    } finally { setIsLoading(false); }
  };

  // Filtering
  const filteredAccounts = accounts.filter(acc => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      acc.accountName.toLowerCase().includes(searchLower) ||
      acc.accountNumber.toLowerCase().includes(searchLower) ||
      acc.accountType.toLowerCase().includes(searchLower);
    const matchesType = filterType ? acc.accountType === filterType : true;
    const matchesStatus = filterStatus ? (filterStatus === "active" ? acc.isActive : !acc.isActive) : true;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Sorting
  const sortedAccounts = [...filteredAccounts].sort((a, b) => {
    let aVal: any = a[sortField as keyof Account];
    let bVal: any = b[sortField as keyof Account];
    if (typeof aVal === 'string' && typeof bVal === 'string')
      return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    if (typeof aVal === 'number' && typeof bVal === 'number')
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    return 0;
  });

  const totalPages = Math.ceil(sortedAccounts.length / ITEMS_PER_PAGE);
  const paginatedAccounts = sortedAccounts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const openModal = (acc?: Account) => {
    if (acc) {
      setEditAccount(acc);
      setFormData({ ...acc });
    } else {
      setEditAccount(null);
      setFormData({
        accountName: "",
        accountNumber: "",
        accountType: accountTypes[0],
        balance: 0,
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleFormChange = (key: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.accountName.trim()) {
      Swal.fire({ title: "Missing", text: "Account name is required", icon: "warning" });
      return false;
    }
    if (!formData.accountNumber.trim()) {
      Swal.fire({ title: "Missing", text: "Account number is required", icon: "warning" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      if (editAccount) {
        await updateAccount(editAccount.id, formData);
        Swal.fire({ title: "Updated!", text: "Account updated successfully", icon: "success" });
      } else {
        await createAccount(formData as Omit<Account, 'id'>);
        Swal.fire({ title: "Created!", text: "New account added successfully", icon: "success" });
      }
      await loadAccounts();
      setShowModal(false);
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Operation failed" });
    } finally { setIsSaving(false); }
  };

  const handleDelete = (acc: Account) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Delete account "${acc.accountName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSaving(true);
        try {
          await deleteAccount(acc.id);
          await loadAccounts();
          Swal.fire("Deleted!", "Account has been removed.", "success");
        } catch {
          Swal.fire("Error", "Could not delete account", "error");
        } finally { setIsSaving(false); }
      }
    });
  };

  const toggleStatus = async (acc: Account) => {
    try {
      await updateAccount(acc.id, { isActive: !acc.isActive });
      await loadAccounts();
      Swal.fire({
        title: "Status Updated",
        text: `${acc.accountName} is now ${!acc.isActive ? "Active" : "Inactive"}`,
        icon: "success",
        timer: 1500,
      });
    } catch {
      Swal.fire("Error", "Could not update status", "error");
    }
  };

  const tableHeaders = [
    { key: "accountName", label: "Account Name" },
    { key: "accountNumber", label: "Account #" },
    { key: "accountType", label: "Type" },
    { key: "balance", label: "Balance" },
    { key: "isActive", label: "Status" },
  ];

  const totalAccounts = accounts.length;
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const assetAccounts = accounts.filter(a => a.accountType === "Asset").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
            <p className="text-gray-600 mt-1">Manage chart of accounts</p>
          </div>
          <button onClick={() => openModal()} className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
            <FaPlus /> Add Account
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, number, type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg">
              <option value="">All Types</option>
              {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white p-4 rounded-xl shadow-sm animate-pulse"><div className="h-4 bg-gray-200 rounded w-24 mb-2"></div><div className="h-8 bg-gray-200 rounded w-16"></div></div>)
          ) : (
            <>
              <StatCard title="Total Accounts" value={totalAccounts} icon={FaWallet} color="indigo" />
              <StatCard title="Total Balance" value={`$${totalBalance.toLocaleString()}`} icon={FaMoneyBillWave} color="green" />
              <StatCard title="Asset Accounts" value={assetAccounts} icon={FaWallet} color="green" />
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="w-full py-20 flex flex-col items-center"><FaSpinner className="w-16 h-16 text-indigo-500 animate-spin mb-4" /><h3>Loading Accounts...</h3></div>
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
                  {paginatedAccounts.length > 0 ? (
                    paginatedAccounts.map(acc => (
                      <tr key={acc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-black font-medium">{acc.accountName}</td>
                        <td className="px-6 py-4 text-black font-mono text-sm">{acc.accountNumber}</td>
                        <td className="px-6 py-4 text-black">{acc.accountType}</td>
                        <td className="px-6 py-4 text-black text-right">${acc.balance.toLocaleString()}</td>
                        <td className="px-6 py-4 text-black">
                          <button onClick={() => toggleStatus(acc)} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${acc.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>
                            {acc.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-black">
                          <div className="flex gap-2">
                            <button onClick={() => openModal(acc)} className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><FaEdit /></button>
                            <button onClick={() => handleDelete(acc)} className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="px-6 py-12 text-center"><FaWallet className="text-4xl text-gray-300 mx-auto mb-3" /><h3>No accounts found</h3></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination (same as previous) */}
            {totalPages > 1 && (
              <div className="px-6 py-4 text-black border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, sortedAccounts.length)} of {sortedAccounts.length}
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
                <h2 className="text-xl font-bold">{editAccount ? "Edit Account" : "Add New Account"}</h2>
                <p className="text-gray-600 text-sm">{editAccount ? "Update account information" : "Enter account details"}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><FaTimes /></button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Name *</label>
                  <input type="text" value={formData.accountName} onChange={(e) => handleFormChange("accountName", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
                  <input type="text" value={formData.accountNumber} onChange={(e) => handleFormChange("accountNumber", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select value={formData.accountType} onChange={(e) => handleFormChange("accountType", e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black">
                    {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
                  <input type="number" value={formData.balance} onChange={(e) => handleFormChange("balance", parseFloat(e.target.value) || 0)} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-black" />
                </div>
                {editAccount && (
                  <div className="md:col-span-2 flex items-center gap-4">
                    <span className="text-sm font-medium">Status:</span>
                    <button type="button" onClick={() => handleFormChange("isActive", !formData.isActive)} className={`px-4 py-2 rounded-lg text-sm font-medium border ${formData.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}`}>
                      {formData.isActive ? "Active" : "Inactive"}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white px-6 py-4 text-black border-t border-gray-200 rounded-b-xl flex justify-between items-center">
              {editAccount && (
                <button onClick={() => handleDelete(editAccount)} className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg flex items-center gap-2">
                  <FaTrash /> Delete
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg">Cancel</button>
                <button onClick={handleSave} disabled={isSaving} className="px-5 py-2.5 bg-blue-800 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700">
                  {isSaving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> {editAccount ? "Update" : "Create"}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// StatCard component (same as previous)
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


export default AccountTable;