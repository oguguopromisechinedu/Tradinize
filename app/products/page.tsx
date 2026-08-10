import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ query?: string; category?: string }> }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.query?.trim() ?? "";
  const category = resolvedParams.category?.trim() ?? "";

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
      ...(category
        ? {
            category: {
              slug: category,
            },
          }
        : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-4 rounded-4xl border border-zinc-200 bg-white p-6 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">Browse</p>
            <h1 className="mt-2 text-3xl font-semibold">All products</h1>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row" method="get">
            <input name="query" defaultValue={query} placeholder="Search products" className="rounded-full border border-zinc-300 px-4 py-2" />
            <select name="category" defaultValue={category} className="rounded-full border border-zinc-300 px-4 py-2">
              <option value="">All categories</option>
              {categories.map((categoryOption) => (
                <option key={categoryOption.id} value={categoryOption.slug}>
                  {categoryOption.name}
                </option>
              ))}
            </select>
            <button className="rounded-full bg-zinc-950 px-4 py-2 font-medium text-white">Filter</button>
          </form>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-600">
            No products match your search yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <img src={product.imageUrl} alt={product.name} className="h-48 w-full object-cover" />
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700">{product.category?.name ?? "General"}</span>
                    <span className="text-amber-600">{product.featured ? "Featured" : "New"}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    <p className="mt-2 text-sm text-zinc-600">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-semibold">${Number(product.price).toFixed(2)}</p>
                    <Link href={`/products/${product.slug}`} className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white">
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
