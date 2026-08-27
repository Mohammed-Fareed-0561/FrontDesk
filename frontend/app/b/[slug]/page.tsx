import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, MessageCircle, ShoppingBag, Star, Globe } from "lucide-react";

async function getBusiness(slug: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
  const res = await fetch(`${base}/public/businesses/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

async function getProducts(slug: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
  const res = await fetch(`${base}/public/businesses/${slug}/products`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data as any[];
}

async function getWebsite(slug: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
  const res = await fetch(`${base}/public/businesses/${slug}/website`, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data;
}

export default async function PublicBusinessPage({ params }: { params: { slug: string } }) {
  const business = await getBusiness(params.slug);
  if (!business) return notFound();
  const [products, websiteData] = await Promise.all([getProducts(params.slug), getWebsite(params.slug)]);

  const website = websiteData?.website;
  const hero = website?.pages?.[0]?.sections?.find((s: any) => s.sectionType === "hero");
  const heroContent = hero ? JSON.parse(hero.content) : null;

  const waNumber = business.phone ? business.phone.replace(/[^0-9]/g, "") : "";
  const waLink = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi ${business.name}, I found you on FrontDesk and would like to enquire.`)}` : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">{business.name[0]}</div>
            <span className="font-semibold">{business.name}</span>
            <Badge variant="outline" className="hidden sm:inline-flex">{business.businessType || "business"}</Badge>
          </div>
          {waLink && (
            <Button asChild size="sm" className="rounded-full">
              <a href={waLink} target="_blank" rel="noopener noreferrer"><MessageCircle className="mr-2 h-4 w-4" /> WhatsApp</a>
            </Button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}>
          <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-2 md:items-center">
            <div>
              <Badge className="bg-white/20 text-white hover:bg-white/20">Open now · {business.timezone}</Badge>
              <h1 className="mt-3 text-3xl font-bold leading-tight">{heroContent?.heading || business.name}</h1>
              <p className="mt-2 text-white/80">{heroContent?.subheading || business.description || "Fresh, local, made with care — order or enquire on WhatsApp."}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {waLink && <Button asChild className="bg-white text-slate-900 hover:bg-white/90"><a href={waLink} target="_blank">Contact on WhatsApp</a></Button>}
                <Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10"><a href="#menu">View menu</a></Button>
              </div>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4" /> {business.locations?.[0]?.addressLine1 || "Anna Nagar, Chennai"}</div>
              <div className="mt-2 flex items-center gap-2 text-sm"><Phone className="h-4 w-4" /> {business.phone || "Add phone in dashboard"}</div>
              <div className="mt-2 flex items-center gap-2 text-sm"><Mail className="h-4 w-4" /> {business.email || "—"}</div>
              <div className="mt-4 rounded-md bg-white p-3 text-slate-900">
                <div className="text-xs font-medium text-muted-foreground">Public page</div>
                <div className="font-mono text-sm">/b/{business.slug}</div>
                <div className="text-xs text-muted-foreground">Powered by FrontDesk</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <section id="menu" className="mx-auto max-w-5xl px-4 py-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> Menu & Products</h2>
          <Badge variant="secondary">{products.length} items</Badge>
        </div>
        {products.length === 0 ? (
          <Card className="mt-4"><CardContent className="py-12 text-center text-sm text-muted-foreground">No products published yet. Check back soon.</CardContent></Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <Card key={p.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                <div className="aspect-[4/3] bg-muted flex items-center justify-center"><ShoppingBag className="h-8 w-8 text-muted-foreground" /></div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium leading-tight">{p.name}</h3>
                    <span className="font-semibold whitespace-nowrap">{p.price != null ? `₹${p.price}` : "—"}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description || "No description"}</p>
                  <div className="mt-3 flex items-center gap-2">
                    {p.category && <Badge variant="outline">{p.category.name}</Badge>}
                    <Badge variant={p.availability === "available" ? "success" : "secondary"} className="ml-auto">{p.availability}</Badge>
                  </div>
                  {waLink && <Button asChild size="sm" className="mt-3 w-full"><a href={`${waLink}&text=${encodeURIComponent(`Hi, I’d like to enquire about ${p.name}`)}`} target="_blank">Enquire <MessageCircle className="ml-2 h-3 w-3" /></a></Button>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* About + Contact */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold flex items-center gap-2"><Globe className="h-4 w-4" /> About us</h3>
              <p className="mt-2 text-sm text-muted-foreground">{business.description || "We’re a local business focused on quality and service."}</p>
              <div className="mt-4 flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-muted-foreground" /> 9:00 AM – 9:00 PM · All days</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold">Visit & contact</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" /><span>{business.locations?.[0]?.addressLine1 || "12 Anna Nagar"}, {business.locations?.[0]?.city || "Chennai"} {business.locations?.[0]?.postalCode || ""}</span></div>
                <div className="flex gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{business.phone || "—"}</div>
                <div className="flex gap-2"><Mail className="h-4 w-4 text-muted-foreground" />{business.email || "—"}</div>
              </div>
              <div className="mt-4 h-32 rounded-md border bg-muted flex items-center justify-center text-sm text-muted-foreground">Map placeholder</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© {new Date().getFullYear()} {business.name} · Powered by FrontDesk</span>
          <Link href="/login" className="underline">Business login</Link>
        </div>
      </footer>
    </div>
  );
}
