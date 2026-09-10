"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  Upload,
  Image,
  Video,
  FileText,
  Search,
  X,
  Loader2,
  Film,
  Check,
} from "lucide-react";

export type MediaAsset = {
  id: string;
  businessId: string;
  uploadedBy: string | null;
  fileName: string | null;
  originalFilename: string | null;
  storageKey: string;
  mimeType: string | null;
  mediaType: string;
  fileSize: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  altText: string | null;
  title: string | null;
  thumbnailStorageKey: string | null;
  status: string;
  createdAt: string;
  signedUrl?: string | null;
};

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  onSelect: (asset: MediaAsset) => void;
  filter?: "IMAGE" | "VIDEO" | "DOCUMENT";
  title?: string;
}

export function MediaPicker({ open, onOpenChange, businessId, onSelect, filter, title = "Media Library" }: MediaPickerProps) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>(filter || "ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = useCallback(async () => {
    if (!businessId) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeFilter !== "ALL") params.set("mediaType", activeFilter);
      if (search) params.set("search", search);
      const qs = params.toString();
      const data = await apiClient<MediaAsset[]>(`/businesses/${businessId}/media${qs ? `?${qs}` : ""}`);
      setAssets(data || []);
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [businessId, activeFilter, search]);

  useEffect(() => {
    if (open) fetchAssets();
  }, [open, fetchAssets]);

  const handleUpload = async (file: File) => {
    if (!businessId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      await apiClient(`/businesses/${businessId}/media`, {
        method: "POST",
        body: formData,
        isFormData: true,
      });
      fetchAssets();
      toast({ title: "Upload complete" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message || "Try again" });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleSelect = () => {
    const asset = assets.find((a) => a.id === selectedId);
    if (asset) {
      onSelect(asset);
      onOpenChange(false);
      setSelectedId(null);
    }
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const typeIcon = (mediaType: string) => {
    switch (mediaType) {
      case "IMAGE": return Image;
      case "VIDEO": return Video;
      default: return FileText;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search media..."
              className="h-8 pl-8 text-xs"
            />
          </div>
          <div className="flex gap-1">
            {["ALL", "IMAGE", "VIDEO", "DOCUMENT"].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  activeFilter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f === "ALL" ? "All" : f === "IMAGE" ? "Images" : f === "VIDEO" ? "Videos" : "Docs"}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
            Upload
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.pdf,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Media Grid */}
        <div
          className="flex-1 overflow-auto min-h-[300px] rounded-lg border bg-muted/20"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {loading ? (
            <div className="grid grid-cols-4 gap-2 p-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-2">No media yet</p>
              <p className="text-xs text-muted-foreground">Drop a file here or click Upload</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 p-3">
              {assets.map((asset) => {
                const Icon = typeIcon(asset.mediaType);
                const isSelected = selectedId === asset.id;
                return (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedId(isSelected ? null : asset.id)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    {asset.mediaType === "IMAGE" && asset.signedUrl ? (
                      <img
                        src={asset.signedUrl}
                        alt={asset.altText || asset.fileName || ""}
                        className="w-full h-full object-cover"
                      />
                    ) : asset.mediaType === "VIDEO" ? (
                      <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
                        <Film className="h-8 w-8 text-muted-foreground mb-1" />
                        <span className="text-[10px] text-muted-foreground">{asset.fileName}</span>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
                        <Icon className="h-8 w-8 text-muted-foreground mb-1" />
                        <span className="text-[10px] text-muted-foreground">{asset.fileName}</span>
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5">
                      <p className="text-[10px] text-white truncate">{asset.fileName}</p>
                    </div>
                    {asset.mediaType === "VIDEO" && (
                      <Badge variant="secondary" className="absolute top-1 left-1 text-[9px] px-1 py-0">Video</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {assets.length} item{assets.length !== 1 ? "s" : ""}
            {selectedId && " · 1 selected"}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" disabled={!selectedId} onClick={handleSelect}>Select</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
