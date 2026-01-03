"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    recentActivities: 0,
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));

    // Fetch stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, activitiesRes] = await Promise.all([
        fetch("/api/products?limit=1"),
        fetch("/api/activities?limit=1"),
      ]);

      const productsData = await productsRes.json();
      const activitiesData = await activitiesRes.json();

      setStats({
        totalProducts: productsData.pagination?.total || 0,
        recentActivities: activitiesData.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Shop Management
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.username} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Total Products
            </h3>
            <p className="text-4xl font-bold text-blue-600">
              {stats.totalProducts}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Recent Activities
            </h3>
            <p className="text-4xl font-bold text-green-600">
              {stats.recentActivities}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Your Role
            </h3>
            <p className="text-2xl font-bold text-purple-600 capitalize">
              {user.role}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors text-center font-semibold"
            >
              View All Products
            </Link>

            {user.role === "admin" && (
              <Link
                href="/products/new"
                className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors text-center font-semibold"
              >
                Add New Product
              </Link>
            )}

            <Link
              href="/activities"
              className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition-colors text-center font-semibold"
            >
              View Activities
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
