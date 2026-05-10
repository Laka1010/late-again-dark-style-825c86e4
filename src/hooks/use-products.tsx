import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { rowToProduct, type DbProductRow, type Product } from "@/data/products";

type Ctx = {
  products: Product[];
  loading: boolean;
  refresh: () => Promise<void>;
  getProduct: (id: string) => Product | undefined;
};

const ProductsContext = createContext<Ctx | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true });
    if (!error && data) {
      setProducts((data as unknown as DbProductRow[]).map(rowToProduct));
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const channel = supabase
      .channel(`products-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        refresh();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refresh]);

  const getProduct = useCallback((id: string) => products.find((p) => p.id === id), [products]);
  const value = useMemo(() => ({ products, loading, refresh, getProduct }), [products, loading, refresh, getProduct]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within ProductsProvider");
  return ctx;
}
