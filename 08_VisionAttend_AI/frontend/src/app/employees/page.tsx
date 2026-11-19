"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Camera,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  Sparkles,
  Building2,
  Mail,
  ShieldCheck
} from "lucide-react";
import { api } from "../../lib/api";
import { Employee } from "../../lib/types";
import { EmployeeEnrollModal } from "../../components/EmployeeEnrollModal";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");

  // Add Employee Form State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCode, setNewCode] = useState<string>("");
  const [newName, setNewName] = useState<string>("");
  const [newEmail, setNewEmail] = useState<string>("");
  const [newDept, setNewDept] = useState<string>("Engineering");
  const [newRole, setNewRole] = useState<string>("Software Engineer");
  const [creating, setCreating] = useState<boolean>(false);

  // Enrollment Modal State
  const [enrollTarget, setEnrollTarget] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await api.getEmployees(true);
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName || !newEmail) return;
    setCreating(true);

    try {
      const created = await api.createEmployee({
        employee_code: newCode,
        full_name: newName,
        email: newEmail,
        department: newDept,
        role: newRole,
        is_active: true,
      });
      setShowAddModal(false);
      setNewCode("");
      setNewName("");
      setNewEmail("");
      await fetchEmployees();
      // Prompt immediate face enrollment
      setEnrollTarget(created);
    } catch (err: any) {
      alert("Error creating employee: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEmployee = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? All attendance records will be removed.`)) return;
    try {
      await api.deleteEmployee(id);
      fetchEmployees();
    } catch (err: any) {
      alert("Failed to delete employee: " + err.message);
    }
  };

  const departments = ["ALL", "Engineering", "Product", "Design", "Operations", "HR"];

  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDept === "ALL" || emp.department === selectedDept;
    const matchesSearch =
      emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
      emp.employee_code.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-400" />
            Personnel Directory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage employee identities, roles, and 512-D multi-shot facial centroids
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add Personnel
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDept === dept
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-[#141d33] text-slate-400 hover:text-white border border-[#23314d]"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, code, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-[#141d33] border border-[#23314d] text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Personnel Table */}
      <div className="saas-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141d33]/60 text-slate-400 uppercase font-semibold border-b border-[#1e293b]">
              <tr>
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Code</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Biometrics</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-[#131d33]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-950 to-slate-800 border border-[#23314d] flex items-center justify-center font-bold text-indigo-400 text-xs shrink-0 overflow-hidden">
                          {emp.avatar_path ? (
                            <img
                              src={`http://localhost:8001${emp.avatar_path}`}
                              alt={emp.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            emp.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{emp.full_name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{emp.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono font-semibold text-slate-300">
                      {emp.employee_code}
                    </td>

                    <td className="px-6 py-4 text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        {emp.department}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">{emp.role}</td>

                    <td className="px-6 py-4">
                      {emp.has_enrolled_face ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled (512-D)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <AlertCircle className="w-3.5 h-3.5" /> Missing Biometrics
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEnrollTarget(emp)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-400 border border-indigo-500/30 flex items-center gap-1.5 transition-colors"
                          title="Capture Multi-Pose Biometrics"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {emp.has_enrolled_face ? "Update Face" : "Enroll Face"}
                        </button>

                        <button
                          onClick={() => handleDeleteEmployee(emp.id, emp.full_name)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No personnel found matching the query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f172a] border border-[#1e293b] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-400" /> Add New Personnel
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Employee Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMP-1007"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-[#141d33] border border-[#23314d] text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Hayes"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141d33] border border-[#23314d] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="jordan.hayes@visionattend.ai"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#141d33] border border-[#23314d] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141d33] border border-[#23314d] text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Job Title / Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Engineer"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141d33] border border-[#23314d] text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Save Personnel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guided 3-Shot Enrollment Modal */}
      {enrollTarget && (
        <EmployeeEnrollModal
          employee={enrollTarget}
          isOpen={!!enrollTarget}
          onClose={() => setEnrollTarget(null)}
          onSuccess={fetchEmployees}
        />
      )}
    </div>
  );
}
