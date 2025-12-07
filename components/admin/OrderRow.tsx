"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  useDocumentProjection,
  type DocumentHandle,
} from "@sanity/sdk-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderStatus } from "@/lib/constants/orderStatus";

interface OrderProjection {
  orderNumber: string;
  email: string;
  total: number;
  status: string;
  createdAt: string;
  itemCount: number;
}

function OrderRowContent(handle: DocumentHandle) {
  const router = useRouter();
  const { data } = useDocumentProjection<OrderProjection>({
    ...handle,
    projection: `{
      orderNumber,
      email,
      total,
      status,
      createdAt,
      "itemCount": count(items)
    }`,
  });

  if (!data) return null;

  const status = getOrderStatus(data.status);
  const StatusIcon = status.icon;

  const handleRowClick = () => {
    router.push(`/admin/orders/${handle.documentId}`);
  };

  return (
    <TableRow
      className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
      onClick={handleRowClick}
    >
      {/* Order Number */}
      <TableCell>
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          #{data.orderNumber?.split("-").pop()}
        </span>
      </TableCell>

      {/* Email */}
      <TableCell className="text-zinc-500 dark:text-zinc-400">
        {data.email}
      </TableCell>

      {/* Items */}
      <TableCell className="text-center">{data.itemCount}</TableCell>

      {/* Total */}
      <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
        £{(data.total ?? 0).toFixed(2)}
      </TableCell>

      {/* Status */}
      <TableCell>
        <Badge className={`${status.color} flex w-fit items-center gap-1`}>
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </Badge>
      </TableCell>

      {/* Date */}
      <TableCell className="text-zinc-500 dark:text-zinc-400">
        {data.createdAt
          ? new Date(data.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—"}
      </TableCell>
    </TableRow>
  );
}

function OrderRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell className="text-center">
        <Skeleton className="mx-auto h-4 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
    </TableRow>
  );
}

export function OrderRow(props: DocumentHandle) {
  return (
    <Suspense fallback={<OrderRowSkeleton />}>
      <OrderRowContent {...props} />
    </Suspense>
  );
}

export { OrderRowSkeleton };
