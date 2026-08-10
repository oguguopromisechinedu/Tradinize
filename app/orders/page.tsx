import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

function getSessionId(request: Request) {
  const header = request.headers.get("x-session-id");
  return header ?? "guest-session";
}

async function ensureSession(sessionId: string) {
  let session = await prisma.session.findUnique({ where: { token: sessionId } });
  if (!session) {
    session = await prisma.session.create({ data: { token: sessionId } });
  }
  return session;
}

export default async function OrdersPage() {
  const session = await ensureSession("guest-session");
  const orders = await prisma.order.findMany({
    where: { sessionId: session.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-10 text-zinc-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-zinc-500">Orders</p>
            <h1 className="text-3xl font-semibold">Order history</h1>
          </div>
          <Link href="/products" className="text-sm font-medium text-zinc-700">Shop more</Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center text-zinc-600">You have no orders yet.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-zinc-500">Order #{order.id.slice(0, 8)}</p>
                    <h2 className="text-xl font-semibold">{order.customerName}</h2>
                  </div>
                  <div className="text-sm text-zinc-600">
                    <p>Status: {order.status}</p>
                    <p>Total: ${Number(order.total).toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
                      <span>{item.productName}</span>
                      <span>{item.quantity} × ${Number(item.unitPrice).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
