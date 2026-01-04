"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    basePrice: "",
    sellingPrice: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories for the dropdown
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.data) {
          setCategories(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("categoryId", formData.categoryId);
      data.append("basePrice", formData.basePrice);
      data.append("sellingPrice", formData.sellingPrice);
      if (image) {
        data.append("image", image);
      }

      const res = await fetch("/api/products", {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create product");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 font-sans">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="text-indigo-600 text-3xl">✦</span>
            إضافة منتج جديد
          </h1>
          <Link
            href="/dashboard"
            className="text-slate-500 hover:text-indigo-600 font-bold transition-colors flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:shadow-md"
          >
            إلغاء
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 sm:p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl font-medium flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                اسم الصنف
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 font-medium bg-slate-50 transition-all shadow-sm"
                placeholder="مثال: سماعة لاسلكية"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                فئة الصنف
              </label>
              <div className="relative">
                <select
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 font-medium bg-slate-50 transition-all shadow-sm appearance-none"
                >
                  <option value="">اختر فئة</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4 text-slate-500">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  السعر الأساسي ($)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="basePrice"
                    step="0.01"
                    required
                    value={formData.basePrice}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 font-medium bg-slate-50 transition-all shadow-sm pl-10"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold">$</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  سعر البيع ($)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="sellingPrice"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-900 font-medium bg-slate-50 transition-all shadow-sm pl-10"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold">$</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                صورة الصنف
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-2xl hover:border-indigo-400 hover:bg-slate-50 transition-all bg-slate-50/50">
                <div className="space-y-2 text-center">
                  {imagePreview ? (
                    <div className="mb-4 relative group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-64 object-contain rounded-lg shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-2 right-2 bg-white text-red-600 p-2 rounded-full shadow-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                        title="إزالة الصورة"
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
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto h-16 w-16 text-indigo-100 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <svg
                          className="h-8 w-8 text-indigo-500"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="flex text-sm text-slate-600 justify-center">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-bold text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>اختر ملفاً</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1 text-slate-500">أو اسحبه هنا</p>
                      </div>
                      <p className="text-xs text-slate-400">
                        PNG, JPG, GIF حتى 10 ميجابايت
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl hover:bg-indigo-700 transition-all disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center gap-2 font-bold shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    إنشاء المنتج
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
