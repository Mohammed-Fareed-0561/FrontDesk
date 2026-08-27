"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import { Bot, Send, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Wand2 } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string; actions?: any[]; at: string };

const suggestions = [
  "What should I do today?",
  "Add cappuccino for ₹120",
  "Change burger price to ₹200",
  "Which products need review?",
  "Summarize my recent enquiries",
];

export default function CopilotPage() {
  const { toast } = useToast();
  const { selectedId } = useBusiness();
  const businessId = selectedId;
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Msg[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const scroll = () => endRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scroll();
  }, [history]);

  useEffect(() => {
    if (!businessId) return;
    apiClient<any[]>(`/businesses/${businessId}/approvals`).then(setApprovals).catch(() => {});
  }, [businessId]);

  const handleSend = async (text?: string) => {
    const msg = (text ?? message).trim();
    if (!msg || !businessId) {
      if (!businessId) toast({ title: "Create a business first" });
      return;
    }
    setHistory((h) => [...h, { role: "user", content: msg, at: new Date().toISOString() }]);
    setMessage("");
    setLoading(true);
    try {
      const data = await apiClient<any>(`/businesses/${businessId}/ai/chat`, { method: "POST", body: { message: msg } });
      setHistory((h) => [...h, { role: "assistant", content: data.message, actions: data.actions, at: new Date().toISOString() }]);
      if (data.actions?.length) {
        const pending = await apiClient<any[]>(`/businesses/${businessId}/approvals`).catch(() => []);
        setApprovals(pending);
      }
    } catch (err: any) {
      setHistory((h) => [...h, { role: "assistant", content: `Could not process: ${err.message}`, at: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (id: string, action: "approve" | "reject") => {
    if (!businessId) return;
    try {
      await apiClient(`/businesses/${businessId}/approvals/${id}/${action}`, { method: "POST" });
      toast({ title: action === "approve" ? "Approved" : "Rejected" });
      const pending = await apiClient<any[]>(`/businesses/${businessId}/approvals`);
      setApprovals(pending);
    } catch (e: any) {
      toast({ title: "Could not update", description: e.message });
    }
  };

  if (!businessId) {
    return <div className="space-y-6"><h1 className="text-2xl font-bold">Copilot</h1><Card><CardContent className="py-12 text-center">Create a business to use Copilot</CardContent></Card></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Bot className="h-6 w-6" /> Copilot</h1>
        <p className="text-muted-foreground">Your business assistant — it knows your catalog, enquiries and website. Ask in plain English.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 flex flex-col min-h-[560px]">
          <CardHeader className="border-b">
            <CardTitle className="text-base flex items-center gap-2"><Wand2 className="h-4 w-4" /> Ask FrontDesk</CardTitle>
            <CardDescription>Try: “Add chicken shawarma for ₹150” — I’ll propose, you approve.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4 space-y-4">
            {history.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
                <div className="rounded-full bg-primary/10 p-3"><Sparkles className="h-6 w-6 text-primary" /></div>
                <h3 className="font-medium">How can I help today?</h3>
                <p className="max-w-sm text-sm text-muted-foreground">I can summarize enquiries, suggest promotions, or draft product changes — always as a proposal you review.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {suggestions.map((s) => (
                    <Button key={s} variant="outline" size="sm" onClick={() => handleSend(s)}>{s}</Button>
                  ))}
                </div>
              </div>
            ) : (
              history.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    {m.actions?.map((a: any, idx: number) => (
                      <div key={idx} className="mt-2 rounded-md border bg-background p-2 text-xs">
                        <div className="font-medium">{a.type}</div>
                        <div className="text-muted-foreground">{JSON.stringify(a.payload)}</div>
                        {a.approvalRequired && <Badge variant="warning" className="mt-1">Needs approval</Badge>}
                      </div>
                    ))}
                    <div className="mt-1 text-xs opacity-60">{new Date(m.at).toLocaleTimeString("en-IN")}</div>
                  </div>
                </div>
              ))
            )}
            <div ref={endRef} />
          </CardContent>
          <div className="border-t p-3">
            <div className="flex gap-2">
              <Input placeholder="Ask about your business… (e.g. ‘Add cappuccino for ₹120’)" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
              <Button onClick={() => handleSend()} disabled={loading || !message.trim()}>{loading ? "Thinking…" : <>Send <Send className="ml-2 h-4 w-4" /></>}</Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Copilot never changes prices without your approval. High-impact actions go to Approvals.</p>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Needs your approval <Badge variant="secondary">{approvals.filter((a) => a.status === "pending").length}</Badge></CardTitle><CardDescription>Review before anything changes.</CardDescription></CardHeader>
            <CardContent className="space-y-2 max-h-[260px] overflow-auto">
              {approvals.filter((a) => a.status === "pending").length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No pending approvals. You’re all clear.</p>
              ) : (
                approvals.filter((a) => a.status === "pending").map((a) => (
                  <div key={a.id} className="rounded-md border p-3">
                    <div className="text-sm font-medium">{a.reason || "Action"}</div>
                    <div className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString("en-IN")}</div>
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={() => handleApproval(a.id, "approve")}><CheckCircle2 className="mr-1 h-3 w-3" /> Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => handleApproval(a.id, "reject")}>Reject</Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">How Copilot works</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex gap-2"><span className="font-medium text-foreground">1.</span> You ask in plain English</div>
              <div className="flex gap-2"><span className="font-medium text-foreground">2.</span> I propose a structured change</div>
              <div className="flex gap-2"><span className="font-medium text-foreground">3.</span> You approve → I apply safely, with audit log</div>
              <Separator />
              <p>Try: <code className="rounded bg-muted px-1">What should I update today?</code> <ArrowRight className="inline h-3 w-3" /></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
