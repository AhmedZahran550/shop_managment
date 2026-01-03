"use client";
import Link from "next/link";

export default function EditProductPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      <p>This feature is not yet implemented.</p>
      <Link href="/products" className="text-blue-500 hover:underline">
        Back to Products
      </Link>
    </div>
  );
}
