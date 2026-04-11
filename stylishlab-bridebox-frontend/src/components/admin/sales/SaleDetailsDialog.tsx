import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt } from "lucide-react";
import { SaleResponse } from "@/api/generated/model";
import { statusConfig } from "./utils";
import dynamic from "next/dynamic";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ReceiptPDF } from "@/components/shared/ReceiptPDF";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 flex justify-center">
        <LoadingSpinner />
      </div>
    ),
  },
);

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
  },
);

interface SaleDetailsDialogProps {
  viewOpen: boolean;
  setViewOpen: (open: boolean) => void;
  printOpen: boolean;
  setPrintOpen: (open: boolean) => void;
  sale: SaleResponse | null;
}

export function SaleDetailsDialog({
  viewOpen,
  setViewOpen,
  printOpen,
  setPrintOpen,
  sale,
}: SaleDetailsDialogProps) {
  if (!sale) return null;

  return (
    <>
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border bg-card text-card-foreground p-4">
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="text-muted-foreground">Invoice No:</div>
                <div className="font-medium text-right">{sale.invoiceNo}</div>

                <div className="text-muted-foreground">Date:</div>
                <div className="font-medium text-right">
                  {new Date(sale.createdAt || "").toLocaleString()}
                </div>

                <div className="text-muted-foreground">Customer:</div>
                <div className="font-medium text-right">
                  {sale.customerName || "Walk-in"}
                </div>

                <div className="text-muted-foreground">Service:</div>
                <div className="font-medium text-right">
                  {sale.serviceNameSnapshot}
                </div>

                <div className="text-muted-foreground">Amount:</div>
                <div className="font-medium text-right">
                  Rs. {sale.servicePriceSnapshot?.toLocaleString()}
                </div>

                <div className="text-muted-foreground">Employee:</div>
                <div className="font-medium text-right">
                  {sale.employeeName}
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground p-4">
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-muted-foreground">Total:</div>
                <div className="font-medium text-right">
                  Rs. {(sale.servicePriceSnapshot ?? 0).toLocaleString()}
                </div>

                <div className="text-muted-foreground">Paid:</div>
                <div className="font-medium text-right text-emerald-600">
                  Rs. {(sale.paidAmount ?? 0).toLocaleString()}
                </div>

                {(sale.dueAmount ?? 0) > 0 && (
                  <>
                    <div className="text-muted-foreground">Due:</div>
                    <div className="font-medium text-right text-destructive">
                      Rs. {sale.dueAmount?.toLocaleString()}
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Status:</span>
                <Badge className={statusConfig[sale.paymentStatus!]?.className}>
                  {statusConfig[sale.paymentStatus!]?.label ||
                    sale.paymentStatus}
                </Badge>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                onClick={() => setPrintOpen(true)}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 gap-2 font-semibold rounded-sm"
              >
                <Receipt className="w-4 h-4" /> Print Receipt
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Receipt Dialog */}
      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-1 gap-0">
          <div className="p-4 border-b flex items-center justify-between">
            <DialogTitle>Print Receipt</DialogTitle>
            <PDFDownloadLink
              document={<ReceiptPDF sale={sale} />}
              fileName={`stylish-lab-${sale.invoiceNo}.pdf`}
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              {({ loading }: { loading: boolean }) =>
                loading ? "Preparing PDF..." : "Download Document"
              }
            </PDFDownloadLink>
          </div>
          <div className="flex-1 overflow-hidden bg-muted/30">
            {printOpen && (
              <PDFViewer width="100%" height="100%" className="border-none">
                <ReceiptPDF sale={sale} />
              </PDFViewer>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
