"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusinessContext } from "@/providers/BusinessProvider";
import {
  ALL_BUSINESS_TYPES,
  BUSINESS_TYPE_LABELS,
  BUSINESS_PROFILES,
  CAPABILITY_LABELS,
  CAPABILITY_DESCRIPTIONS,
  getProfileForBusinessType,
  type Capability,
} from "@/config/business";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Store,
  Scissors,
  Stethoscope,
  ShoppingBag,
  Briefcase,
  Camera,
  GraduationCap,
  Home,
  Building,
  Wrench,
  Globe,
} from "lucide-react";

const STEP_COUNT = 5;

const TYPE_ICONS: Record<string, React.ElementType> = {
  restaurant: Store,
  cafe: Store,
  bakery: Store,
  salon: Scissors,
  barbershop: Scissors,
  clinic: Stethoscope,
  retail: ShoppingBag,
  ecommerce: ShoppingBag,
  agency: Briefcase,
  freelancer: Camera,
  consultant: Briefcase,
  education: GraduationCap,
  real_estate: Home,
  service_business: Wrench,
  portfolio: Camera,
  other: Building,
};

const TYPE_DESCRIPTIONS: Record<string, string> = {
  restaurant: "Food service with dine-in or delivery",
  cafe: "Coffee, drinks, and light bites",
  bakery: "Fresh baked goods and treats",
  salon: "Hair, beauty, and wellness services",
  barbershop: "Haircut and grooming services",
  clinic: "Healthcare and medical services",
  retail: "Physical products and merchandise",
  ecommerce: "Online store and digital sales",
  agency: "Team-based client services",
  freelancer: "Independent professional services",
  consultant: "Expert advice and coaching",
  education: "Teaching and training services",
  real_estate: "Property and housing services",
  service_business: "Local home and business services",
  portfolio: "Showcase your work and skills",
  other: "Something unique — we will adapt",
};

type OnboardingState = {
  step: number;
  businessType: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  enabledModules: Capability[];
};

const INITIAL_STATE: OnboardingState = {
  step: 1,
  businessType: "",
  name: "",
  description: "",
  phone: "",
  email: "",
  enabledModules: [],
};

export default function OnboardingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { refresh, businesses, selected } = useBusinessContext();
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // If business already exists and setup is complete, redirect to dashboard
  useEffect(() => {
    if (selected?.setupComplete) {
      router.push("/dashboard");
    }
  }, [selected, router]);

  // When business type is selected, set default enabled modules
  useEffect(() => {
    if (state.businessType) {
      const profile = getProfileForBusinessType(state.businessType);
      setState((s) => ({ ...s, enabledModules: [...profile.recommended] }));
    }
  }, [state.businessType]);

  const update = (patch: Partial<OnboardingState>) => setState((s) => ({ ...s, ...patch }));

  const canAdvance = () => {
    switch (state.step) {
      case 1: return true;
      case 2: return state.businessType !== "";
      case 3: return state.name.trim().length > 0;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      // Create business with onboarding data
      const biz = await apiClient<any>("/businesses", {
        method: "POST",
        body: {
          name: state.name.trim(),
          description: state.description.trim() || undefined,
          businessType: state.businessType,
          phone: state.phone.trim() || undefined,
          email: state.email.trim() || undefined,
          enabledModules: state.enabledModules,
        },
      });

      // Mark onboarding complete
      await apiClient(`/businesses/${biz.id}/complete-setup`, { method: "PATCH" });

      // Refresh business context
      refresh();

      toast({ title: "Your business is ready!", description: "Welcome to FrontDesk." });
      router.push("/dashboard");
    } catch (err: any) {
      toast({ title: "We couldn't save your setup", description: "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleModule = (cap: Capability) => {
    setState((s) => {
      const profile = getProfileForBusinessType(s.businessType);
      // Don't allow disabling recommended modules
      if (profile.recommended.includes(cap)) return s;
      const modules = s.enabledModules.includes(cap)
        ? s.enabledModules.filter((m) => m !== cap)
        : [...s.enabledModules, cap];
      return { ...s, enabledModules: modules };
    });
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: STEP_COUNT }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                i + 1 < state.step
                  ? "bg-primary text-primary-foreground"
                  : i + 1 === state.step
                  ? "bg-primary/10 text-primary border-2 border-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1 < state.step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < STEP_COUNT - 1 && (
              <div className={`h-0.5 w-8 ${i + 1 < state.step ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {state.step === 1 && <StepWelcome onNext={() => update({ step: 2 })} />}
      {state.step === 2 && (
        <StepBusinessType
          selected={state.businessType}
          onSelect={(t) => update({ businessType: t, step: 3 })}
          onBack={() => update({ step: 1 })}
        />
      )}
      {state.step === 3 && (
        <StepBasics
          name={state.name}
          description={state.description}
          phone={state.phone}
          email={state.email}
          onUpdate={update}
          onNext={() => update({ step: 4 })}
          onBack={() => update({ step: 2 })}
        />
      )}
      {state.step === 4 && (
        <StepFeatures
          businessType={state.businessType}
          enabledModules={state.enabledModules}
          onToggle={toggleModule}
          onNext={() => update({ step: 5 })}
          onBack={() => update({ step: 3 })}
        />
      )}
      {state.step === 5 && (
        <StepSummary
          state={state}
          onComplete={handleComplete}
          onBack={() => update({ step: 4 })}
          saving={submitting}
        />
      )}
    </div>
  );
}

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Let&apos;s set up your business</CardTitle>
        <CardDescription className="text-base">
          We&apos;ll personalize your workspace based on what you do. It only takes a minute.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button size="lg" onClick={onNext}>
          Get started <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function StepBusinessType({
  selected,
  onSelect,
  onBack,
}: {
  selected: string;
  onSelect: (type: string) => void;
  onBack: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What type of business do you run?</CardTitle>
        <CardDescription>Pick the closest match. We&apos;ll set things up for you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {ALL_BUSINESS_TYPES.map((type) => {
            const Icon = TYPE_ICONS[type] || Building;
            const isSelected = selected === type;
            return (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all hover:bg-muted/50 ${
                  isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                }`}
              >
                <div className={`rounded-md p-2 ${isSelected ? "bg-primary/10" : "bg-muted"}`}>
                  <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{BUSINESS_TYPE_LABELS[type]}</div>
                  <div className="text-xs text-muted-foreground">{TYPE_DESCRIPTIONS[type]}</div>
                </div>
                {isSelected && <Check className="mt-1 h-4 w-4 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>
        <div className="flex justify-start pt-2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StepBasics({
  name,
  description,
  phone,
  email,
  onUpdate,
  onNext,
  onBack,
}: {
  name: string;
  description: string;
  phone: string;
  email: string;
  onUpdate: (patch: Partial<OnboardingState>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tell us about your business</CardTitle>
        <CardDescription>The basics — you can always add more later.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="biz-name">What&apos;s your business called? *</Label>
          <Input
            id="biz-name"
            value={name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="e.g. Royal Bakes, Style Studio"
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="biz-desc">Tell customers a little about your business</Label>
          <Textarea
            id="biz-desc"
            value={description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="What do customers love about you?"
            rows={3}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="biz-phone">Phone</Label>
            <Input
              id="biz-phone"
              value={phone}
              onChange={(e) => onUpdate({ phone: e.target.value })}
              placeholder="+91 ..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="biz-email">Email</Label>
            <Input
              id="biz-email"
              type="email"
              value={email}
              onChange={(e) => onUpdate({ email: e.target.value })}
              placeholder="hello@..."
            />
          </div>
        </div>
        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={onNext} disabled={!name.trim()}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StepFeatures({
  businessType,
  enabledModules,
  onToggle,
  onNext,
  onBack,
}: {
  businessType: string;
  enabledModules: Capability[];
  onToggle: (cap: Capability) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const profile = getProfileForBusinessType(businessType);
  const recommended = profile.recommended;
  const optional = profile.optional;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose the tools you need</CardTitle>
        <CardDescription>
          We&apos;ve picked what&apos;s best for a {BUSINESS_TYPE_LABELS[businessType] || "business"}. Toggle any off if you don&apos;t need it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recommended */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground">Recommended for you</h3>
          <div className="space-y-2">
            {recommended.map((cap) => (
              <div key={cap} className="flex items-center justify-between rounded-md border p-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{CAPABILITY_LABELS[cap]}</div>
                  <div className="text-xs text-muted-foreground">{CAPABILITY_DESCRIPTIONS[cap]}</div>
                </div>
                <Switch
                  checked={enabledModules.includes(cap)}
                  onCheckedChange={() => onToggle(cap)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Optional */}
        {optional.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">More tools</h3>
            <div className="space-y-2">
              {optional.map((cap) => (
                <div key={cap} className="flex items-center justify-between rounded-md border p-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{CAPABILITY_LABELS[cap]}</div>
                    <div className="text-xs text-muted-foreground">{CAPABILITY_DESCRIPTIONS[cap]}</div>
                  </div>
                  <Switch
                    checked={enabledModules.includes(cap)}
                    onCheckedChange={() => onToggle(cap)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button onClick={onNext}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StepSummary({
  state,
  onComplete,
  onBack,
  saving,
}: {
  state: OnboardingState;
  onComplete: () => void;
  onBack: () => void;
  saving: boolean;
}) {
  const profile = getProfileForBusinessType(state.businessType);

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Globe className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Your FrontDesk setup</CardTitle>
        <CardDescription>Here&apos;s what you&apos;ll get. Looks good?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
          <div className="text-sm font-medium">{state.name}</div>
          <div className="text-xs text-muted-foreground">{BUSINESS_TYPE_LABELS[state.businessType]}</div>
          {state.description && (
            <div className="text-xs text-muted-foreground">{state.description}</div>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium">You&apos;ll have:</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {state.enabledModules.map((cap) => (
              <div key={cap} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600" />
                {CAPABILITY_LABELS[cap]}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={onBack} disabled={saving}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
          <Button onClick={onComplete} disabled={saving}>
            {saving ? "Setting things up..." : "Looks good — let's go!"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
