"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/api/client";
import type { Business } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { useBusinessContext } from "@/providers/BusinessProvider";
import { ALL_BUSINESS_TYPES, BUSINESS_TYPE_LABELS } from "@/config/business";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Save,
  Plus,
  Clock,
  ExternalLink,
  CheckCircle2,
  Store,
  Sparkles,
  Copy,
  Sliders,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface BusinessLocationData {
  id?: string;
  name?: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  isPrimary?: boolean;
}

interface BusinessHourData {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

const DEFAULT_HOURS: BusinessHourData[] = [
  { dayOfWeek: 0, openTime: "09:00", closeTime: "17:00", isClosed: true }, // Sun
  { dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", isClosed: false }, // Mon
  { dayOfWeek: 2, openTime: "09:00", closeTime: "18:00", isClosed: false }, // Tue
  { dayOfWeek: 3, openTime: "09:00", closeTime: "18:00", isClosed: false }, // Wed
  { dayOfWeek: 4, openTime: "09:00", closeTime: "18:00", isClosed: false }, // Thu
  { dayOfWeek: 5, openTime: "09:00", closeTime: "19:00", isClosed: false }, // Fri
  { dayOfWeek: 6, openTime: "10:00", closeTime: "16:00", isClosed: false }, // Sat
];

export default function BusinessPage() {
  const { toast } = useToast();
  const { businesses, selected, selectedId, selectBusiness, refresh, loading: bizLoading } = useBusinessContext();

  const [activeTab, setActiveTab] = useState<"overview" | "location" | "hours" | "brand">("overview");

  // Overview form
  const [form, setForm] = useState({
    name: "",
    description: "",
    businessType: "",
    industry: "",
    phone: "",
    email: "",
    websiteUrl: "",
    currency: "USD",
    timezone: "UTC",
    slug: "",
  });

  // Location form
  const [locationForm, setLocationForm] = useState<BusinessLocationData>({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "USA",
    phone: "",
    email: "",
  });

  // Operating Hours form
  const [hoursForm, setHoursForm] = useState<BusinessHourData[]>(DEFAULT_HOURS);

  const [savingOverview, setSavingOverview] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fetch full details (location & hours) when selected business changes
  useEffect(() => {
    if (selected) {
      setForm({
        name: selected.name || "",
        description: selected.description || "",
        businessType: selected.businessType || "",
        industry: selected.industry || "",
        phone: selected.phone || "",
        email: selected.email || "",
        websiteUrl: selected.websiteUrl || "",
        currency: selected.currency || "USD",
        timezone: selected.timezone || "UTC",
        slug: selected.slug || "",
      });

      apiClient<any>(`/businesses/${selected.id}`)
        .then((data) => {
          // Sync location
          if (data.locations && data.locations.length > 0) {
            const primaryLoc = data.locations.find((l: any) => l.isPrimary) || data.locations[0];
            setLocationForm({
              id: primaryLoc.id,
              addressLine1: primaryLoc.addressLine1 || "",
              addressLine2: primaryLoc.addressLine2 || "",
              city: primaryLoc.city || "",
              state: primaryLoc.state || "",
              postalCode: primaryLoc.postalCode || "",
              country: primaryLoc.country || "USA",
              phone: primaryLoc.phone || selected.phone || "",
              email: primaryLoc.email || selected.email || "",
            });
          } else {
            setLocationForm({
              addressLine1: "",
              addressLine2: "",
              city: "",
              state: "",
              postalCode: "",
              country: "USA",
              phone: selected.phone || "",
              email: selected.email || "",
            });
          }

          // Sync operating hours
          if (data.hours && data.hours.length > 0) {
            const merged = DEFAULT_HOURS.map((def) => {
              const existing = data.hours.find((h: any) => h.dayOfWeek === def.dayOfWeek);
              return existing
                ? {
                    dayOfWeek: existing.dayOfWeek,
                    openTime: existing.openTime || "09:00",
                    closeTime: existing.closeTime || "17:00",
                    isClosed: existing.isClosed ?? false,
                  }
                : def;
            });
            setHoursForm(merged);
          } else {
            setHoursForm(DEFAULT_HOURS);
          }
        })
        .catch((err) => {
          console.warn("Could not fetch full business details:", err);
        });
    }
  }, [selected]);

  const handleSaveOverview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSavingOverview(true);
    try {
      const updated = await apiClient<Business>(`/businesses/${selected.id}`, { method: "PATCH", body: form });
      toast({ title: "Business profile updated", description: `${updated.name} changes saved.` });
      await refresh();
    } catch (err: any) {
      toast({ title: "Could not save overview", description: err.message, variant: "destructive" });
    } finally {
      setSavingOverview(false);
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSavingLocation(true);
    try {
      await apiClient(`/businesses/${selected.id}/location`, { method: "PUT", body: locationForm });
      toast({ title: "Location saved", description: "Primary location & contact information updated." });
      await refresh();
    } catch (err: any) {
      toast({ title: "Could not save location", description: err.message, variant: "destructive" });
    } finally {
      setSavingLocation(false);
    }
  };

  const handleSaveHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSavingHours(true);
    try {
      await apiClient(`/businesses/${selected.id}/hours`, { method: "PUT", body: { hours: hoursForm } });
      toast({ title: "Operating hours updated", description: "Weekly schedule successfully published." });
    } catch (err: any) {
      toast({ title: "Could not save hours", description: err.message, variant: "destructive" });
    } finally {
      setSavingHours(false);
    }
  };

  const copyMondayToWeekdays = () => {
    const monday = hoursForm.find((h) => h.dayOfWeek === 1);
    if (!monday) return;
    setHoursForm((prev) =>
      prev.map((h) => (h.dayOfWeek >= 1 && h.dayOfWeek <= 5 ? { ...h, openTime: monday.openTime, closeTime: monday.closeTime, isClosed: monday.isClosed } : h))
    );
    toast({ title: "Copied schedule", description: "Monday hours copied to Monday through Friday." });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await apiClient<Business>("/businesses", { method: "POST", body: form });
      toast({ title: "Business created", description: `${created.name} workspace is ready.` });
      await refresh();
      selectBusiness(created.id);
    } catch (err: any) {
      toast({ title: "Could not create business", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  if (bizLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Setup Your Business</h1>
          <p className="text-sm text-muted-foreground">Create your first business profile to launch your digital storefront and operating system.</p>
        </div>
        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Building2 className="h-5 w-5" /> Business Details
            </CardTitle>
            <CardDescription>We&apos;ll set up a workspace, catalog starter, and website canvas for you.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Business name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Royal Bakery" />
                </div>
                <div className="space-y-2">
                  <Label>Business type</Label>
                  <select
                    value={form.businessType}
                    onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select type...</option>
                    {ALL_BUSINESS_TYPES.map((t: string) => (
                      <option key={t} value={t}>
                        {BUSINESS_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell customers what makes your business special..." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Phone number</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-2">
                  <Label>Email address</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="contact@business.com" />
                </div>
              </div>
              <Button type="submit" disabled={creating} className="w-full bg-indigo-600 hover:bg-indigo-700">
                {creating ? "Creating Business..." : "Create Business Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Business Profile</h1>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
              {BUSINESS_TYPE_LABELS[selected?.businessType || "other"] || selected?.businessType || "Business"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your operating system profile, location, operating hours, and live customer touchpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selected?.slug && (
            <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
              <Link href={`/b/${selected.slug}`} target="_blank">
                <Globe className="h-3.5 w-3.5 text-indigo-600" /> View Storefront
                <ExternalLink className="h-3 w-3 opacity-60 ml-0.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b pb-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "overview"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Building2 className="h-4 w-4" /> Overview &amp; Identity
        </button>
        <button
          onClick={() => setActiveTab("location")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "location"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <MapPin className="h-4 w-4" /> Location &amp; Contact
        </button>
        <button
          onClick={() => setActiveTab("hours")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "hours"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Clock className="h-4 w-4" /> Operating Hours
        </button>
        <button
          onClick={() => setActiveTab("brand")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap",
            activeTab === "brand"
              ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Sparkles className="h-4 w-4" /> Brand &amp; Storefront
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Active Tab Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* TAB 1: OVERVIEW & IDENTITY */}
          {activeTab === "overview" && selected && (
            <Card className="shadow-xs">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-600" /> Business Identity
                </CardTitle>
                <CardDescription className="text-xs">
                  Basic details that identify your business across the website builder, AI Copilot, and receipts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveOverview} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Business name *</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Business Type</Label>
                      <select
                        value={form.businessType}
                        onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                        className="h-9 w-full rounded-md border bg-background px-3 text-xs"
                      >
                        <option value="">Select type...</option>
                        {ALL_BUSINESS_TYPES.map((t: string) => (
                          <option key={t} value={t}>
                            {BUSINESS_TYPE_LABELS[t]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Business Description</Label>
                    <Textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe your offerings, specialty, and story..."
                      className="text-xs"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Industry</Label>
                      <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Food & Beverage" className="text-xs" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Public Handle / Slug</Label>
                      <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-business" className="text-xs font-mono" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Currency</Label>
                      <Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} placeholder="USD" className="text-xs uppercase" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Timezone</Label>
                      <Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} placeholder="UTC" className="text-xs" />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" size="sm" disabled={savingOverview} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
                      <Save className="h-3.5 w-3.5" />
                      {savingOverview ? "Saving..." : "Save Overview"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB 2: LOCATION & CONTACT */}
          {activeTab === "location" && selected && (
            <Card className="shadow-xs">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-600" /> Primary Location &amp; Contact
                </CardTitle>
                <CardDescription className="text-xs">
                  Physical location and contact info shown to customers on your website and maps.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveLocation} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Street Address Line 1</Label>
                    <Input
                      value={locationForm.addressLine1}
                      onChange={(e) => setLocationForm({ ...locationForm, addressLine1: e.target.value })}
                      placeholder="123 Main Street"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Address Line 2 (Suite / Unit)</Label>
                    <Input
                      value={locationForm.addressLine2}
                      onChange={(e) => setLocationForm({ ...locationForm, addressLine2: e.target.value })}
                      placeholder="Suite 400"
                      className="text-xs"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">City</Label>
                      <Input
                        value={locationForm.city}
                        onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                        placeholder="New York"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">State / Province</Label>
                      <Input
                        value={locationForm.state}
                        onChange={(e) => setLocationForm({ ...locationForm, state: e.target.value })}
                        placeholder="NY"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Postal / Zip Code</Label>
                      <Input
                        value={locationForm.postalCode}
                        onChange={(e) => setLocationForm({ ...locationForm, postalCode: e.target.value })}
                        placeholder="10001"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Country</Label>
                      <Input
                        value={locationForm.country}
                        onChange={(e) => setLocationForm({ ...locationForm, country: e.target.value })}
                        placeholder="USA"
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Business Phone</Label>
                      <Input
                        value={locationForm.phone}
                        onChange={(e) => setLocationForm({ ...locationForm, phone: e.target.value })}
                        placeholder="+1 (555) 019-2831"
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Business Public Email</Label>
                    <Input
                      type="email"
                      value={locationForm.email}
                      onChange={(e) => setLocationForm({ ...locationForm, email: e.target.value })}
                      placeholder="info@mybusiness.com"
                      className="text-xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" size="sm" disabled={savingLocation} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
                      <Save className="h-3.5 w-3.5" />
                      {savingLocation ? "Saving Location..." : "Save Location Details"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB 3: OPERATING HOURS */}
          {activeTab === "hours" && selected && (
            <Card className="shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4 text-indigo-600" /> Weekly Operating Hours
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Set your business hours to manage customer expectations and automated booking availability.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" type="button" onClick={copyMondayToWeekdays} className="text-xs gap-1">
                  <Copy className="h-3 w-3" /> Copy Mon to Weekdays
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveHours} className="space-y-3">
                  {DAYS_OF_WEEK.map((dayName, idx) => {
                    const hourObj = hoursForm.find((h) => h.dayOfWeek === idx) || { dayOfWeek: idx, openTime: "09:00", closeTime: "17:00", isClosed: false };
                    return (
                      <div key={dayName} className="flex items-center justify-between gap-4 p-2.5 rounded-lg border bg-muted/20">
                        <div className="w-28 flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{dayName}</span>
                        </div>

                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">{hourObj.isClosed ? "Closed" : "Open"}</span>
                            <Switch
                              checked={!hourObj.isClosed}
                              onCheckedChange={(checked) => {
                                setHoursForm((prev) =>
                                  prev.map((h) => (h.dayOfWeek === idx ? { ...h, isClosed: !checked } : h))
                                );
                              }}
                            />
                          </div>

                          {!hourObj.isClosed ? (
                            <div className="flex items-center gap-1.5">
                              <Input
                                type="time"
                                value={hourObj.openTime}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setHoursForm((prev) =>
                                    prev.map((h) => (h.dayOfWeek === idx ? { ...h, openTime: val } : h))
                                  );
                                }}
                                className="h-8 w-24 text-xs font-mono px-2"
                              />
                              <span className="text-xs text-muted-foreground">to</span>
                              <Input
                                type="time"
                                value={hourObj.closeTime}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setHoursForm((prev) =>
                                    prev.map((h) => (h.dayOfWeek === idx ? { ...h, closeTime: val } : h))
                                  );
                                }}
                                className="h-8 w-24 text-xs font-mono px-2"
                              />
                            </div>
                          ) : (
                            <div className="w-52 text-right text-xs text-muted-foreground italic px-2">
                              Closed all day
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex gap-2 pt-3">
                    <Button type="submit" size="sm" disabled={savingHours} className="bg-indigo-600 hover:bg-indigo-700 gap-1.5">
                      <Save className="h-3.5 w-3.5" />
                      {savingHours ? "Saving Hours..." : "Publish Operating Hours"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB 4: BRAND & STOREFRONT PREVIEW */}
          {activeTab === "brand" && selected && (
            <Card className="shadow-xs">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600" /> Brand &amp; Customer Preview
                </CardTitle>
                <CardDescription className="text-xs">
                  Customize your storefront theme accent and preview how your business badge appears publicly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl border bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
                    Live Storefront Card Preview
                  </span>
                  <div className="p-4 rounded-xl border bg-card shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                          {selected.name ? selected.name[0].toUpperCase() : "B"}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-foreground">{selected.name}</h3>
                          <p className="text-xs text-muted-foreground">{locationForm.city ? `${locationForm.city}, ${locationForm.country}` : "Location not set"}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Open Now
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {selected.description || "No description provided yet."}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{locationForm.phone || selected.phone || "No phone"}</span>
                      </div>
                      <Link href={`/b/${selected.slug}`} target="_blank" className="text-indigo-600 font-medium hover:underline flex items-center gap-1">
                        Visit Page <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Quick Link to Customize Web Designer</Label>
                  <p className="text-xs text-muted-foreground">
                    Customize your entire website layout, header, footer, colors, and components in the Canvas Editor.
                  </p>
                  <Button variant="outline" size="sm" asChild className="gap-2 text-xs">
                    <Link href="/dashboard/website">
                      <Sliders className="h-3.5 w-3.5 text-indigo-600" /> Open Website Designer Studio
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right 1 Column: At a Glance Card & Quick Actions */}
        <div className="space-y-6">
          <Card className="shadow-xs border-indigo-100 dark:border-indigo-950">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>At a Glance</span>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Business Name
                </span>
                <span className="font-semibold text-foreground">{selected?.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5" /> Business Type
                </span>
                {/* DO NOT EDIT BADGE PARSING - REQUIRED FOR E2E COMPATIBILITY */}
                <Badge variant="outline" className="ml-auto">
                  {BUSINESS_TYPE_LABELS[selected?.businessType || "other"] || selected?.businessType || "business"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Phone
                </span>
                <span className="font-medium">{selected?.phone || locationForm.phone || "Not specified"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> Email
                </span>
                <span className="font-medium truncate max-w-[140px]">{selected?.email || locationForm.email || "Not specified"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Location
                </span>
                <span className="font-medium truncate max-w-[140px]">
                  {locationForm.city ? `${locationForm.city}, ${locationForm.country}` : "Not configured"}
                </span>
              </div>

              <Separator />

              <div className="space-y-1">
                <span className="text-muted-foreground block text-[11px]">Public Storefront URL</span>
                <Link
                  href={`/b/${selected?.slug}`}
                  target="_blank"
                  className="text-indigo-600 font-mono text-[11px] underline break-all block"
                >
                  {typeof window !== "undefined" ? window.location.origin : ""}/b/{selected?.slug}
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Setup Actions */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold">Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <Link
                href="/dashboard/importer"
                className="flex items-center justify-between rounded-lg border p-2.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950 flex items-center justify-center font-bold">1</div>
                  <span>Import Menu / Catalog</span>
                </div>
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/dashboard/catalog"
                className="flex items-center justify-between rounded-lg border p-2.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950 flex items-center justify-center font-bold">2</div>
                  <span>Review Catalog &amp; Items</span>
                </div>
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
              <Link
                href="/dashboard/website"
                className="flex items-center justify-between rounded-lg border p-2.5 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950 flex items-center justify-center font-bold">3</div>
                  <span>Customize &amp; Publish Website</span>
                </div>
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
