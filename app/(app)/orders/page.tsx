import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getUserOrders } from "@/lib/actions/orders";

export const metadata = {
  title: "Your Orders | Furniture Shop",
  description: "View your order history",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-zinc-100 text-zinc-800",
  cancelled: "bg-red-100 text-red-800",
};

export default async function OrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/orders");
  }

  const { orders } = await getUserOrders();

  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-600" />
          <h1 className="mt-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            No orders yet
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            When you place an order, it will appear here.
          </p>
          <Button asChild className="mt-8">
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          Your Orders
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          Track and manage your orders
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order._id}
            href={`/orders/${order._id}`}
            className="block rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <ShoppingBag className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Date unknown"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                    £{(order.total ?? 0).toFixed(2)}
                  </p>
                  <Badge
                    className={`mt-1 capitalize ${statusColors[order.status ?? "pending"] ?? statusColors.pending}`}
                  >
                    {order.status}
                  </Badge>
                </div>
                <ArrowRight className="h-5 w-5 text-zinc-400" />
              </div>
            </div>

            {/* Order Items Preview */}
            {(order.itemCount ?? 0) > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <span>
                  {order.itemCount}{" "}
                  {order.itemCount === 1 ? "item" : "items"}
                </span>
                {order.itemNames && order.itemNames.length > 0 && (
                  <>
                    <span>·</span>
                    <span className="truncate">
                      {order.itemNames.slice(0, 3).filter(Boolean).join(", ")}
                      {order.itemNames.length > 3 && "..."}
                    </span>
                  </>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

