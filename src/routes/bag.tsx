import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { SiteNav } from "@/components/site-nav";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useProducts } from "@/hooks/use-products";

export const Route = createFileRoute("/bag")({
  component: BagPage,
  head: () => ({
    meta: [
      { title: "Bag — Late Againg" },
      { name: "description", content: "Your Late Againg shopping bag." },
    ],
  }),
});

function BagPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, loading, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const lines = items
    .map((i) => ({ item: i, product: getProduct(i.product_id) }))
    .filter((l) => l.product);

  const subtotal = lines.reduce((sum, l) => sum + (l.product?.price ?? 0) * l.item.quantity, 0);

  const onChange = async (id: string, q: number) => {
    try {
      await updateQuantity(id, q);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const onRemove = async (id: string) => {
    try {
      await removeItem(id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Remove failed");
    }
  };

  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-[1100px] px-6 pt-32 pb-24 md:px-12">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Your bag</p>
        <h1 className="font-display mt-4 text-4xl font-light tracking-tight md:text-6xl">
          Bag <span className="text-silver">({lines.reduce((s, l) => s + l.item.quantity, 0)})</span>
        </h1>

        {authLoading || loading ? (
          <p className="mt-16 text-sm text-muted-foreground">Loading…</p>
        ) : !user ? (
          <div className="mt-16">
            <p className="text-sm text-muted-foreground">
              Sign in to view and save your personal bag.
            </p>
            <button onClick={() => navigate({ to: "/account" })} className="btn-ghost mt-8">
              Sign in →
            </button>
          </div>
        ) : lines.length === 0 ? (
          <div className="mt-16">
            <p className="text-sm text-muted-foreground">Your bag is empty.</p>
            <Link to="/" className="btn-ghost mt-8 inline-block">Shop the collection →</Link>
          </div>
        ) : (
          <div className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-[1fr_320px]">
            <ul className="divide-y divide-border/40">
              {lines.map(({ item, product }) => (
                <li key={item.id} className="flex gap-6 py-6">
                  <Link to="/products/$id" params={{ id: product!.id }} className="block w-24 shrink-0 sm:w-32">
                    <div className="aspect-[4/5] overflow-hidden bg-secondary">
                      <img src={product!.img} alt={product!.name} className="h-full w-full object-cover" />
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                          {product!.category} · Size {item.size}
                        </p>
                        <Link to="/products/$id" params={{ id: product!.id }} className="font-display mt-1 block text-base hover:text-silver">
                          {product!.name}
                        </Link>
                      </div>
                      <p className="font-display text-sm text-silver">
                        €{product!.price * item.quantity}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="hairline inline-flex items-center">
                        <button
                          aria-label="Decrease"
                          onClick={() => onChange(item.id, item.quantity - 1)}
                          className="px-3 py-2 text-muted-foreground hover:text-foreground"
                        >
                          <Minus size={14} strokeWidth={1.25} />
                        </button>
                        <span className="min-w-8 px-2 text-center text-sm">{item.quantity}</span>
                        <button
                          aria-label="Increase"
                          onClick={() => onChange(item.id, item.quantity + 1)}
                          className="px-3 py-2 text-muted-foreground hover:text-foreground"
                        >
                          <Plus size={14} strokeWidth={1.25} />
                        </button>
                      </div>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground"
                      >
                        <X size={12} strokeWidth={1.25} /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit border border-border/40 p-8">
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Summary</p>
              <div className="mt-6 flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-display text-foreground">€{subtotal}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-muted-foreground">Calculated at checkout</span>
              </div>
              <div className="mt-6 flex justify-between border-t border-border/40 pt-6">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Total</span>
                <span className="font-display text-xl text-foreground">€{subtotal}</span>
              </div>
              <button
                onClick={() => navigate({ to: "/checkout" })}
                className="btn-ghost mt-8 w-full"
              >
                Checkout →
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}