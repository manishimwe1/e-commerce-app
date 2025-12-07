"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDocumentProjection, type DocumentHandle } from "@sanity/sdk-react";
import { ExternalLink } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StockInput } from "./StockInput";
import { PriceInput } from "./PriceInput";
import { FeaturedToggle } from "./FeaturedToggle";
import { PublishButton, RevertButton } from "./PublishButton";

interface ProductProjection {
  name: string;
  slug: string;
  stock: number;
  price: number;
  featured: boolean;
  category: {
    title: string;
  } | null;
  image: {
    asset: {
      url: string;
    } | null;
  } | null;
}

function ProductRowContent(handle: DocumentHandle) {
  const { data } = useDocumentProjection<ProductProjection>({
    ...handle,
    projection: `{
      name,
      "slug": slug.current,
      stock,
      price,
      featured,
      category->{
        title
      },
      "image": images[0]{
        asset->{
          url
        }
      }
    }`,
  });

  if (!data) return null;

  const isLowStock = data.stock > 0 && data.stock <= 5;
  const isOutOfStock = data.stock === 0;

  return (
    <TableRow className="group">
      {/* Image */}
      <TableCell>
        <div className="relative h-12 w-12 overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800">
          {data.image?.asset?.url ? (
            <Image
              src={data.image.asset.url}
              alt={data.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-400">
              ?
            </div>
          )}
        </div>
      </TableCell>

      {/* Name */}
      <TableCell>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/inventory/${handle.documentId}`}
            className="font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            {data.name || "Untitled Product"}
          </Link>
          {data.slug && (
            <Link
              href={`/products/${data.slug}`}
              target="_blank"
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <ExternalLink className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-600" />
            </Link>
          )}
        </div>
        {data.category && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {data.category.title}
          </p>
        )}
      </TableCell>

      {/* Price */}
      <TableCell>
        <Suspense fallback={<Skeleton className="h-8 w-24" />}>
          <PriceInput {...handle} />
        </Suspense>
      </TableCell>

      {/* Stock */}
      <TableCell>
        <div className="flex items-center gap-2">
          <Suspense fallback={<Skeleton className="h-8 w-20" />}>
            <StockInput {...handle} />
          </Suspense>
          {isOutOfStock && (
            <Badge variant="destructive" className="text-xs">
              Out
            </Badge>
          )}
          {isLowStock && (
            <Badge
              variant="secondary"
              className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
            >
              Low
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Featured */}
      <TableCell>
        <Suspense fallback={<Skeleton className="h-8 w-8" />}>
          <FeaturedToggle {...handle} />
        </Suspense>
      </TableCell>

      {/* Actions - fixed width to prevent layout shift */}
      <TableCell className="w-[180px]">
        <div className="flex h-8 w-[180px] items-center justify-end gap-2">
          <Suspense fallback={null}>
            <RevertButton {...handle} size="sm" />
          </Suspense>
          <Suspense fallback={null}>
            <PublishButton {...handle} size="sm" variant="outline" />
          </Suspense>
        </div>
      </TableCell>
    </TableRow>
  );
}

function ProductRowSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-12 w-12 rounded-md" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-1 h-3 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-8 w-[100px]" />
      </TableCell>
    </TableRow>
  );
}

export function ProductRow(props: DocumentHandle) {
  return (
    <Suspense fallback={<ProductRowSkeleton />}>
      <ProductRowContent {...props} />
    </Suspense>
  );
}

export { ProductRowSkeleton };
