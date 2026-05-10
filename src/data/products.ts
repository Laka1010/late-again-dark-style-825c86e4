import pHoodie from "@/assets/product-hoodie.jpg";
import pTee from "@/assets/product-tee.jpg";
import pCargo from "@/assets/product-cargo.jpg";
import pJacket from "@/assets/product-jacket.jpg";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  priceLabel: string;
  img: string;
  description: string;
  details: string[];
  sizes: string[];                 // available sizes (in display order)
  allSizes: { size: string; available: boolean }[];
};

// Fallback images for products that don't yet have an uploaded image_url.
export const fallbackImages: Record<string, string> = {
  "midnight-hoodie": pHoodie,
  "boxy-tee-001": pTee,
  "cargo-pant-noir": pCargo,
  "bomber-eclipse": pJacket,
};

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><rect width='4' height='5' fill='%23222'/></svg>";

export type DbProductRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  price_label: string;
  description: string;
  details: string[];
  sizes: Record<string, boolean> | null;
  image_url: string | null;
  sort_order: number;
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

function sortSizes(sizes: string[]) {
  return [...sizes].sort((a, b) => {
    const ai = SIZE_ORDER.indexOf(a);
    const bi = SIZE_ORDER.indexOf(b);
    if (ai !== -1 || bi !== -1) {
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    }
    const an = Number(a), bn = Number(b);
    if (!isNaN(an) && !isNaN(bn)) return an - bn;
    return a.localeCompare(b);
  });
}

export function rowToProduct(row: DbProductRow): Product {
  const sizesObj = (row.sizes ?? {}) as Record<string, boolean>;
  const allSizes = sortSizes(Object.keys(sizesObj)).map((size) => ({
    size,
    available: !!sizesObj[size],
  }));
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    priceLabel: row.price_label || `€${row.price}`,
    img: row.image_url || fallbackImages[row.id] || PLACEHOLDER_IMG,
    description: row.description,
    details: row.details ?? [],
    sizes: allSizes.filter((s) => s.available).map((s) => s.size),
    allSizes,
  };
}