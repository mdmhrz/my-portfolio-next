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
  columns: (string | ReactNode)[];
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
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className={`text-xs font-semibold text-muted-foreground ${
                  lastColRight && i === columns.length - 1 ? "text-right" : ""
                }`}
              >
                {col}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isEmpty ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="py-12 text-center text-sm text-muted-foreground"
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
