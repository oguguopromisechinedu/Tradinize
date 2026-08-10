import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export default async function AdminPage() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } });

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">Admin</p>
            <h1 className="text-3xl font-semibold">Product management</h1>
          </div>
          <Link href="/" className="text-sm font-medium text-zinc-700">Back to storefront</Link>
        </div>

        <div className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-600">Manage products from the admin screen. Use the seed endpoint once to populate starter data.</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-zinc-100 text-zinc-700">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-zinc-200">
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3">{product.category?.name ?? "Uncategorized"}</td>
                    <td className="px-4 py-3">${Number(product.price).toFixed(2)}</td>
                    <td className="px-4 py-3">{product.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
