"use server";

import { auth } from "@clerk/nextjs/server";
import { client } from "@/sanity/lib/client";
import {
  ORDERS_BY_USER_QUERY,
  ORDER_BY_ID_QUERY,
} from "@/lib/sanity/queries/orders";

/**
 * Fetches all orders for the current user
 */
export async function getUserOrders() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Not authenticated", orders: [] };
    }

    const orders = await client.fetch(ORDERS_BY_USER_QUERY, {
      clerkUserId: userId,
    });

    return { success: true, orders };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, error: "Failed to fetch orders", orders: [] };
  }
}

/**
 * Fetches a single order by ID, verifying ownership
 */
export async function getOrderById(orderId: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const order = await client.fetch(ORDER_BY_ID_QUERY, { id: orderId });

    if (!order) {
      return { success: false, error: "Order not found" };
    }

    // Verify ownership
    if (order.clerkUserId !== userId) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, order };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, error: "Failed to fetch order" };
  }
}

