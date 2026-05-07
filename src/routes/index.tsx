import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteNav } from "@/components/site-nav";
import { useReveal } from "@/hooks/use-reveal";
import hero from "@/assets/hero.jpg";
import about from "@/assets/about.jpg";
import pHoodie from "@/assets/product-hoodie.jpg";
import pTee from "@/assets/product-tee.jpg";
import pCargo from "@/assets/product-cargo.jpg";
import pJacket from "@/assets/product-jacket.jpg";
import look1 from "@/assets/look-1.jpg";
import look2 from "@/assets/look-2.jpg";
import look3 from "@/assets/look-3.jpg";
import look4 from "@/assets/look-4.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Late Againg — Lost in time. Found in style." },
      {
        name: "description",
        content:
          "Late Againg — dark streetwear born from 2016 nostalgia. Oversized hoodies, boxy tees, cargo pants and outerwear. Lost in time. Found in style.",
      },
      { property: "og:title", content: "Late Againg" },
      { property: "og:description", content: "Lost in time. Found in style." },
      { property: "og:image", content: hero },
      { name: "twitter:image", content: hero },
    ],
  }),
});

const products = [
  { name: "Midnight Hoodie", category: "Outerwear", price: "€220", img: pHoodie },
  { name: "Boxy Tee 001", category: "Tops", price: "€95", img: pTee },
  { name: "Cargo Pant Noir", category: "Bottoms", price: "€280", img: pCargo },
  { name: "Bomber Eclipse", category: "Outerwear", price: "€520", img: pJacket },
];

const looks = [
  { src: look1, span: "row-span-2" },
  { src: look2, span: "" },
  { src: look3, span: "" },
  { src: look4, span: "row-span-2" },
];

function Index() {
  useReveal();
  return (
    <div className="grain min-h-screen bg-background text-foreground">
      <SiteNav />
      <Hero />
      <Marquee />
      <Collection />
      <Newsletter />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <img
        src={hero}
        alt="Late Againg campaign — figure in dark hoodie on a foggy night street"
        width={1920}
        height={1280}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 vignette" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 text-[10px] uppercase tracking-[0.5em] text-silver opacity-80 reveal">
          FW · MMXVI Archive
        </p>
        <h1 className="font-display text-[18vw] font-light leading-[0.85] tracking-[-0.04em] text-foreground reveal md:text-[10rem]">
          Late <span className="italic text-silver">Againg</span>
        </h1>
        <p className="mt-8 max-w-md text-sm uppercase tracking-[0.3em] text-muted-foreground reveal">
          Lost in time. Found in style.
        </p>
        <a href="#shop" className="btn-ghost mt-12 reveal">
          Shop Now
        </a>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
        scroll ↓
      </div>
    </section>
  );
}

function Marquee() {
  const items = ["Lost in time", "Late Againg", "MMXVI", "Found in style", "After hours", "·"];
  return (
    <div className="border-y border-border/40 bg-background py-5 overflow-hidden">
      <div className="flex whitespace-nowrap marquee">
        {[...items, ...items, ...items, ...items].map((t, i) => (
          <span
            key={i}
            className="font-display mx-10 text-2xl uppercase tracking-[0.25em] text-muted-foreground"
          >
            {t} <span className="mx-6 text-accent">×</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Collection() {
  return (
    <section id="shop" className="mx-auto max-w-[1400px] px-6 py-32 md:px-12">
      <header className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground reveal">
            01 — Collection
          </p>
          <h2 className="font-display mt-4 text-4xl font-light tracking-tight text-foreground reveal md:text-6xl">
            Featured pieces.
          </h2>
        </div>
        <a href="#" className="text-[10px] uppercase tracking-[0.3em] text-silver hover:text-foreground reveal">
          View archive →
        </a>
      </header>

      <div className="grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p, i) => (
          <article key={p.name} className="group reveal" style={{ transitionDelay: `${i * 80}ms` }}>
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
              <img
                src={p.img}
                alt={p.name}
                width={1024}
                height={1280}
                loading="lazy"
                className="h-full w-full object-cover grayscale-[20%] transition-all duration-[1200ms] ease-out group-hover:scale-[1.04] group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="absolute bottom-4 left-4 right-4 translate-y-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <button className="w-full glass hairline px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-foreground">
                  Add to bag
                </button>
              </div>
            </div>
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                  {p.category}
                </p>
                <h3 className="font-display mt-1 text-base text-foreground">{p.name}</h3>
              </div>
              <p className="font-display text-sm text-silver">{p.price}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="relative border-t border-border/40 bg-secondary/40 py-32">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-16 px-6 md:grid-cols-12 md:px-12">
        <div className="md:col-span-5 reveal">
          <div className="aspect-[4/5] overflow-hidden">
            <img
              src={about}
              alt="Late Againg atelier portrait"
              width={1280}
              height={1440}
              loading="lazy"
              className="h-full w-full object-cover grayscale"
            />
          </div>
        </div>

        <div className="md:col-span-7 md:pl-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground reveal">
            02 — Philosophy
          </p>
          <h2 className="font-display mt-6 text-4xl font-light leading-[1.05] tracking-tight text-foreground reveal md:text-6xl">
            A wardrobe for those who arrived <span className="italic text-silver">late</span>—
            and stayed.
          </h2>
          <div className="mt-10 space-y-6 text-base leading-relaxed text-muted-foreground md:max-w-xl">
            <p className="reveal">
              Late Againg is a study in dark minimalism — a love letter to the year 2016,
              when streetwear quietly became luxury. Heavy cottons, washed blacks,
              imperfect seams. Clothing that ages like a memory.
            </p>
            <p className="reveal">
              We design for night people. For the ones still dressed at 4 AM, lost
              somewhere between the city and themselves. Less is more — and silence
              is the loudest thing you can wear.
            </p>
          </div>

          <dl className="mt-14 grid grid-cols-3 gap-6 border-t border-border/40 pt-10 reveal">
            {[
              ["MMXVI", "Founded"],
              ["08", "Drops/yr"],
              ["100%", "Organic cotton"],
            ].map(([k, v]) => (
              <div key={v}>
                <dt className="font-display text-2xl text-foreground md:text-3xl">{k}</dt>
                <dd className="mt-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Lookbook() {
  return (
    <section id="lookbook" className="mx-auto max-w-[1400px] px-6 py-32 md:px-12">
      <header className="mb-16 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground reveal">
            03 — Lookbook
          </p>
          <h2 className="font-display mt-4 text-4xl font-light tracking-tight text-foreground reveal md:text-6xl">
            Campaign · After Hours.
          </h2>
        </div>
        <p className="max-w-xs text-sm text-muted-foreground reveal">
          Shot in available light between 11PM and dawn. No retouching.
        </p>
      </header>

      <div className="grid auto-rows-[28vh] grid-cols-2 gap-3 md:auto-rows-[36vh] md:grid-cols-4 md:gap-4">
        {looks.map((l, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden bg-secondary ${l.span} reveal`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <img
              src={l.src}
              alt={`Lookbook frame ${i + 1}`}
              width={1024}
              height={1280}
              loading="lazy"
              className="h-full w-full object-cover grayscale-[40%] transition-all duration-[1500ms] ease-out group-hover:scale-105 group-hover:grayscale-0"
            />
            <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.3em] text-foreground/80">
              0{i + 1}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section className="relative border-y border-border/40 bg-secondary/30 py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-muted-foreground reveal">
          04 — Newsletter
        </p>
        <h2 className="font-display mt-6 text-4xl font-light tracking-tight text-foreground reveal md:text-6xl">
          Enter the Late Againg <span className="italic text-silver">universe</span>.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-sm text-muted-foreground reveal">
          Drop announcements, archive access, and quiet letters from the studio.
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); if (email) setSent(true); }}
          className="mx-auto mt-12 flex max-w-lg items-center gap-0 border-b border-border reveal"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 bg-transparent px-2 py-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <button
            type="submit"
            className="px-2 py-4 text-[10px] uppercase tracking-[0.3em] text-foreground transition-colors hover:text-accent"
          >
            {sent ? "Welcome →" : "Subscribe →"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer id="contact" className="bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-20 md:px-12">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
          <div className="col-span-2">
            <h3 className="font-display text-3xl font-light tracking-[-0.02em] text-foreground md:text-5xl">
              Late<span className="text-accent">·</span>Againg
            </h3>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Dark streetwear from a quieter year.
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-silver">Navigate</p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li><a href="#shop" className="hover:text-foreground">Shop</a></li>
              <li><a href="mailto:hello@lateagaing.com" className="hover:text-foreground">Contact</a></li>
            </ul>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-silver">Follow</p>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Instagram</a></li>
              <li><a href="#" className="hover:text-foreground">TikTok</a></li>
              <li><a href="#" className="hover:text-foreground">Are.na</a></li>
              <li><a href="#" className="hover:text-foreground">Spotify</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-start justify-between gap-4 border-t border-border/40 pt-8 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex-row md:items-center">
          <p>© MMXXVI Late Againg. All rights reserved.</p>
          <p>Lost in time. Found in style.</p>
        </div>
      </div>
    </footer>
  );
}
