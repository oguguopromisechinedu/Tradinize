import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

async function ensureSession(sessionId: string) {
  let session = await prisma.session.findUnique({ where: { token: sessionId } });
  if (!session) {
    session = await prisma.session.create({ data: { token: sessionId } });
  }
  return session;
}

export default async function WishlistPage() {
  const session = await ensureSession("guest-session");
  const items = await prisma.wishlistItem.findMany({
    where: { sessionId: session.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">Wishlist</p>
            <h1 className="text-3xl font-semibold">Saved favorites</h1>
          </div>
          <Link href="/products" className="text-sm font-medium text-zinc-700">Discover more</Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center text-zinc-600">No favorites saved yet.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <img src={item.product.imageUrl} alt={item.product.name} className="h-48 w-full object-cover" />
                <div className="p-5">
                  <h2 className="text-lg font-semibold">{item.product.name}</h2>
                  <p className="mt-2 text-sm text-zinc-600">{item.product.description}</p>
                  <p className="mt-4 text-xl font-semibold">${Number(item.product.price).toFixed(2)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
