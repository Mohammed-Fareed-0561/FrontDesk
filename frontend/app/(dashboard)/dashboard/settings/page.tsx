"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/providers/AuthProvider";
import { useBusiness } from "@/hooks/useBusiness";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import type { BusinessMemory } from "@/types";
import { Shield, User, Building2, Bell, Key, LogOut, Brain, Trash2, Plus } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { selectedId } = useBusiness();
  const businessId = selectedId;
  const [memories, setMemories] = useState<BusinessMemory[]>([]);
  const [newMemory, setNewMemory] = useState("");
  const [newMemoryType, setNewMemoryType] = useState("business_rule");

  useEffect(() => {
    if (!businessId) return;
    apiClient<BusinessMemory[]>(`/businesses/${businessId}/memory`).then(setMemories).catch(() => {});
  }, [businessId]);

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !newMemory.trim()) return;
    try {
      const m = await apiClient<BusinessMemory>(`/businesses/${businessId}/memory`, { method: "POST", body: { content: newMemory, memoryType: newMemoryType } });
      setMemories((prev) => [m, ...prev]);
      setNewMemory("");
      toast({ title: "Memory added", description: "Copilot will respect this going forward" });
    } catch (err: any) {
      toast({ title: "Could not add", description: err.message });
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!businessId) return;
    try {
      await apiClient(`/businesses/${businessId}/memory/${id}`, { method: "DELETE" });
      setMemories((prev) => prev.filter((m) => m.id !== id));
      toast({ title: "Memory removed" });
    } catch (err: any) {
      toast({ title: "Could not delete", description: err.message });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Account, business memory and safety. Simple, not enterprise-complex.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Account</CardTitle><CardDescription>Signed in as {user?.email}</CardDescription></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium">{user?.displayName?.[0] || user?.email[0].toUpperCase()}</div><div><div className="font-medium">{user?.displayName || "Owner"}</div><div className="text-muted-foreground">{user?.email}</div></div><Badge variant="outline" className="ml-auto">Owner</Badge></div>
              <Separator />
              <Button variant="outline" onClick={logout}><LogOut className="mr-2 h-4 w-4" /> Sign out</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-4 w-4" /> Business Memory</CardTitle><CardDescription>Teach FrontDesk how you work. Copilot will follow these — e.g. language, discount rules, tone.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleAddMemory} className="space-y-3">
                <div className="grid gap-2">
                  <Label>New memory</Label>
                  <Textarea value={newMemory} onChange={(e) => setNewMemory(e.target.value)} placeholder="Never discount premium cakes more than 10% without approval. Always reply in Tamil + English." rows={2} />
                </div>
                <div className="flex gap-2">
                  <select value={newMemoryType} onChange={(e) => setNewMemoryType(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
                    <option value="business_rule">Business rule</option>
                    <option value="communication_preference">Communication</option>
                    <option value="brand_preference">Brand</option>
                    <option value="operational_preference">Operations</option>
                  </select>
                  <Button type="submit"><Plus className="mr-2 h-4 w-4" /> Add</Button>
                </div>
              </form>
              <Separator />
              <div className="space-y-2">
                {memories.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No memories yet. Add one — it helps Copilot be accurate.</p> : memories.map((m) => (
                  <div key={m.id} className="flex items-start justify-between rounded-md border p-3">
                    <div className="min-w-0"><div className="text-sm">{m.content}</div><div className="mt-1 flex gap-2"><Badge variant="outline">{m.memoryType}</Badge><span className="text-xs text-muted-foreground">{m.source} · {new Date(m.createdAt).toLocaleDateString("en-IN")}</span></div></div>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteMemory(m.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Safety</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-md bg-muted p-3">Business data is the source of truth — AI only proposes, you approve. High-impact actions (price changes, deletes) need approval.</div>
              <div className="flex items-center gap-2 text-muted-foreground"><Key className="h-4 w-4" /> JWT auth, tenant isolation, Zod validation</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Workspace</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">One workspace per business for v0.1. Team invites and roles (manager, staff) coming next.</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle></CardHeader>
            <CardContent className="text-sm text-muted-foreground">In-app toasts for now. Email/WhatsApp notifications behind provider abstraction — add when needed.</CardContent>
          </Card>
          <Card className="border-destructive/20">
            <CardHeader><CardTitle className="text-destructive text-base">Danger zone</CardTitle></CardHeader>
            <CardContent><Button variant="destructive" disabled>Delete business (coming soon)</Button><p className="mt-2 text-xs text-muted-foreground">Requires confirmation + audit log. Not yet enabled for safety.</p></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
