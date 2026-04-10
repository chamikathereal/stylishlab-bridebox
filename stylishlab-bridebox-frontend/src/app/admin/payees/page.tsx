"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import {
  useGetAll2,
  useToggleStatus1,
} from "@/api/generated/endpoints/payee-debtor-management/payee-debtor-management";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Building2,
  Phone,
  Edit2,
  Info,
  Power,
  Search,
  LayoutGrid,
  List,
  UserSquare2,
} from "lucide-react";
import { PayeeRegistrationDialog } from "@/components/shared/PayeeRegistrationDialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PayeeResponse } from "@/api/generated/model";
import { cn } from "@/lib/utils";

export default function PayeesPage() {
  const { data: res, isLoading } = useGetAll2();
  const toggleMutation = useToggleStatus1();
  const queryClient = useQueryClient();

  const payees = (res?.data ?? []) as PayeeResponse[];

  const [open, setOpen] = useState(false);
  const [editingPayee, setEditingPayee] = useState<PayeeResponse | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  const [searchQuery, setSearchQuery] = useState("");

  const filteredPayees = payees.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mobile?.includes(searchQuery),
  );

  const handleOpenNew = () => {
    setEditingPayee(null);
    setOpen(true);
  };

  const handleEdit = (p: PayeeResponse) => {
    setEditingPayee(p);
    setOpen(true);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payee Directory"
        description={`${payees.length} registered business entities and debtors`}
      >
        <Button
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
          onClick={handleOpenNew}
        >
          <Plus className="w-4 h-4" /> Register New Payee
        </Button>
      </PageHeader>

      {/* Advanced Filter & View Bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-border/50 backdrop-blur-sm">
        <div className="relative flex-1 min-w-[280px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, type or mobile..."
            className="pl-9 h-10 bg-background/50 border-border/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 border-l border-border/50 h-8">
          <Info className="w-3.5 h-3.5" />
          {filteredPayees.length} Results
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-background/50 rounded-xl border border-border/50 ml-auto">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewMode("table")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <PayeeRegistrationDialog
        open={open}
        onOpenChange={setOpen}
        editingPayee={editingPayee}
      />

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPayees.map((p) => (
            <Card
              key={p.id}
              className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-background/50 backdrop-blur-sm"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center border border-border/10 group-hover:bg-emerald-500/10 transition-colors">
                      <Building2 className="w-5 h-5 text-muted-foreground group-hover:text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                          {p.type}
                        </span>
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            p.isActive
                              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                              : "bg-muted-foreground/30",
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {p.mobile && (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                      Contact Number
                    </span>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground px-0.5">
                    <Phone className="w-3 h-3 opacity-50" />
                    <span>{p.mobile}</span>
                  </div>
                  {p.notes && (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                      Notes
                    </span>
                  )}
                  <p className="text-[11px] text-muted-foreground/60 leading-relaxed line-clamp-1 mb-4 px-0.5 italic">
                    {p.notes}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-[10px] font-bold flex-1 gap-1.5 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all"
                    onClick={() => handleEdit(p)}
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "h-8 px-2 text-[10px] font-bold transition-all",
                      p.isActive
                        ? "hover:bg-red-500/5 hover:text-red-500"
                        : "hover:bg-emerald-500/5 hover:text-emerald-600",
                    )}
                    onClick={() =>
                      toggleMutation.mutate(
                        { id: p.id! },
                        {
                          onSuccess: () => {
                            toast.success("Status updated");
                            queryClient.invalidateQueries();
                          },
                        },
                      )
                    }
                  >
                    <Power className="w-3 h-3 mr-1.5" />
                    {p.isActive ? "Off" : "On"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="glass-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-muted-foreground/10 bg-muted/5">
                <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider">
                  Entity
                </TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider">
                  Contact
                </TableHead>
                <TableHead className="px-6 py-4 font-bold text-xs uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="px-6 py-4 text-right font-bold text-xs uppercase tracking-wider">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayees.map((p) => (
                <TableRow
                  key={p.id}
                  className="group hover:bg-muted/10 transition-colors border-muted-foreground/10"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center border border-border/10">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{p.name}</span>
                        <span className="text-[10px] text-muted-foreground italic line-clamp-1 max-w-[200px]">
                          {p.notes || "No notes registered"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold uppercase tracking-wider bg-muted/30"
                    >
                      {p.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground lowercase">
                      <Phone className="w-3 h-3 opacity-50 capitalize" />
                      <span>{p.mobile || "Private"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          p.isActive
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            : "bg-muted-foreground/30",
                        )}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-bold uppercase tracking-widest",
                          p.isActive
                            ? "text-emerald-600"
                            : "text-muted-foreground",
                        )}
                      >
                        {p.isActive ? "Connected" : "Disabled"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 hover:bg-emerald-500/5 hover:text-emerald-600"
                        onClick={() => handleEdit(p)}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={cn(
                          "h-8 w-8 p-0",
                          p.isActive
                            ? "hover:bg-red-500/5 hover:text-red-500"
                            : "hover:bg-emerald-500/5 hover:text-emerald-600",
                        )}
                        onClick={() =>
                          toggleMutation.mutate(
                            { id: p.id! },
                            {
                              onSuccess: () => {
                                toast.success("Updated");
                                queryClient.invalidateQueries();
                              },
                            },
                          )
                        }
                      >
                        <Power className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {filteredPayees.length === 0 && (
        <div className="py-20 flex flex-col items-center justify-center bg-muted/5 rounded-3xl border-2 border-dashed border-border/50">
          <UserSquare2 className="w-12 h-12 text-muted-foreground/20 mb-4" />
          <p className="text-sm font-bold text-muted-foreground uppercase opacity-50">
            No payees match your search criteria
          </p>
          <Button
            variant="link"
            className="text-emerald-600 mt-2"
            onClick={() => setSearchQuery("")}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
