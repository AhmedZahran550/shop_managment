"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [stats, setStats] = useState({
    totalProducts: 0,
    recentActivities: 0,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Edit and Delete state
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deleteProduct, setDeleteProduct] = useState<any>(null);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    categoryId: "",
    basePrice: "",
    sellingPrice: "",
    size: "",
    weight: "",
  });
  const [editImage, setEditImage] = useState<File | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/products?limit=100&search=${encodeURIComponent(
          searchQuery
        )}&categoryId=${selectedCategory}&sort=${sortOrder}`
      );
      const data = await res.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [activitiesRes] = await Promise.all([
        fetch("/api/activities?limit=1"),
      ]);

      const activitiesData = await activitiesRes.json();

      setStats((prev) => ({
        ...prev,
        recentActivities: activitiesData.pagination?.total || 0,
      }));
      fetchTotalProductsCount();
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchTotalProductsCount = async () => {
    try {
      const res = await fetch("/api/products?limit=1");
      const data = await res.json();
      setStats((prev) => ({
        ...prev,
        totalProducts: data.pagination?.total || 0,
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("user");
    router.push("/login");
  };

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      categoryId: product.category_id,
      basePrice: product.base_price.toString(),
      sellingPrice: product.selling_price.toString(),
      size: product.size || "",
      weight: product.weight || "",
    });
    setEditImage(null);
    setConfirmAction(null);
  };

  const handleEditSubmit = async () => {
    if (confirmAction !== "update") {
      setConfirmAction("update");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", editFormData.name);
      formData.append("categoryId", editFormData.categoryId);
      formData.append("basePrice", editFormData.basePrice);
      formData.append("sellingPrice", editFormData.sellingPrice);
      if (editFormData.size) {
        formData.append("size", editFormData.size);
      }
      if (editFormData.weight) {
        formData.append("weight", editFormData.weight);
      }
      if (editImage) {
        formData.append("image", editImage);
      }

      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        setEditingProduct(null);
        setConfirmAction(null);
        fetchProducts();
      } else {
        alert("Failed to update product");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating product");
    }
  };

  const handleDeleteClick = (product: any) => {
    setDeleteProduct(product);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProduct) return;

    try {
      const res = await fetch(`/api/products/${deleteProduct.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteProduct(null);
        fetchProducts();
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting product");
    }
  };

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));

    // Fetch initial data
    fetchStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, sortOrder]);

  if (!user) return null;

  // Server-side filtered now
  const filteredProducts = products;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between h-auto sm:h-20 items-center py-4 sm:py-0 gap-4 sm:gap-0">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span className="text-indigo-600 text-3xl">✦</span>
              نظام إدارة المتاجر
            </h1>
            {(user.role === "admin" || user.role === "worker") && (
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mx-4">
                <Link
                  href="/dashboard/categories"
                  className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                >
                  الفئات
                </Link>
                {user.role === "admin" && (
                  <Link
                    href="/dashboard/users"
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                  >
                    المستخدمين
                  </Link>
                )}
              </div>
            )}
            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800">
                  {user.username}
                </span>
                <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-100 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
              إجمالي الاصناف
            </h3>
            <p className="text-4xl font-black text-slate-800">
              {stats.totalProducts}
            </p>
          </div>

          {user.role === "admin" && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
                نشاطات حديثة
              </h3>
              <p className="text-4xl font-black text-indigo-600">
                {stats.recentActivities}
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-2">
              حالة النظام
            </h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-lg font-bold text-emerald-600">متصل</p>
            </div>
          </div>
        </div>

        {/* Product Search and Grid */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h3 className="text-2xl font-bold text-slate-800">جميع المنتجات</h3>
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full sm:w-auto">
              {(user.role === "admin" || user.role === "worker") && (
                <Link
                  href="/dashboard/products/new"
                  className="bg-indigo-600 text-white py-2.5 px-6 rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                  title="إضافة صنف جديد"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>إضافة صنف جديد</span>
                </Link>
              )}
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  placeholder="ابحث عن منتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 font-semibold bg-white transition-all shadow-md hover:shadow-lg placeholder:text-slate-400"
                />
                <svg
                  className="w-5 h-5 text-indigo-500 absolute left-4 top-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 font-semibold bg-white shadow-sm"
            >
              <option value="">جميع الفئات</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 font-semibold bg-white shadow-sm"
            >
              <option value="recent">المضافة حديثاً</option>
              <option value="price_asc">السعر: من الأقل للأعلى</option>
              <option value="price_desc">السعر: من الأعلى للأقل</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              <div className="col-span-full py-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500 font-medium text-lg">
                  لا توجد منتجات تطابق "{searchQuery}"
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="h-56 bg-slate-50 w-full relative overflow-hidden p-4">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <span className="text-sm">لا توجد صورة</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h4 className="font-bold text-lg text-slate-900 mb-1 truncate leading-snug">
                      {product.name}
                    </h4>
                    {(product.size || product.weight) && (
                      <div className="text-sm text-slate-500 mb-3 flex gap-2">
                        {product.size && (
                          <span>
                            {product.size === "small" && "صغير"}
                            {product.size === "medium" && "متوسط"}
                            {product.size === "large" && "كبير"}
                          </span>
                        )}
                        {product.size && product.weight && <span>•</span>}
                        {product.weight && <span>{product.weight}</span>}
                      </div>
                    )}
                    {(user.role === "admin" || user.role === "worker") && (
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="flex-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          حذف
                        </button>
                      </div>
                    )}
                    <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 mb-0.5">
                          السعر الأساسي
                        </p>
                        <p className="text-slate-600 font-medium text-sm decoration-red-400">
                          {product.base_price}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-slate-400 mb-0.5">
                          سعر البيع
                        </p>
                        <p className="text-xl font-black text-indigo-600">
                          {product.selling_price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setEditingProduct(null);
            setConfirmAction(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-black text-slate-800">
                تعديل الصنف
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  اسم الصنف
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  الفئة
                </label>
                <select
                  value={editFormData.categoryId}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      categoryId: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    السعر الأساسي
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.basePrice}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        basePrice: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    سعر البيع
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.sellingPrice}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        sellingPrice: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    الحجم (اختياري)
                  </label>
                  <select
                    value={editFormData.size}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, size: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900"
                  >
                    <option value="">اختر الحجم</option>
                    <option value="small">صغير</option>
                    <option value="medium">متوسط</option>
                    <option value="large">كبير</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    الوزن (اختياري)
                  </label>
                  <input
                    type="text"
                    value={editFormData.weight}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        weight: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900"
                    placeholder="مثال: 2 كيلو، 500 جرام"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  صورة جديدة (اختياري)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setConfirmAction(null);
                }}
                className="px-6 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleEditSubmit}
                className={`px-6 py-2.5 rounded-xl font-bold transition-colors ${
                  confirmAction === "update"
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {confirmAction === "update" ? "تأكيد التحديث" : "تحديث"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProduct && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteProduct(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">
                    تأكيد الحذف
                  </h3>
                  <p className="text-sm text-slate-500">
                    هذا الإجراء لا يمكن التراجع عنه
                  </p>
                </div>
              </div>
              <p className="text-slate-600 mb-6">
                هل أنت متأكد من حذف الصنف{" "}
                <span className="font-bold">{deleteProduct.name}</span>؟
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteProduct(null)}
                  className="px-6 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-6 py-2.5 bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
