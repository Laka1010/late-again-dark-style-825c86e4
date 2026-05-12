import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { SiteNav } from "@/components/site-nav";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useProducts } from "@/hooks/use-products";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  head: () => ({
    meta: [
      { title: "Checkout — Late Again" },
      { name: "description", content: "Complete your Late Again order." },
    ],
  }),
});

const schema = z.object({
  firstName: z.string().trim().min(1, "Required").max(60),
  lastName: z.string().trim().min(1, "Required").max(60),
  address: z.string().trim().min(1, "Required").max(120),
  apartment: z.string().trim().max(60).optional().or(z.literal("")),
  city: z.string().trim().min(1, "Required").max(60),
  postal: z.string().trim().min(3, "Required").max(20),
  country: z.string().trim().min(1, "Required").max(60),
  phone: z.string().trim().min(5, "Required").max(30),
  card: z.string().trim().regex(/^[\d\s]{12,23}$/, "Invalid card"),
  expiry: z.string().trim().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "MM/YY"),
  cvc: z.string().trim().regex(/^\d{3,4}$/, "Invalid CVC"),
});

function CheckoutPage() {
  const { getProduct } = useProducts();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { items, loading, refresh, removeItem } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    postal: "",
    country: "Spain",
    phone: "",
    card: "",
    expiry: "",
    cvc: "",
  });

  const lines = items
    .map((i) => ({ item: i, product: getProduct(i.product_id) }))
    .filter((l) => l.product);
  const subtotal = lines.reduce((s, l) => s + (l.product?.price ?? 0) * l.item.quantity, 0);
  const shipping = subtotal > 0 ? (subtotal >= 200 ? 0 : 12) : 0;
  const total = subtotal + shipping;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check the form");
      return;
    }
    if (lines.length === 0) {
      toast.error("Your bag is empty");
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 1200));
      await Promise.all(items.map((i) => removeItem(i.id).catch(() => null)));
      await refresh();
      toast.success("Order placed");
      navigate({ to: "/" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-[1200px] px-6 pt-32 pb-24 md:px-12">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Checkout</p>
        <h1 className="font-display mt-4 text-4xl font-light tracking-tight md:text-6xl">
          Complete <span className="text-silver">order</span>
        </h1>

        {authLoading || loading ? (
          <p className="mt-16 text-sm text-muted-foreground">Loading…</p>
        ) : !user ? (
          <div className="mt-16">
            <p className="text-sm text-muted-foreground">Sign in to checkout.</p>
            <Link to="/account" className="btn-ghost mt-8 inline-block">Sign in →</Link>
          </div>
        ) : lines.length === 0 ? (
          <div className="mt-16">
            <p className="text-sm text-muted-foreground">Your bag is empty.</p>
            <Link to="/" className="btn-ghost mt-8 inline-block">Shop the collection →</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-[1fr_360px]">
            <div className="space-y-12">
              <Section title="Shipping address">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First name" value={form.firstName} onChange={set("firstName")} autoComplete="given-name" />
                  <Field label="Last name" value={form.lastName} onChange={set("lastName")} autoComplete="family-name" />
                </div>
                <Field label="Address" value={form.address} onChange={set("address")} autoComplete="address-line1" />
                <Field label="Apartment, suite (optional)" value={form.apartment} onChange={set("apartment")} autoComplete="address-line2" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="City" value={form.city} onChange={set("city")} autoComplete="address-level2" />
                  <Field label="Postal code" value={form.postal} onChange={set("postal")} autoComplete="postal-code" />
                </div>
                <Field label="Country" value={form.country} onChange={set("country")} autoComplete="country-name" />
                <Field label="Phone" value={form.phone} onChange={set("phone")} autoComplete="tel" />
              </Section>

              <Section title="Payment">
                <Field label="Card number" value={form.card} onChange={set("card")} placeholder="1234 5678 9012 3456" inputMode="numeric" autoComplete="cc-number" />
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry (MM/YY)" value={form.expiry} onChange={set("expiry")} placeholder="04/28" autoComplete="cc-exp" />
                  <Field label="CVC" value={form.cvc} onChange={set("cvc")} placeholder="123" inputMode="numeric" autoComplete="cc-csc" />
                </div>
              </Section>
            </div>

            <aside className="h-fit border border-border/40 p-8">
              <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Order</p>
              <ul className="mt-6 divide-y divide-border/40">
                {lines.map(({ item, product }) => (
                  <li key={item.id} className="flex gap-4 py-4">
                    <div className="aspect-[4/5] w-16 shrink-0 overflow-hidden bg-secondary">
                      <img src={product!.img} alt={product!.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <p className="font-display text-sm">{product!.name}</p>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                          Size {item.size} · Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-display text-sm text-silver">€{product!.price * item.quantity}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-display">€{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-display">{shipping === 0 ? "Free" : `€${shipping}`}</span>
                </div>
              </div>
              <div className="mt-6 flex justify-between border-t border-border/40 pt-6">
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Total</span>
                <span className="font-display text-xl">€{total}</span>
              </div>
              <button type="submit" disabled={submitting} className="btn-ghost mt-8 w-full disabled:opacity-50">
                {submitting ? "Placing order…" : "Place order →"}
              </button>
              <Link to="/bag" className="mt-4 block text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
                ← Back to bag
              </Link>
            </aside>
          </form>
        )}
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      <input
        {...props}
        className="mt-2 w-full border-b border-border/40 bg-transparent py-2 text-sm text-foreground outline-none transition-colors focus:border-foreground"
      />
    </label>
  );
}