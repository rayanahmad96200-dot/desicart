import { useState } from "react";
import { Link, useParams } from "wouter";
import {
  ChevronLeft, MessageCircle, ShoppingCart, Star,
  Truck, ShieldCheck, Zap, Search, Menu, User
} from "lucide-react";
import logoImg from "@/assets/desicart-logo.png";
import { useProduct, useProducts, waLinkFor } from "@/lib/products";
import { CustomerOrderForm } from "@/components/CustomerOrderForm";

function MiniNav() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Home", href: "/" },
    { label: "Smart Watches", href: "/product/ultra-3-smartwatch" },
    { label: "Earbuds", href: "/product/airpods-pro-2-black" },
    { label: "Speakers", href: "/product/kts-1185-speaker" },
    { label: "Accessories", href: "/product/super-charger-powerbank" },
    { label: "Support", href: `https://wa.me/923214028277?text=${encodeURIComponent("Hi DesiCart! I need support.")}` },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setOpen((v) => !v)} aria-label="Menu" className="md:hidden text-foreground">
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/">
            <img src={logoImg} alt="DesiCart" className="h-8 sm:h-10 w-auto logo-orange" />
          </Link>
        </div>
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-foreground/80">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="hover:text-accent transition-colors">{link.label}</a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3 sm:gap-4 text-foreground">
          <Link to="/" aria-label="Search products" className="hover:text-accent transition-colors">
            <Search className="h-5 w-5" />
          </Link>
          <a
            href="https://wa.me/923214028277?text=Hi%20DesiCart!%20I%20need%20support."
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Account support"
            className="hidden sm:inline hover:text-accent transition-colors"
          >
            <User className="h-5 w-5" />
          </a>
          <a
            href="https://wa.me/923214028277?text=Hi%20DesiCart!%20I%20want%20to%20place%20an%20order."
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Cart"
            className="relative hover:text-accent transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
          </a>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3">
          <div className="flex flex-col gap-3 text-sm font-semibold text-foreground/80">
            {links.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setOpen(false)} className="py-1 hover:text-accent transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const { product, loading } = useProduct(params.slug);
  const { products } = useProducts();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <MiniNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to shop
          </Link>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 animate-pulse">
            <div className="aspect-square rounded-3xl bg-secondary" />
            <div className="space-y-4">
              <div className="h-6 bg-secondary rounded w-1/3" />
              <div className="h-12 bg-secondary rounded w-3/4" />
              <div className="h-4 bg-secondary rounded w-1/2" />
              <div className="h-8 bg-secondary rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground p-6 text-center">
        <h1 className="font-display text-4xl font-black">Product not found</h1>
        <Link to="/" className="bg-foreground text-background px-6 py-3 rounded-full font-bold">
          Back to Home
        </Link>
      </div>
    );
  }

  const wa = waLinkFor(product.name);
  const related = products.filter((p) => p.slug !== product.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MiniNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to shop
        </Link>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div className="relative bg-hero-gradient rounded-2xl sm:rounded-3xl aspect-square flex items-center justify-center overflow-hidden">
            {product.tag && (
              <span className="absolute top-4 left-4 z-10 text-[10px] uppercase tracking-widest font-bold bg-white text-black px-3 py-1.5 rounded-full">
                {product.tag}
              </span>
            )}
            <div className="absolute h-2/3 w-2/3 rounded-full bg-white/20 blur-3xl" />
            {product.img && (
              <img
                src={product.img}
                alt={product.name}
                width={1024}
                height={1024}
                className="relative z-10 w-3/4 h-3/4 object-contain animate-float drop-shadow-2xl"
              />
            )}
          </div>

          <div className="space-y-5 sm:space-y-6">
            <div>
              <p className="text-accent text-xs font-bold uppercase tracking-widest mb-2">DesiCart Original</p>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-tight">
                {product.name}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-2">{product.tagline}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" style={{ color: "var(--neon-green)" }} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">4.9 · 2,134 reviews</span>
            </div>

            <div className="flex items-end gap-3">
              <span className="font-display text-3xl sm:text-4xl font-black text-foreground">{product.price}</span>
              {product.oldPrice && (
                <span className="text-muted-foreground line-through text-lg">{product.oldPrice}</span>
              )}
            </div>

            <p className="text-foreground/80 text-sm sm:text-base leading-relaxed">{product.description}</p>

            {product.features.length > 0 && (
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground/90">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            <CustomerOrderForm product={product} />

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
              {[
                { icon: Truck, label: "Free Delivery" },
                { icon: ShieldCheck, label: "1Y Warranty" },
                { icon: Zap, label: "Fast Dispatch" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <Icon className="h-5 w-5 text-accent" />
                  <span className="text-[11px] sm:text-xs font-semibold text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-foreground mb-6">You may also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to={`/product/${p.slug}`}
                  className="group bg-card border border-border rounded-2xl p-4 sm:p-6 hover:border-accent/50 transition-all hover:-translate-y-1 flex items-center gap-4"
                >
                  <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                    {p.img && (
                      <img src={p.img} alt={p.name} className="w-3/4 h-3/4 object-contain group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base sm:text-lg font-bold text-foreground truncate">{p.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{p.tagline}</p>
                    <span className="font-display text-base sm:text-lg font-black text-foreground mt-1 inline-block">{p.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-50 h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-whatsapp flex items-center justify-center shadow-2xl animate-pulse-ring hover:scale-110 transition-transform"
      >
        <MessageCircle className="h-6 w-6 sm:h-7 sm:w-7 text-white" fill="white" />
      </a>
    </div>
  );
}
