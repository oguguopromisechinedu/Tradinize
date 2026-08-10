import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

type ProductCardProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: string | number;
    imageUrl: string;
    stock: number;
    featured: boolean;
    category: { name: string } | null;
  };
};

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <img src={product.imageUrl} alt={product.name} className="h-48 w-full object-cover" />
      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700">{product.category?.name ?? "General"}</span>
          {product.featured ? <span className="text-amber-600">Featured</span> : null}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">{product.name}</h2>
          <p className="mt-2 text-sm text-zinc-600">{product.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold text-zinc-950">${Number(product.price).toFixed(2)}</p>
          <Link href={`/products/${product.slug}`} className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <section className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="rounded-4xl bg-zinc-950 p-8 text-white shadow-xl sm:p-12">
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-400">MadeMaze</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold sm:text-5xl">A modern storefront for thoughtful daily essentials.</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-300">Browse featured products, save favorites, manage your cart, and complete checkout with a persistent order history.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="rounded-full bg-white px-5 py-3 font-medium text-zinc-950">Shop products</Link>
            <Link href="/cart" className="rounded-full border border-zinc-700 px-5 py-3 font-medium text-white">Go to cart</Link>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {categories.map((category) => (
            <div key={category.id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">{category.name}</h3>
              <p className="mt-2 text-sm text-zinc-600">{category.description ?? "Curated pieces for everyday living."}</p>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Featured products</h2>
            <Link href="/products" className="text-sm font-medium text-zinc-700">View all</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product as never} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
