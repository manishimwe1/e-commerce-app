import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  CreditCard,
  MapPin,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getOrderById } from "@/lib/actions/orders";

export const metadata = {
  title: "Order Details | Furniture Shop",
  description: "View your order details",
};

const statusConfig: Record<
  string,
  { color: string; icon: React.ElementType; label: string }
> = {
  pending: {
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
    label: "Pending",
  },
  paid: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
    label: "Paid",
  },
  shipped: {
    color: "bg-blue-100 text-blue-800",
    icon: Truck,
    label: "Shipped",
  },
  delivered: {
    color: "bg-zinc-100 text-zinc-800",
    icon: Package,
    label: "Delivered",
  },
  cancelled: {
    color: "bg-red-100 text-red-800",
    icon: XCircle,
    label: "Cancelled",
  },
};

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/sign-in?redirect_url=/orders/${id}`);
  }

  const { success, order, error } = await getOrderById(id);

  if (!success || !order) {
    notFound();
  }

  const status = statusConfig[order.status ?? "pending"] ?? statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/orders"
          className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Order {order.orderNumber}
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Placed on{" "}
              {order.createdAt
                ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Date unknown"}
            </p>
          </div>
          <Badge className={`${status.color} flex items-center gap-1.5`}>
            <StatusIcon className="h-4 w-4" />
            {status.label}
          </Badge>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Items ({order.items?.length ?? 0})
              </h2>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 px-6 py-4">
                  {/* Image */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
                    {item.product?.image?.asset?.url ? (
                      <Image
                        src={item.product.image.asset.url}
                        alt={item.product.name ?? "Product"}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.product?.slug}`}
                        className="font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
                      >
                        {item.product?.name ?? "Unknown Product"}
                      </Link>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      £{((item.priceAtPurchase ?? 0) * (item.quantity ?? 1)).toFixed(2)}
                    </p>
                    {(item.quantity ?? 1) > 1 && (
                      <p className="text-sm text-zinc-500">
                        £{(item.priceAtPurchase ?? 0).toFixed(2)} each
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Details */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Order Summary
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 dark:text-zinc-400">
                  Subtotal
                </span>
                <span className="text-zinc-900 dark:text-zinc-100">
                  £{(order.total ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-zinc-200 pt-3 dark:border-zinc-800">
                <div className="flex justify-between font-semibold">
                  <span className="text-zinc-900 dark:text-zinc-100">Total</span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    £{(order.total ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.address && (
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-zinc-400" />
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Shipping Address
                </h2>
              </div>
              <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                {order.address.name && <p>{order.address.name}</p>}
                {order.address.line1 && <p>{order.address.line1}</p>}
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>
                  {[order.address.city, order.address.postcode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {order.address.country && <p>{order.address.country}</p>}
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-zinc-400" />
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Payment
              </h2>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Status</span>
                <span className="font-medium capitalize text-green-600">
                  {order.status}
                </span>
              </div>
              {order.email && (
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Email</span>
                  <span className="text-zinc-900 dark:text-zinc-100">
                    {order.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

