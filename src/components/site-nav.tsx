import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useIsAdmin } from "@/hooks/use-is-admin";

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  const { count } = useCart();
  const { isAdmin } = useIsAdmin();
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
          LATE AGAIN
        </Link>
        <ul className="hidden items-center gap-10 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex">
          <li><a href="#shop" className="transition-colors hover:text-foreground">Shop</a></li>
          <li><a href="#contact" className="transition-colors hover:text-foreground">Contact</a></li>
        </ul>
        <div className="flex items-center gap-6">
          {isAdmin && (
            <Link to="/admin" className="text-[10px] uppercase tracking-[0.3em] text-accent transition-colors hover:text-foreground">
              Admin
            </Link>
          )}
          <Link to="/bag" className="text-[10px] uppercase tracking-[0.3em] text-foreground transition-colors hover:text-silver">
            Bag <span className="text-muted-foreground">({count})</span>
          </Link>
          <Link
            to="/account"
            aria-label={user ? "Account" : "Sign in"}
            className="flex items-center gap-2 text-foreground transition-colors hover:text-silver"
          >
            <User size={16} strokeWidth={1.25} />
            <span className="hidden text-[10px] uppercase tracking-[0.3em] sm:inline">
              {user ? "Account" : "Sign in"}
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}