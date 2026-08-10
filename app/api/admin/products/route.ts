import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: body.price,
      imageUrl: body.imageUrl,
      categoryId: body.categoryId || null,
      stock: Number(body.stock ?? 0),
      featured: Boolean(body.featured),
      isActive: Boolean(body.isActive ?? true),
    },
  });
  return NextResponse.json(product);
}
