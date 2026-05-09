import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteNav } from "@/components/site-nav";
import { getProduct, products } from "@/data/products";
import { useCart } from "@/hooks/use-cart";

export const Route = createFileRoute("/products/$id")({
  loader: ({ params }) => {
    const product = getProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Late Againg` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: loaderData.product.name },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.img },
          { name: "twitter:image", content: loaderData.product.img },
        ]
      : [],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="grain min-h-screen bg-background text-foreground">
      <SiteNav />
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">404</p>
          <h1 className="font-display mt-4 text-3xl font-light">Piece not found</h1>
          <Link to="/" className="btn-ghost mt-8 inline-block">Back to collection</Link>
        </div>
      </div>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData() as { product: import("@/data/products").Product };
  const { addItem, isAuthed } = useCart();
  const navigate = useNavigate();
  const [size, setSize] = useState(product.sizes[1] ?? product.sizes[0]);
  const [busy, setBusy] = useState(false);

  const onAdd = async () => {
    if (!isAuthed) {
      toast.error("Sign in to add to your bag");
      navigate({ to: "/account" });
      return;
    }
    setBusy(true);
    try {
      await addItem(product.id, size, 1);
      toast.success(`${product.name} added to bag`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not add to bag");
    } finally {
      setBusy(false);
    }
  };

  const related = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="mx-auto max-w-[1400px] px-6 pt-32 pb-24 md:px-12">
        <Link to="/" className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
          ← Collection
        </Link>

        <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-20">
          <div className="aspect-[4/5] overflow-hidden bg-secondary">
            <img
              src={product.img}
              alt={product.name}
              width={1024}
              height={1280}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
              {product.category}
            </p>
            <h1 className="font-display mt-4 text-4xl font-light tracking-tight md:text-6xl">
              {product.name}
            </h1>
            <p className="font-display mt-4 text-2xl text-silver">{product.priceLabel}</p>

            <p className="mt-10 max-w-md text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            <div className="mt-10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Size</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`hairline px-5 py-3 text-[11px] uppercase tracking-[0.3em] transition-colors ${
                      size === s
                        ? "border-foreground bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={onAdd}
              disabled={busy}
              className="btn-ghost mt-10 disabled:opacity-50"
            >
              {busy ? "Adding…" : "Add to bag →"}
            </button>

            <ul className="mt-12 space-y-2 border-t border-border/40 pt-8 text-sm text-muted-foreground">
              {product.details.map((d) => (
                <li key={d}>· {d}</li>
              ))}
            </ul>
          </div>
        </div>

        <section className="mt-32">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">More pieces</p>
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.id}
                to="/products/$id"
                params={{ id: p.id }}
                className="group block"
              >
                <div className="aspect-[4/5] overflow-hidden bg-secondary">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="h-full w-full object-cover grayscale-[20%] transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-4 flex items-start justify-between">
                  <h3 className="font-display text-base">{p.name}</h3>
                  <p className="font-display text-sm text-silver">{p.priceLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}