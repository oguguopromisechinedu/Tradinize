"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type CartItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    imageUrl: string;
    price: string | number;
  };
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    setLoading(true);
    const response = await fetch("/api/cart", { headers: { "x-session-id": "guest-session" } });
    const data = await response.json();
    setItems(data);
    setLoading(false);
  }

  async function updateQuantity(id: string, quantity: number) {
    await fetch("/api/cart", {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-session-id": "guest-session" },
      body: JSON.stringify({ id, quantity }),
    });
    await fetchCart();
  }

  async function removeItem(id: string) {
    await fetch(`/api/cart?id=${id}`, { method: "DELETE", headers: { "x-session-id": "guest-session" } });
    await fetchCart();
  }

  async function submitCheckout(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json", "x-session-id": "guest-session" },
      body: JSON.stringify({ customerName: name, customerEmail: email, phone, address }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Checkout failed");
      return;
    }
    setMessage(`Order placed successfully. Reference: ${data.id}`);
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    await fetchCart();
  }

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
    [items],
  );

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">Cart</p>
            <h1 className="text-3xl font-semibold">Your shopping cart</h1>
          </div>
          <Link href="/products" className="text-sm font-medium text-zinc-700">Continue shopping</Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center text-zinc-600">Loading your cart…</div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center text-zinc-600">Your cart is empty. Add a few favorites to get started.</div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <img src={item.product.imageUrl} alt={item.product.name} className="h-20 w-20 rounded-2xl object-cover" />
                    <div>
                      <h2 className="font-semibold">{item.product.name}</h2>
                      <p className="text-sm text-zinc-600">${Number(item.product.price).toFixed(2)} each</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={item.quantity} onChange={(event) => updateQuantity(item.id, Number(event.target.value))} className="rounded-full border border-zinc-300 px-3 py-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => removeItem(item.id)} className="rounded-full bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Checkout</h2>
              <form className="mt-6 space-y-3" onSubmit={submitCheckout}>
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" className="w-full rounded-full border border-zinc-300 px-4 py-3" required />
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="w-full rounded-full border border-zinc-300 px-4 py-3" required />
                <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone" className="w-full rounded-full border border-zinc-300 px-4 py-3" />
                <textarea value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Shipping address" className="min-h-24 w-full rounded-3xl border border-zinc-300 px-4 py-3" required />
                <div className="rounded-2xl bg-zinc-100 p-4 text-sm text-zinc-700">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>
                <button className="w-full rounded-full bg-zinc-950 px-4 py-3 font-medium text-white">Place order</button>
              </form>
              {message ? <p className="mt-4 text-sm text-zinc-600">{message}</p> : null}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
