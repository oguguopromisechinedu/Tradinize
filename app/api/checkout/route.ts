import { NextResponse } from "next/server";
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

export async function POST(request: Request) {
  const sessionId = getSessionId(request);
  const session = await ensureSession(sessionId);
  const body = await request.json();
  const { customerName, customerEmail, phone, address } = body as {
    customerName?: string;
    customerEmail?: string;
    phone?: string;
    address?: string;
  };

  if (!customerName || !customerEmail || !address) {
    return NextResponse.json({ error: "Missing checkout fields" }, { status: 400 });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { sessionId: session.id },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const orderItems = cartItems.map((item) => ({
    productId: item.productId,
    productName: item.product.name,
    productImage: item.product.imageUrl,
    unitPrice: item.product.price,
    quantity: item.quantity,
  }));

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0,
  );

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        sessionId: session.id,
        customerName,
        customerEmail,
        phone: phone ?? null,
        address,
        total: total.toFixed(2),
        status: "PENDING",
        items: { create: orderItems },
      },
    });

    await tx.cartItem.deleteMany({ where: { sessionId: session.id } });
    return createdOrder;
  });

  return NextResponse.json(order);
}
