import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "glass border-b border-border/40" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-12">
        <Link to="/" className="font-display text-sm font-medium tracking-[0.35em] text-foreground">
          LATE<span className="text-accent">·</span>AGAING
        </Link>
        <ul className="hidden items-center gap-10 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex">
          <li><a href="#shop" className="transition-colors hover:text-foreground">Shop</a></li>
          <li><a href="#about" className="transition-colors hover:text-foreground">About</a></li>
          <li><a href="#lookbook" className="transition-colors hover:text-foreground">Lookbook</a></li>
          <li><a href="#contact" className="transition-colors hover:text-foreground">Contact</a></li>
        </ul>
        <a href="#shop" className="text-[10px] uppercase tracking-[0.3em] text-foreground">
          Bag <span className="text-muted-foreground">(0)</span>
        </a>
      </nav>
    </header>
  );
}