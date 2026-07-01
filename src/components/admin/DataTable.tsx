import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableSkeleton } from "@/components/admin/TableSkeleton";

interface DataTableProps {
  /** Plain string labels only — no JSX nodes; icons belong in cells, not headers. */
  columns: string[];
  children?: ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
  skeletonRows?: number;
  lastColRight?: boolean;
}

export function DataTable({
  columns,
  children,
  isEmpty = false,
  emptyMessage = "No entries yet.",
  isLoading = false,
  skeletonRows = 5,
  lastColRight = true,
}: DataTableProps) {
  if (isLoading) {
    return <TableSkeleton columns={columns.length} rows={skeletonRows} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/60 hover:bg-muted/60">
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className={
                  lastColRight && i === columns.length - 1 ? "text-right" : ""
                }
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isEmpty ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="py-16 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            children
          )}
        </TableBody>
      </Table>
    </div>
  );
}
