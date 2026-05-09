import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export type CartItem = {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
};

export function useCart() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select("id, product_id, size, quantity")
      .order("created_at", { ascending: true });
    if (!error && data) setItems(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`cart-${user.id}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${user.id}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  const addItem = async (product_id: string, size: string, quantity = 1) => {
    if (!user) throw new Error("Sign in to add items to your bag");
    const existing = items.find((i) => i.product_id === product_id && i.size === size);
    if (existing) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: Math.min(existing.quantity + quantity, 99) })
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert({ user_id: user.id, product_id, size, quantity });
      if (error) throw error;
    }
    await refresh();
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) return removeItem(id);
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: Math.min(quantity, 99) })
      .eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("cart_items").delete().eq("id", id);
    if (error) throw error;
    await refresh();
  };

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, count, loading, addItem, updateQuantity, removeItem, refresh, isAuthed: !!user };
}