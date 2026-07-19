"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/lib/products";

interface ProductListProps {
  products: Product[];
}

// Syncs the open modal with the ?product=<id> search param so every modal
// has a shareable URL and opens directly when that URL is visited.
export default function ProductList({ products }: ProductListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openId = searchParams.get("product");

  function setOpen(id: string, open: boolean) {
    const params = new URLSearchParams(searchParams);
    if (open) {
      params.set("product", id);
    } else {
      params.delete("product");
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          open={openId === product.id}
          onOpenChange={(open) => setOpen(product.id, open)}
        />
      ))}
    </>
  );
}
