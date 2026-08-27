"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useBusiness } from "@/hooks/useBusiness";
import type { Conversation, Enquiry, Message } from "@/types";
import { Inbox, MessageCircle, Send, CheckCircle2, Clock, User, Phone, Mail, Search, Filter, Archive, MoreHorizontal } from "lucide-react";

export default function InboxPage() {
  const { toast } = useToast();
  const { selectedId } = useBusiness();
  const businessId = selectedId;
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchAll = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const [enq, conv] = await Promise.all([
        apiClient<Enquiry[]>(`/businesses/${businessId}/enquiries`),
        apiClient<Conversation[]>(`/businesses/${businessId}/conversations`),
      ]);
      setEnquiries(enq);
      setConversations(conv);
      if (conv.length && !selected) setSelected(conv[0]);
    } catch (e: any) {
      toast({ title: "Could not load inbox", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [businessId]);

  useEffect(() => {
    if (!businessId || !selected) return;
    (async () => {
      try {
        const msgs = await apiClient<Message[]>(`/businesses/${businessId}/conversations/${selected.id}/messages`);
        setMessages(msgs);
      } catch {}
    })();
  }, [selected, businessId]);

  const handleSend = async () => {
    if (!businessId || !selected || !reply.trim()) return;
    setSending(true);
    try {
      const msg = await apiClient<Message>(`/businesses/${businessId}/conversations/${selected.id}/messages`, { method: "POST", body: { content: reply } });
      setMessages((m) => [...m, msg]);
      setReply("");
      toast({ title: "Reply sent" });
    } catch (e: any) {
      toast({ title: "Could not send", description: e.message });
    } finally {
      setSending(false);
    }
  };

  const handleStatus = async (enquiryId: string, status: string) => {
    if (!businessId) return;
    try {
      await apiClient(`/businesses/${businessId}/enquiries/${enquiryId}`, { method: "PATCH", body: { status } });
      toast({ title: `Marked as ${status}` });
      fetchAll();
    } catch (e: any) {
      toast({ title: "Could not update", description: e.message });
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (filter === "open") return c.status === "open";
    if (filter === "waiting") return c.status === "waiting";
    if (filter === "resolved") return c.status === "resolved";
    return true;
  });

  if (!businessId) {
    return <div className="space-y-6"><h1 className="text-2xl font-bold">Inbox</h1><Card><CardContent className="py-12 text-center">Create a business first</CardContent></Card></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
          <p className="text-muted-foreground">All customer conversations — WhatsApp, website and manual. Reply in one place.</p>
        </div>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="waiting">Waiting</option>
            <option value="resolved">Resolved</option>
          </select>
          <Button variant="outline" onClick={fetchAll}>Refresh</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">Enquiries <Badge variant="secondary">{enquiries.length}</Badge></CardTitle>
              <CardDescription>Newest first. Tap to start a conversation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[260px] overflow-auto pr-2">
              {loading ? (
                <><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></>
              ) : enquiries.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  <Inbox className="mx-auto h-8 w-8 opacity-50" />
                  <p className="mt-2 font-medium">No enquiries yet</p>
                  <p>Share your public page — enquiries will appear here.</p>
                </div>
              ) : (
                enquiries.slice(0, 6).map((e) => (
                  <div key={e.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{e.subject || "Enquiry"}</div>
                        <div className="text-xs text-muted-foreground truncate">{e.message}</div>
                        <div className="mt-1 flex items-center gap-1.5"><Badge variant={e.status === "new" ? "warning" : e.status === "resolved" ? "success" : "secondary"} className="text-xs">{e.status}</Badge><span className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleDateString("en-IN")}</span></div>
                      </div>
                      {e.status === "new" && <Button size="sm" variant="outline" onClick={() => handleStatus(e.id, "in_progress")}>Open</Button>}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Conversations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-2 max-h-[420px] overflow-auto">
              {loading ? (
                <Skeleton className="h-20 w-full" />
              ) : filteredConversations.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No conversations</p>
              ) : (
                filteredConversations.map((c) => (
                  <button key={c.id} onClick={() => setSelected(c)} className={`w-full rounded-md border p-3 text-left transition-colors hover:bg-muted ${selected?.id === c.id ? "bg-muted border-primary/20" : ""}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{c.customer?.name || "Customer"}</span>
                      <Badge variant={c.status === "open" ? "success" : c.status === "waiting" ? "warning" : "secondary"}>{c.status}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><span className="truncate">{c.customer?.phone || c.customer?.email || c.channel}</span> <span>·</span> <span>{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleDateString("en-IN") : ""}</span></div>
                    {c.messages?.[0]?.content && <div className="mt-1 truncate text-xs">{c.messages[0].content}</div>}
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-2 flex flex-col min-h-[540px]">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">{selected ? selected.customer?.name || "Conversation" : "Select a conversation"}</CardTitle>
                <CardDescription>{selected ? `${selected.channel} · ${selected.status} · ${selected.customer?.phone || selected.customer?.email || ""}` : "Choose from the left to reply"}</CardDescription>
              </div>
              {selected && <Badge variant="outline">{selected.id.slice(0, 8)}</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto space-y-3 p-4">
            {!selected ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No conversation selected</div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No messages yet. Say hello!</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.senderType === "business" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.senderType === "business" ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
                    <div>{m.content}</div>
                    <div className={`mt-1 text-xs ${m.senderType === "business" ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
          {selected && (
            <div className="border-t p-3">
              <div className="flex gap-2">
                <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply… Press Enter to send" rows={2} className="flex-1 resize-none" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
                <Button onClick={handleSend} disabled={sending || !reply.trim()} className="self-end"><Send className="mr-2 h-4 w-4" />{sending ? "Sending…" : "Send"}</Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Customer will receive this via the original channel. AI can suggest a reply — see Copilot.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
