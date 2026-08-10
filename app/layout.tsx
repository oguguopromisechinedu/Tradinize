import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MadeMaze",
  description: "A modern storefront experience with cart, wishlist, checkout, and orders.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-50 text-zinc-900">
        <nav className="border-b border-zinc-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              MadeMaze
            </Link>
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-700">
              <Link href="/products">Products</Link>
              <Link href="/wishlist">Wishlist</Link>
              <Link href="/cart">Cart</Link>
              <Link href="/orders">Orders</Link>
              <Link href="/admin">Admin</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
