"use client";

import { useState } from "react";
import { useBusinessContext } from "@/providers/BusinessProvider";
import { BUSINESS_TYPE_LABELS } from "@/config/business";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Check, ChevronsUpDown, Plus, Store } from "lucide-react";
import { useRouter } from "next/navigation";

export function BusinessSwitcher() {
  const { businesses, selected, selectBusiness } = useBusinessContext();
  const router = useRouter();

  if (!selected && businesses.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/dashboard/business")}
        className="h-9 gap-2 text-xs font-medium"
      >
        <Plus className="h-4 w-4" /> Add Business
      </Button>
    );
  }

  const currentType = selected?.businessType
    ? BUSINESS_TYPE_LABELS[selected.businessType] || selected.businessType
    : "Business";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2.5 px-2.5 hover:bg-accent/60 data-[state=open]:bg-accent"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary font-semibold text-xs">
            {selected?.name ? selected.name[0].toUpperCase() : <Building2 className="h-3.5 w-3.5" />}
          </div>
          <div className="flex flex-col text-left">
            <span className="max-w-[130px] truncate text-xs font-semibold leading-none text-foreground sm:max-w-[180px]">
              {selected?.name || "Select Business"}
            </span>
            <span className="text-[10px] text-muted-foreground leading-tight">
              {currentType}
            </span>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 p-1.5">
        <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
          Businesses ({businesses.length})
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <div className="max-h-56 overflow-y-auto space-y-0.5">
          {businesses.map((b) => {
            const isSelected = b.id === selected?.id;
            const bTypeLabel = b.businessType
              ? BUSINESS_TYPE_LABELS[b.businessType] || b.businessType
              : "Business";
            return (
              <DropdownMenuItem
                key={b.id}
                onSelect={() => selectBusiness(b.id)}
                className="flex items-center justify-between px-2 py-2 rounded-md cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-muted text-foreground text-xs font-semibold">
                    {b.name[0].toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-xs font-medium">{b.name}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{bTypeLabel}</span>
                  </div>
                </div>
                {isSelected && <Check className="h-4 w-4 text-primary ml-2 flex-shrink-0" />}
              </DropdownMenuItem>
            );
          })}
        </div>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          onSelect={() => router.push("/dashboard/business")}
          className="flex items-center gap-2 px-2 py-2 text-xs text-primary font-medium cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create New Business
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
