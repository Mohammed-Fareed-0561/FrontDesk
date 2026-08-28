"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import { Zap, Plus, Play, Pause, Trash2, ChevronDown, ChevronUp, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

type Automation = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  triggerConfig: string | null;
  conditionsConfig: string | null;
  actionsConfig: string | null;
  createdAt: string;
  _count?: { runs: number };
};

type AutomationRun = {
  id: string;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
};

const TRIGGERS = [
  "ENQUIRY_CREATED", "ORDER_CREATED", "ORDER_COMPLETED", "ORDER_CONFIRMED", "ORDER_CANCELLED",
  "PAYMENT_CREATED", "PAYMENT_PAID", "BOOKING_CREATED", "BOOKING_COMPLETED", "BOOKING_CANCELLED",
  "INSIGHT_CREATED", "PRODUCT_CREATED", "PRODUCT_UPDATED", "MEMORY_CREATED",
];

const ACTIONS = [
  { key: "CREATE_PRODUCT", label: "Create Product", needsApproval: false },
  { key: "CREATE_OFFER", label: "Create Offer", needsApproval: false },
  { key: "UPDATE_PRODUCT", label: "Update Product", needsApproval: true },
  { key: "DELETE_PRODUCT", label: "Delete Product", needsApproval: true },
];

const statusColors: Record<string, string> = {
  active: "default",
  inactive: "secondary",
  draft: "outline",
  completed: "default",
  failed: "destructive",
  running: "warning",
  pending: "secondary",
  skipped: "outline",
};

export default function AutomationsPage() {
  const { toast } = useToast();
  const { selectedId } = useBusiness();
  const businessId = selectedId;
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);

  // Create form
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formTrigger, setFormTrigger] = useState("ENQUIRY_CREATED");
  const [formConditionField, setFormConditionField] = useState("");
  const [formConditionOp, setFormConditionOp] = useState("gt");
  const [formConditionValue, setFormConditionValue] = useState("");
  const [formAction, setFormAction] = useState("CREATE_PRODUCT");

  const fetchAutomations = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await apiClient<Automation[]>(`/businesses/${businessId}/automations`);
      setAutomations(Array.isArray(data) ? data : []);
    } catch {
      setAutomations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!businessId || !formName.trim()) return;
    setCreating(true);
    try {
      const triggerConfig = JSON.stringify({ eventType: formTrigger });
      const conditionsConfig = formConditionField
        ? JSON.stringify([{ field: formConditionField, op: formConditionOp, value: formConditionValue ? Number(formConditionValue) || formConditionValue : "" }])
        : undefined;
      const actionsConfig = JSON.stringify([{ actionKey: formAction }]);

      await apiClient(`/businesses/${businessId}/automations`, {
        method: "POST",
        body: { name: formName, description: formDesc || undefined, triggerConfig, conditionsConfig, actionsConfig },
      });
      toast({ title: "Automation created" });
      setFormName("");
      setFormDesc("");
      setFormConditionField("");
      setFormConditionValue("");
      fetchAutomations();
    } catch (e: any) {
      toast({ title: "Could not create", description: e.message });
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (auto: Automation) => {
    if (!businessId) return;
    const action = auto.status === "active" ? "disable" : "enable";
    try {
      await apiClient(`/businesses/${businessId}/automations/${auto.id}/${action}`, { method: "POST" });
      toast({ title: action === "enable" ? "Enabled" : "Disabled" });
      fetchAutomations();
    } catch (e: any) {
      toast({ title: "Could not update", description: e.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!businessId) return;
    try {
      await apiClient(`/businesses/${businessId}/automations/${id}`, { method: "DELETE" });
      toast({ title: "Deleted" });
      fetchAutomations();
    } catch (e: any) {
      toast({ title: "Could not delete", description: e.message });
    }
  };

  const handleTrigger = async (id: string) => {
    if (!businessId) return;
    try {
      const res = await apiClient<any>(`/businesses/${businessId}/automations/${id}/trigger`, { method: "POST" });
      toast({ title: "Triggered", description: `Run status: ${res.status}` });
      if (expandedId === id) loadRuns(id);
    } catch (e: any) {
      toast({ title: "Trigger failed", description: e.message });
    }
  };

  const loadRuns = async (automationId: string) => {
    if (!businessId) return;
    setRunsLoading(true);
    try {
      const data = await apiClient<AutomationRun[]>(`/businesses/${businessId}/automations/${automationId}/runs`);
      setRuns(Array.isArray(data) ? data : []);
    } catch {
      setRuns([]);
    } finally {
      setRunsLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setRuns([]);
    } else {
      setExpandedId(id);
      loadRuns(id);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, [businessId]);

  if (!businessId) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Automations</h1>
        <Card>
          <CardContent className="py-12 text-center">Create a business to manage automations</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Zap className="h-6 w-6" /> Automations
        </h1>
        <p className="text-muted-foreground">Automate repetitive tasks. When something happens, do something safe.</p>
      </div>

      {/* Create form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Plus className="h-4 w-4" /> Create Automation</CardTitle>
          <CardDescription>Configure a trigger, optional condition, and action.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="e.g. New enquiry alert" value={formName} onChange={(e) => setFormName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Input placeholder="What this automation does" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Trigger</label>
              <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={formTrigger} onChange={(e) => setFormTrigger(e.target.value)}>
                {TRIGGERS.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Action</label>
              <select className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={formAction} onChange={(e) => setFormAction(e.target.value)}>
                {ACTIONS.map((a) => <option key={a.key} value={a.key}>{a.label}{a.needsApproval ? " (needs approval)" : ""}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Condition (optional)</label>
              <div className="flex gap-1">
                <Input placeholder="field" className="w-1/3" value={formConditionField} onChange={(e) => setFormConditionField(e.target.value)} />
                <select className="w-1/3 rounded-md border bg-background px-2 py-2 text-sm" value={formConditionOp} onChange={(e) => setFormConditionOp(e.target.value)}>
                  <option value="gt">&gt;</option>
                  <option value="gte">&gt;=</option>
                  <option value="lt">&lt;</option>
                  <option value="eq">==</option>
                  <option value="neq">!=</option>
                </select>
                <Input placeholder="value" className="w-1/3" value={formConditionValue} onChange={(e) => setFormConditionValue(e.target.value)} />
              </div>
            </div>
          </div>
          <Button onClick={handleCreate} disabled={creating || !formName.trim()}>
            {creating ? "Creating…" : "Create Automation"}
          </Button>
        </CardContent>
      </Card>

      {/* Automation list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((n) => (
            <Card key={n}><CardContent className="py-6"><div className="animate-pulse h-4 w-1/3 rounded bg-muted" /></CardContent></Card>
          ))}
        </div>
      ) : automations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No automations yet. Create one above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {automations.map((auto) => {
            let trigger: any = {};
            try { trigger = JSON.parse(auto.triggerConfig || "{}"); } catch {}
            let actions: any[] = [];
            try { actions = JSON.parse(auto.actionsConfig || "[]"); } catch {}
            const isExpanded = expandedId === auto.id;

            return (
              <Card key={auto.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{auto.name}</span>
                        <Badge variant={(statusColors[auto.status] as any) || "outline"}>{auto.status}</Badge>
                        {trigger.eventType && <Badge variant="outline">{trigger.eventType.replace(/_/g, " ")}</Badge>}
                        {actions.map((a: any, i: number) => (
                          <Badge key={i} variant="secondary">{a.actionKey}</Badge>
                        ))}
                      </div>
                      {auto.description && <p className="text-sm text-muted-foreground mt-1">{auto.description}</p>}
                      <div className="text-xs text-muted-foreground mt-1">
                        Runs: {auto._count?.runs || 0} · Created: {new Date(auto.createdAt).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => handleTrigger(auto.id)} title="Manual trigger">
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleToggle(auto)} title={auto.status === "active" ? "Disable" : "Enable"}>
                        {auto.status === "active" ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(auto.id)} title="Delete">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleExpand(auto.id)}>
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 border-t pt-3">
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">Recent Runs</h4>
                      {runsLoading ? (
                        <p className="text-xs text-muted-foreground">Loading runs…</p>
                      ) : runs.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No runs yet.</p>
                      ) : (
                        <div className="space-y-1">
                          {runs.map((run) => (
                            <div key={run.id} className="flex items-center gap-2 text-xs">
                              {run.status === "completed" ? <CheckCircle2 className="h-3 w-3 text-green-500" /> :
                               run.status === "failed" ? <XCircle className="h-3 w-3 text-red-500" /> :
                               run.status === "running" ? <Clock className="h-3 w-3 text-yellow-500" /> :
                               <AlertTriangle className="h-3 w-3 text-gray-400" />}
                              <Badge variant={(statusColors[run.status] as any) || "outline"} className="text-[10px]">{run.status}</Badge>
                              <span className="text-muted-foreground">{new Date(run.createdAt).toLocaleString("en-IN")}</span>
                              {run.errorMessage && <span className="text-red-500 truncate max-w-[200px]">{run.errorMessage}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
