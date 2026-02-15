"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Building2, ArrowLeft } from "lucide-react";

const mockRegisterCompany = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (!data.business_name || !data.contact_email) {
    throw new Error("Business name and email are required");
  }

  return {
    id: "bongo-school-123",
    name: data.business_name,
    business_name: data.business_name,
    contact_email: data.contact_email,
  };
};

const SchoolRegister = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: "",
    contact_email: "",
    contact_phone: "",
    business_address: "",
    primary_color: "#2B6EB0",     
    secondary_color: "#F4A261",    
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateFields = () => {
    if (!formData.business_name.trim()) return "Business name is required";
    if (!formData.contact_email.trim()) return "Contact email is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.contact_email)) return "Invalid email format";
    if (!formData.contact_phone.trim()) return "Phone number is required";
    if (!formData.business_address.trim()) return "Business address is required";
    return null;
  };

  const handleSubmit = async () => {
    const error = validateFields();
    if (error) {
      Swal.fire("Validation Error", error, "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await mockRegisterCompany(formData);

      Swal.fire({
        title: "Registration Successful",
        text: `${response.business_name} has been registered!`,
        icon: "success",
        confirmButtonText: "Go to Login",
      }).then(() => {
        localStorage.setItem("mockCompany", JSON.stringify(response));
        router.push("/"); 
      });
    } catch (err: any) {
      Swal.fire("Registration Failed", err.message || "Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: formData.primary_color }}
            >
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bongo School</h1>
              <p className="text-sm text-gray-500">Register your school</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Login</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="w-full max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border shadow-sm p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Register Bongo School</h2>
          <p className="text-gray-600">Enter basic school details </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">School/Business Name *</label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="e.g., Bongo School"
                className="w-full text-black px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email *</label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
                placeholder="admin@bongo.school"
                className="w-full text-black px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Phone *</label>
              <input
                type="tel"
                name="contact_phone"
                value={formData.contact_phone}
                onChange={handleChange}
                placeholder="+260 123 456789"
                className="w-full text-black px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Business Address *</label>
              <textarea
                name="business_address"
                value={formData.business_address}
                onChange={handleChange}
                placeholder="123 Education St, City"
                rows={3}
                className="w-full text-black px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>

            {/* Branding Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Primary Color</label>
                <input
                  type="color"
                  name="primary_color"
                  value={formData.primary_color}
                  onChange={handleChange}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Secondary Color</label>
                <input
                  type="color"
                  name="secondary_color"
                  value={formData.secondary_color}
                  onChange={handleChange}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <button
              onClick={() => router.push("/bongo-school/login")}
              className="px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{ backgroundColor: formData.secondary_color }}
              className="px-6 py-3 text-white font-medium rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Register School"}
            </button>
          </div>

          <p className="text-xs text-center text-gray-400 mt-4">
            This is a mock registration – no data is saved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SchoolRegister;