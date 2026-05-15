import { useEffect, useState } from "react";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  price: string;
  oldPrice?: string;
  img: string;
  tag?: string;
  category: string;
  description: string;
  features: string[];
};

type ApiProduct = {
  id: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  price: number;
  original_price: number | null;
  category: string;
  badge: string;
  image_url: string | null;
};

function fmt(n: number) {
  return "Rs. " + Math.round(n).toLocaleString();
}

function apiToProduct(p: ApiProduct): Product {
  return {
    slug: p.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: p.title,
    tagline: p.tagline || "",
    price: fmt(p.price),
    oldPrice: p.original_price ? fmt(p.original_price) : undefined,
    img: p.image_url || "",
    tag: p.badge || undefined,
    category: p.category || "",
    description: p.description || "",
    features: Array.isArray(p.features) ? p.features : [],
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin-panel/api/products")
      .then((r) => r.json())
      .then((data: ApiProduct[]) => {
        setProducts(data.map(apiToProduct));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { products, loading };
}

export function useProduct(slug: string) {
  const { products, loading } = useProducts();
  return { product: products.find((p) => p.slug === slug), loading };
}

export const WHATSAPP_NUMBER = "923214028277";

export function waLinkFor(productName: string) {
  const text = `Hi! I want to order the ${productName} from DesiCart.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
