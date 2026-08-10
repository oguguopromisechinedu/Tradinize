"use client";

import Link from "next/link";
import { useState } from "react";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: unknown;
  imageUrl: string;
  stock: number;
  featured: boolean;
  category: { name: string } | null;
};

export function ProductDetailClient({ product }: { product: Product }) {
  const [message, setMessage] = useState<string | null>(null);

  async function addToCart() {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "content-type": "application/json", "x-session-id": "guest-session" },
      body: JSON.stringify({ productId: product.id, quantity: 1 }),
    });
    const data = await response.json();
    setMessage(response.ok ? `${product.name} added to your cart.` : data.error ?? "Unable to add to cart");
  }

  async function addToWishlist() {
    const response = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "content-type": "application/json", "x-session-id": "guest-session" },
      body: JSON.stringify({ productId: product.id }),
    });
    const data = await response.json();
    setMessage(response.ok ? `${product.name} saved to your wishlist.` : data.error ?? "Unable to save wishlist item");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-4xl border border-zinc-200 bg-white shadow-sm">
          <img src={product.imageUrl} alt={product.name} className="h-105 w-full object-cover" />
        </div>
        <div className="rounded-4xl border border-zinc-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">{product.category?.name ?? "Collection"}</p>
          <h1 className="mt-3 text-3xl font-semibold">{product.name}</h1>
          <p className="mt-4 text-zinc-600">{product.description}</p>
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-zinc-100 px-4 py-3">
            <span className="text-sm text-zinc-600">In stock</span>
            <span className="text-sm font-semibold">{product.stock} left</span>
          </div>
          <div className="mt-8 flex items-center justify-between">
            <p className="text-3xl font-semibold">${Number(product.price).toFixed(2)}</p>
            <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">{product.featured ? "Featured" : "New arrival"}</div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={addToCart} className="rounded-full bg-zinc-950 px-5 py-3 font-medium text-white">Add to cart</button>
            <button onClick={addToWishlist} className="rounded-full border border-zinc-300 px-5 py-3 font-medium text-zinc-700">Save to wishlist</button>
          </div>
          {message ? <p className="mt-4 text-sm text-zinc-600">{message}</p> : null}
          <Link href="/products" className="mt-8 inline-flex text-sm font-medium text-zinc-700">← Back to products</Link>
        </div>
      </div>
    </main>
  );
}
