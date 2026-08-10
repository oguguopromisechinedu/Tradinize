import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { ProductDetailClient } from "./ProductDetailClient";

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">Product not found</h1>
          <p className="mt-3 text-zinc-600">The item you are looking for is no longer available.</p>
          <Link href="/products" className="mt-6 inline-flex rounded-full bg-zinc-950 px-5 py-3 font-medium text-white">Back to products</Link>
        </div>
      </main>
    );
  }

  return <ProductDetailClient product={product} />;
}
