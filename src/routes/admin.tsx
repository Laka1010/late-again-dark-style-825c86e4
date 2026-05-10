import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Upload, Trash2, Plus } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useProducts } from "@/hooks/use-products";
import type { Product } from "@/data/products";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — Late Againg" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin();
  const [tab, setTab] = useState<"products" | "users">("products");

  if (authLoading || roleLoading) {
    return (
      <Shell>
        <p className="pt-40 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">Loading…</p>
      </Shell>
    );
  }
  if (!user) {
    return (
      <Shell>
        <div className="pt-40 text-center">
          <p className="text-sm text-muted-foreground">Sign in to access admin.</p>
          <Link to="/account" className="btn-ghost mt-8 inline-block">Sign in →</Link>
        </div>
      </Shell>
    );
  }
  if (!isAdmin) {
    return (
      <Shell>
        <div className="pt-40 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Restricted</p>
          <h1 className="font-display mt-4 text-3xl font-light">Admin only</h1>
          <p className="mt-4 text-sm text-muted-foreground">You don't have permission to view this page.</p>
          <Link to="/" className="btn-ghost mt-8 inline-block">Home</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="mx-auto max-w-[1200px] px-6 pt-32 pb-24 md:px-12">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Admin</p>
        <h1 className="font-display mt-4 text-4xl font-light tracking-tight md:text-6xl">
          Studio <span className="text-silver">control</span>
        </h1>

        <div className="mt-12 flex gap-8 border-b border-border/40">
          {(["products", "users"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-4 text-[10px] uppercase tracking-[0.3em] transition-colors ${
                tab === t ? "border-b border-foreground text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-12">
          {tab === "products" ? <ProductsAdmin /> : <UsersAdmin />}
        </div>
      </main>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <SiteNav />
      {children}
    </div>
  );
}

/* ---------- Products ---------- */

function ProductsAdmin() {
  const { products, refresh } = useProducts();


  const onCreate = async () => {
    const id = window.prompt("New product slug (e.g. new-tee-002):")?.trim();
    if (!id) return;
    const name = window.prompt("Name:")?.trim() || "Untitled";
    const { error } = await supabase.from("products").insert({
      id, name, category: "", price: 0, price_label: "€0",
      description: "", details: [], sizes: { S: true, M: true, L: true, XL: true },
      sort_order: products.length + 1,
    });
    if (error) toast.error(error.message);
    else { toast.success("Product created"); refresh(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={onCreate} className="btn-ghost inline-flex items-center gap-2">
          <Plus size={14} /> New product
        </button>
      </div>
      <div className="space-y-4">
        {products.map((p) => (
          <ProductRow key={p.id} product={p} onChanged={refresh} />
        ))}
      </div>
    </div>
  );
}

function ProductRow({ product, onChanged }: { product: Product; onChanged: () => void }) {
  const [price, setPrice] = useState(String(product.price));
  const [priceLabel, setPriceLabel] = useState(product.priceLabel);
  const [sizes, setSizes] = useState(product.allSizes);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setPrice(String(product.price)); setPriceLabel(product.priceLabel); setSizes(product.allSizes); }, [product]);

  const toggleSize = (size: string) => {
    setSizes((arr) => arr.map((s) => (s.size === size ? { ...s, available: !s.available } : s)));
  };
  const addSize = () => {
    const s = window.prompt("Add size (e.g. XXL or 38):")?.trim();
    if (!s) return;
    if (sizes.some((x) => x.size === s)) return;
    setSizes((arr) => [...arr, { size: s, available: true }]);
  };
  const removeSize = (size: string) => {
    setSizes((arr) => arr.filter((s) => s.size !== size));
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${product.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
      const { error: updErr } = await supabase.from("products").update({ image_url: pub.publicUrl }).eq("id", product.id);
      if (updErr) throw updErr;
      toast.success("Photo updated");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onSave = async () => {
    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || priceNum < 0) { toast.error("Invalid price"); return; }
    setSaving(true);
    const sizesObj: Record<string, boolean> = {};
    sizes.forEach((s) => { sizesObj[s.size] = s.available; });
    const { error } = await supabase.from("products").update({
      price: priceNum,
      price_label: priceLabel || `€${priceNum}`,
      sizes: sizesObj,
    }).eq("id", product.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else { toast.success("Saved"); onChanged(); }
  };

  const onDelete = async () => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    const { error } = await supabase.from("products").delete().eq("id", product.id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); onChanged(); }
  };

  return (
    <div className="border border-border/40 p-6">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="relative aspect-[4/5] w-32 shrink-0 overflow-hidden bg-secondary">
          <img src={product.img} alt={product.name} className="h-full w-full object-cover" />
          <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-background/60 opacity-0 transition-opacity hover:opacity-100">
            <Upload size={18} />
            <input type="file" accept="image/*" className="hidden" onChange={onUpload} disabled={uploading} />
          </label>
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{product.category || "—"}</p>
              <h3 className="font-display text-xl">{product.name}</h3>
              <p className="text-[10px] text-muted-foreground">{product.id}</p>
            </div>
            <button onClick={onDelete} className="text-muted-foreground hover:text-destructive" title="Delete">
              <Trash2 size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Price (number)">
              <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-transparent border-b border-border/40 py-2 text-sm focus:border-foreground focus:outline-none" />
            </Field>
            <Field label="Price label">
              <input value={priceLabel} onChange={(e) => setPriceLabel(e.target.value)}
                className="w-full bg-transparent border-b border-border/40 py-2 text-sm focus:border-foreground focus:outline-none" />
            </Field>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Sizes (toggle availability)</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {sizes.map((s) => (
                <span key={s.size} className="inline-flex items-center gap-1">
                  <button
                    onClick={() => toggleSize(s.size)}
                    className={`hairline px-4 py-2 text-[11px] uppercase tracking-[0.3em] transition-colors ${
                      s.available ? "border-foreground bg-foreground text-background" : "text-muted-foreground line-through"
                    }`}
                  >
                    {s.size}
                  </button>
                  <button onClick={() => removeSize(s.size)} className="text-muted-foreground hover:text-destructive" title="Remove size">
                    <Trash2 size={12} />
                  </button>
                </span>
              ))}
              <button onClick={addSize} className="hairline px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground">
                + Add
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onSave} disabled={saving} className="btn-ghost disabled:opacity-50">
              {saving ? "Saving…" : "Save changes"}
            </button>
            {uploading && <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Uploading…</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

/* ---------- Users ---------- */

type ProfileRow = {
  id: string;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
};

type RoleRow = { user_id: string; role: string };

function UsersAdmin() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: ps }, { data: rs }] = await Promise.all([
      supabase.from("profiles").select("id,display_name,phone,avatar_url,created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    setProfiles((ps as ProfileRow[]) ?? []);
    setRoles((rs as RoleRow[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const isAdminRow = (uid: string) => roles.some((r) => r.user_id === uid && r.role === "admin");

  const toggleAdmin = async (uid: string) => {
    if (isAdminRow(uid)) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
      if (error) toast.error(error.message); else { toast.success("Admin removed"); load(); }
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "admin" });
      if (error) toast.error(error.message); else { toast.success("Admin granted"); load(); }
    }
  };

  if (loading) return <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{profiles.length} registered</p>
      <div className="border border-border/40">
        {profiles.map((p) => (
          <div key={p.id} className="flex items-center justify-between border-b border-border/40 px-6 py-4 last:border-0">
            <div>
              <p className="font-display text-sm">{p.display_name || "—"}</p>
              <p className="text-[10px] text-muted-foreground">
                {p.phone ? `${p.phone} · ` : ""}{new Date(p.created_at).toLocaleDateString()}
              </p>
              <p className="text-[10px] text-muted-foreground">{p.id}</p>
            </div>
            <button
              onClick={() => toggleAdmin(p.id)}
              className={`hairline px-4 py-2 text-[10px] uppercase tracking-[0.3em] transition-colors ${
                isAdminRow(p.id) ? "border-foreground bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isAdminRow(p.id) ? "Admin" : "Make admin"}
            </button>
          </div>
        ))}
        {profiles.length === 0 && (
          <p className="px-6 py-8 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">No users yet</p>
        )}
      </div>
    </div>
  );
}
