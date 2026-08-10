import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST() {
  const categories = [
    { name: "Accessories", slug: "accessories", description: "Everyday essentials" },
    { name: "Apparel", slug: "apparel", description: "Comfortable statement pieces" },
    { name: "Home", slug: "home", description: "Thoughtful decor and useful pieces" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  const products = [
    {
      name: "Aurora Backpack",
      slug: "aurora-backpack",
      description: "A sleek backpack that carries your essentials in style.",
      price: "89.00",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
      stock: 12,
      featured: true,
    },
    {
      name: "Luna Sneakers",
      slug: "luna-sneakers",
      description: "Lightweight sneakers designed for long walks and city days.",
      price: "112.00",
      imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80",
      stock: 8,
      featured: true,
    },
    {
      name: "Studio Lamp",
      slug: "studio-lamp",
      description: "Warm ambient lighting with a clean matte finish.",
      price: "64.00",
      imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
      stock: 20,
    },
  ];

  for (const product of products) {
    const category = await prisma.category.findFirst({ where: { slug: product.slug.includes("lamp") ? "home" : product.slug.includes("backpack") ? "accessories" : "apparel" } });
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        categoryId: category?.id,
      },
    });
  }

  return NextResponse.json({ ok: true });
}
