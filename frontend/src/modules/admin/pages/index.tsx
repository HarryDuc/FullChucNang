"use client";
import AdminLayout from "../common/layouts/AdminLayout";
import { useEffect, useState } from "react";
import {
  MdShoppingBag,
  MdCategory,
  MdStyle,
  MdTrendingUp,
  MdPeople,
  MdAttachMoney,
  MdShoppingCart,
} from "react-icons/md";
import { ProductService } from "@/modules/admin/products/services/product.service";
import { CategoriesService } from "@/modules/admin/categories-product/services/categories-product.service";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Define types for our statistics
interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalVariants: number;
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
}

export default function AdminHome() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalVariants: 0,
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sample data for charts
  const salesData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Sales",
        data: [24780, 28900, 27000, 29800, 31200, 32800],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const channelData = {
    labels: ["Direct", "Social Media", "Email", "Affiliates"],
    datasets: [
      {
        data: [35, 25, 20, 20],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(139, 92, 246, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          ProductService.getAll(1, 1).then((response) => ({
            count: response.total || 0,
          })),
          CategoriesService.getAll().then((categories) => ({
            count: categories.length || 0,
          })),
        ]);

        setStats({
          totalProducts: productsData.count,
          totalCategories: categoriesData.count,
          totalVariants: 15, // Sample data
          totalRevenue: 52469,
          totalOrders: 156,
          totalCustomers: 892,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    percentageChange,
  }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">
            {typeof value === "number" && title.includes("Revenue")
              ? `$${value.toLocaleString()}`
              : value.toLocaleString()}
          </h3>
          {percentageChange && (
            <p
              className={`text-sm mt-1 ${
                percentageChange > 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {percentageChange > 0 ? "+" : ""}
              {percentageChange}% vs last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`text-${color}-500 text-xl`} />
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Dashboard Overview
            </h2>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening with your store today.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              Download Report
            </button>
            <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700">
              Add Product
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-lg shadow-sm animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={stats.totalRevenue}
                icon={MdAttachMoney}
                color="blue"
                percentageChange={12.5}
              />
              <StatCard
                title="Total Orders"
                value={stats.totalOrders}
                icon={MdShoppingCart}
                color="green"
                percentageChange={8.2}
              />
              <StatCard
                title="Total Products"
                value={stats.totalProducts}
                icon={MdShoppingBag}
                color="orange"
                percentageChange={-2.4}
              />
              <StatCard
                title="Total Customers"
                value={stats.totalCustomers}
                icon={MdPeople}
                color="purple"
                percentageChange={5.7}
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Sales Trend Chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Sales Overview
                </h3>
                <Line data={salesData} options={chartOptions} />
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
