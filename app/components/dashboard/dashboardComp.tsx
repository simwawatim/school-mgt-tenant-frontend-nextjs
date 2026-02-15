"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Calendar,
  BarChart3,
  GraduationCap,
  UserCheck,
  Heart,
  UserCog,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Loading from "../loading/loading";


export interface MonthlyEnrollment {
  month: number; 
  count: number;
}

export interface SchoolDashboardStats {
  total_students: number;
  total_teachers: number;
  total_parents: number;
  total_admins: number;
  monthly_enrollment: MonthlyEnrollment[];
}

const generateMockMonthlyEnrollment = (): MonthlyEnrollment[] => {
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  let count = 1000; 
  return months.map((month) => {
    count += Math.floor(Math.random() * 30) + 10; 
    return { month, count };
  });
};

const mockDashboardStats: SchoolDashboardStats = {
  total_students: 1250,
  total_teachers: 85,
  total_parents: 980,
  total_admins: 12,
  monthly_enrollment: generateMockMonthlyEnrollment(),
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};


const calculateStudentGrowth = (
  monthlyData: MonthlyEnrollment[]
): { change: string; trend: "up" | "down" } => {
  const nonZeroMonths = monthlyData.filter((month) => month.count > 0);
  if (nonZeroMonths.length < 2) return { change: "0%", trend: "up" };

  const lastMonth = nonZeroMonths[nonZeroMonths.length - 1];
  const prevMonth = nonZeroMonths[nonZeroMonths.length - 2];

  if (prevMonth.count === 0) return { change: "100%", trend: "up" };

  const growth =
    ((lastMonth.count - prevMonth.count) / prevMonth.count) * 100;
  return {
    change: `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`,
    trend: growth >= 0 ? "up" : "down",
  };
};

const transformChartData = (monthlyData: MonthlyEnrollment[]) => {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return monthlyData.map((item) => ({
    month: monthNames[item.month - 1],
    students: item.count,
  }));
};

/* =========================
   CUSTOM HOOK WITH MOCK DATA
   ========================= */
export const useSchoolDashboardStats = () => {
  const [data, setData] = useState<SchoolDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate API fetch with mock data
  const fetchMockData = async (): Promise<SchoolDashboardStats> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Re-generate monthly data to simulate changes (optional)
        const updatedMock = {
          ...mockDashboardStats,
          monthly_enrollment: generateMockMonthlyEnrollment(),
        };
        resolve(updatedMock);
      }, 800); // simulate network delay
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const stats = await fetchMockData();
      setData(stats);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Optional polling to simulate real‑time updates
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const refetch = async () => {
    await loadData();
  };

  return { data, loading, error, refetch };
};

/* =========================
   SCHOOL KPI CARDS
   ========================= */
export const DashboardCards = () => {
  const { data, loading, error } = useSchoolDashboardStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-800">
          Error Loading Data
        </h3>
        {/* <p className="text-red-600 mt-2">{error || 'No data available'}</p> */}
      </div>
    );
  }

  const studentGrowth = calculateStudentGrowth(data.monthly_enrollment);

  const stats = [
    {
      title: "Total Students",
      value: formatNumber(data.total_students),
      icon: GraduationCap,
      change: studentGrowth.change,
      trend: studentGrowth.trend,
      period: "enrolled",
    },
    {
      title: "Teachers",
      value: formatNumber(data.total_teachers),
      icon: UserCheck,
      change: "+0%", // Replace with real data if available
      trend: "up" as const,
      period: "active",
    },
    {
      title: "Parents",
      value: formatNumber(data.total_parents),
      icon: Heart,
      change: "+0%",
      trend: "up" as const,
      period: "registered",
    },
    {
      title: "Administrators",
      value: formatNumber(data.total_admins),
      icon: UserCog,
      change: "+0%",
      trend: "up" as const,
      period: "active",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-gray-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
              <stat.icon className="h-6 w-6 text-gray-700" />
            </div>
            <div
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                stat.trend === "up"
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {stat.trend === "up" ? (
                <ArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" />
              )}
              {stat.change}
            </div>
          </div>

          <div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm font-medium text-gray-700 mt-1">
              {stat.title}
            </p>
            <p className="text-xs text-gray-500 mt-2">{stat.period}</p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Updated just now</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* =========================
   SCHOOL ENROLLMENT CHART
   ========================= */
export const DashboardCharts = () => {
  const { data, loading, error } = useSchoolDashboardStats();

  if (loading) {
    return <Loading />;
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-800">
          Error Loading Chart
        </h3>
        {/* <p className="text-red-600 mt-2">{error || 'No data available'}</p> */}
      </div>
    );
  }

  const enrollmentData = transformChartData(data.monthly_enrollment);
  const currentEnrollment =
    enrollmentData[enrollmentData.length - 1]?.students || 0;
  const previousEnrollment =
    enrollmentData[enrollmentData.length - 2]?.students || 0;
  const growthPercentage =
    previousEnrollment > 0
      ? ((currentEnrollment - previousEnrollment) / previousEnrollment) * 100
      : 0;

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Student Enrollment Trend
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Monthly total students
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <span
              className={`text-sm font-medium ${
                growthPercentage >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {growthPercentage >= 0 ? "+" : ""}
              {growthPercentage.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                formatter={(value) => [
                  `${Number(value).toLocaleString()} students`,
                  "Enrollment",
                ]}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "12px",
                }}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="students"
                stroke="#3b82f6"
                fill="#dbeafe"
                strokeWidth={2}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-gray-600">Enrollment</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-200 mr-2"></div>
              <span className="text-gray-600">Growth</span>
            </div>
          </div>
          <button className="text-sm font-medium text-gray-700 hover:text-gray-900">
            View details →
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   MAIN SCHOOL DASHBOARD
   ========================= */
export const Dashboard = () => {
  const { data, loading, error, refetch } = useSchoolDashboardStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">School Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {loading
                ? "Loading..."
                : `Updated: ${new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`}
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <DashboardCards />
        <DashboardCharts />
      </div>
    </div>
  );
};

export default Dashboard;