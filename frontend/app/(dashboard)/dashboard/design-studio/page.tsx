"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { apiClient } from "@/lib/api/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  Plus,
  LayoutTemplate,
  Layers,
  Loader2,
  ArrowUpCircle,
  Archive,
  Trash2,
  FileText,
} from "lucide-react";
import type { CreatorProfile, WebsiteTemplate, SectionPack } from "@/types";

export default function DesignStudioPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileSlug, setProfileSlug] = useState("");
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<"templates" | "packs">("templates");

  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const data = await apiClient<CreatorProfile | null>("/creator/profile");
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleCreateProfile = async () => {
    if (!profileName.trim() || !profileSlug.trim()) return;
    setCreatingProfile(true);
    try {
      const data = await apiClient<CreatorProfile>("/creator/profile", {
        method: "POST",
        body: { displayName: profileName, slug: profileSlug },
      });
      setProfile(data);
      setShowCreateProfile(false);
      toast({ title: "Creator profile created" });
    } catch (error: any) {
      toast({ title: "Could not create profile", description: error.message });
    } finally {
      setCreatingProfile(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Design Studio</h1>
          <p className="text-muted-foreground">Create and publish design templates for the marketplace.</p>
        </div>
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <LayoutTemplate className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="font-semibold">Become a Creator</h3>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Create a creator profile to start building templates and section packs for the marketplace.
            </p>
            <Dialog open={showCreateProfile} onOpenChange={setShowCreateProfile}>
              <DialogTrigger asChild>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Creator Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Creator Profile</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="profile-name">Display Name</Label>
                    <Input
                      id="profile-name"
                      value={profileName}
                      onChange={(e) => {
                        setProfileName(e.target.value);
                        if (!profileSlug) setProfileSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                      }}
                      placeholder="Your Creator Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-slug">Slug</Label>
                    <Input
                      id="profile-slug"
                      value={profileSlug}
                      onChange={(e) => setProfileSlug(e.target.value)}
                      placeholder="your-creator-name"
                    />
                  </div>
                  <Button onClick={handleCreateProfile} disabled={creatingProfile || !profileName.trim() || !profileSlug.trim()}>
                    {creatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Profile
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Design Studio</h1>
        <p className="text-muted-foreground">
          Welcome back, {profile.displayName}. Create and publish design assets.
        </p>
      </div>

      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "templates"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutTemplate className="h-4 w-4" />
          My Templates
        </button>
        <button
          onClick={() => setActiveTab("packs")}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "packs"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          My Section Packs
        </button>
      </div>

      {activeTab === "templates" ? (
        <MyTemplatesTab profile={profile} />
      ) : (
        <MyPacksTab profile={profile} />
      )}
    </div>
  );
}

function MyTemplatesTab({ profile }: { profile: CreatorProfile }) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<WebsiteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient<WebsiteTemplate[]>("/creator/templates");
      setTemplates(data || []);
    } catch {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleCreate = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    setCreating(true);
    try {
      await apiClient("/creator/templates", {
        method: "POST",
        body: { name: newName, slug: newSlug },
      });
      setNewName("");
      setNewSlug("");
      setShowCreate(false);
      fetchTemplates();
      toast({ title: "Template created" });
    } catch (error: any) {
      toast({ title: "Could not create template", description: error.message });
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await apiClient(`/creator/templates/${id}/publish`, { method: "POST" });
      fetchTemplates();
      toast({ title: "Template published" });
    } catch (error: any) {
      toast({ title: "Could not publish", description: error.message });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await apiClient(`/creator/templates/${id}/archive`, { method: "POST" });
      fetchTemplates();
      toast({ title: "Template archived" });
    } catch (error: any) {
      toast({ title: "Could not archive", description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient(`/creator/templates/${id}`, { method: "DELETE" });
      fetchTemplates();
      toast({ title: "Template deleted" });
    } catch (error: any) {
      toast({ title: "Could not delete", description: error.message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{templates.length} template{templates.length !== 1 ? "s" : ""}</p>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="tpl-name">Name</Label>
                <Input
                  id="tpl-name"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                  }}
                  placeholder="My Awesome Template"
                />
              </div>
              <div>
                <Label htmlFor="tpl-slug">Slug</Label>
                <Input
                  id="tpl-slug"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="my-awesome-template"
                />
              </div>
              <Button onClick={handleCreate} disabled={creating || !newName.trim() || !newSlug.trim()}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No templates yet. Create your first template to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map((tpl) => (
            <Card key={tpl.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <LayoutTemplate className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{tpl.name}</p>
                    <StatusBadge status={tpl.status} />
                    <VisibilityBadge visibility={tpl.visibility} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tpl.pageCount || 0} pages · v{tpl.version} · Updated {new Date(tpl.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {tpl.status === "draft" && (
                    <Button size="sm" variant="ghost" onClick={() => handlePublish(tpl.id)} title="Publish">
                      <ArrowUpCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {tpl.status !== "archived" && (
                    <Button size="sm" variant="ghost" onClick={() => handleArchive(tpl.id)} title="Archive">
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                  {tpl.status === "draft" && (
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(tpl.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MyPacksTab({ profile }: { profile: CreatorProfile }) {
  const { toast } = useToast();
  const [packs, setPacks] = useState<SectionPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchPacks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient<SectionPack[]>("/creator/section-packs");
      setPacks(data || []);
    } catch {
      setPacks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  const handleCreate = async () => {
    if (!newName.trim() || !newSlug.trim()) return;
    setCreating(true);
    try {
      await apiClient("/creator/section-packs", {
        method: "POST",
        body: { name: newName, slug: newSlug },
      });
      setNewName("");
      setNewSlug("");
      setShowCreate(false);
      fetchPacks();
      toast({ title: "Section pack created" });
    } catch (error: any) {
      toast({ title: "Could not create section pack", description: error.message });
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await apiClient(`/creator/section-packs/${id}/publish`, { method: "POST" });
      fetchPacks();
      toast({ title: "Section pack published" });
    } catch (error: any) {
      toast({ title: "Could not publish", description: error.message });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await apiClient(`/creator/section-packs/${id}/archive`, { method: "POST" });
      fetchPacks();
      toast({ title: "Section pack archived" });
    } catch (error: any) {
      toast({ title: "Could not archive", description: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient(`/creator/section-packs/${id}`, { method: "DELETE" });
      fetchPacks();
      toast({ title: "Section pack deleted" });
    } catch (error: any) {
      toast({ title: "Could not delete", description: error.message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{packs.length} section pack{packs.length !== 1 ? "s" : ""}</p>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Section Pack
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Section Pack</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="pack-name">Name</Label>
                <Input
                  id="pack-name"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                  }}
                  placeholder="My Section Pack"
                />
              </div>
              <div>
                <Label htmlFor="pack-slug">Slug</Label>
                <Input
                  id="pack-slug"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="my-section-pack"
                />
              </div>
              <Button onClick={handleCreate} disabled={creating || !newName.trim() || !newSlug.trim()}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : packs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Layers className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No section packs yet. Create your first section pack to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {packs.map((pack) => (
            <Card key={pack.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Layers className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{pack.name}</p>
                    <StatusBadge status={pack.status} />
                    <VisibilityBadge visibility={pack.visibility} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {pack.sectionCount || 0} sections · v{pack.version} · Updated {new Date(pack.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {pack.status === "draft" && (
                    <Button size="sm" variant="ghost" onClick={() => handlePublish(pack.id)} title="Publish">
                      <ArrowUpCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {pack.status !== "archived" && (
                    <Button size="sm" variant="ghost" onClick={() => handleArchive(pack.id)} title="Archive">
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                  {pack.status === "draft" && (
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(pack.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variant = status === "published" ? "success" : status === "archived" ? "secondary" : "warning";
  return <Badge variant={variant as any} className="text-xs">{status}</Badge>;
}

function VisibilityBadge({ visibility }: { visibility: string }) {
  return (
    <Badge variant="outline" className="text-xs">
      {visibility}
    </Badge>
  );
}
