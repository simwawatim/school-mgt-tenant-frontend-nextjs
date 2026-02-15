"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Lock, Mail, LogIn, Building } from "lucide-react";

const MOCK_TENANT_ID = "bongo-school-123";

const MOCK_COMPANY = {
  id: MOCK_TENANT_ID,
  name: "Bongo School",
  schema_name: "bongo_school",
  paid_until: "2025-12-31",
  on_trial: false,
  zra_tpin: "1234567890",
  business_name: "Bongo School",
  business_address: "123 Education St, City",
  contact_email: "info@bongo.school",
  contact_phone: "+260 123 456789",
  logo: "/bongo-school-logo.png", 
  primary_color: "#2B6EB0", 
  secondary_color: "#F4A261", 
  status: "active",
};


const mockLogin = async (email: string, password: string) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Optional: accept any credentials, or check for specific ones
  if (!email || !password) {
    throw new Error("Email and password required");
  }

  // You can add simple validation, e.g.:
  // if (email === "demo@bongo.school" && password === "password") { ... }

  // Return a mock successful response
  return {
    data: {
      access: "mock-access-token-12345",
      refresh: "mock-refresh-token-67890",
      user: {
        email: email,
        name: "Demo User",
        role: "admin",
      },
      tenant: {
        id: MOCK_TENANT_ID,
        name: MOCK_COMPANY.business_name,
      },
    },
  };
};

// Mock function to fetch company details
const mockFetchCompany = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  if (id === MOCK_TENANT_ID) {
    return {
      status: "success",
      message: "Company found",
      data: MOCK_COMPANY,
    };
  } else {
    // In this mock, we always return the same company because the tenant ID is fixed.
    // But you could simulate an error if needed.
    return {
      status: "error",
      message: "Company not found",
      data: null,
    };
  }
};

// --- Component ---
const LoginPage = () => {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    // Automatically "fetch" company details for Bongo School
    const loadCompany = async () => {
      setLoadingCompany(true);
      try {
        const response = await mockFetchCompany(MOCK_TENANT_ID);
        if (response.status === "success" && response.data) {
          setCompanyDetails(response.data);
        } else {
          // Fallback to hardcoded data if mock fails (shouldn't happen here)
          setCompanyDetails(MOCK_COMPANY);
        }
      } catch (error) {
        console.error("Mock fetch failed, using fallback", error);
        setCompanyDetails(MOCK_COMPANY);
      } finally {
        setLoadingCompany(false);
      }
    };
    loadCompany();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire("Missing fields", "Email and password are required", "warning");
      return;
    }

    setLoading(true);
    try {
      // Call mock login
      const response = await mockLogin(email, password);

      // Store mock tokens and user info
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      localStorage.setItem("userEmail", response.data.user.email);
      localStorage.setItem("tenantId", response.data.tenant.id);
      localStorage.setItem("tenantName", response.data.tenant.name);
      localStorage.setItem("companyName", companyDetails?.business_name || response.data.tenant.name);

      // Show success message (optional)
      Swal.fire({
        icon: "success",
        title: "Logged in!",
        text: "Redirecting to dashboard...",
        timer: 1500,
        showConfirmButton: false,
      });


      setTimeout(() => {
        router.push("/dashboard"); 
      }, 1000);
    } catch (err: any) {
      console.error("Login error:", err);
      Swal.fire("Login Failed", err.message || "Invalid credentials", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !companyDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const siteName = companyDetails.business_name;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <div className="w-full bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {companyDetails.logo ? (
              <img
                src={companyDetails.logo}
                alt={siteName}
                className="w-10 h-10 rounded-lg object-contain"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: companyDetails.primary_color }}
              >
                <Building className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{siteName}</h1>
            </div>
          </div>
          {/* Optional: remove or keep as dummy */}
          <a
            href="/register"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Register Company
          </a>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full flex items-center justify-center py-12">
        <div className="w-full max-w-md bg-white rounded-xl border shadow-sm p-8">
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: companyDetails.primary_color }}
            >
              {companyDetails.logo ? (
                <img
                  src={companyDetails.logo}
                  alt={siteName}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Lock className="w-8 h-8 text-white" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Sign In To {siteName}
            </h2>
            <p className="text-gray-600 mt-2">Use any credentials to login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ backgroundColor: companyDetails.secondary_color }}
              className="w-full py-3.5 hover:opacity-90 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;