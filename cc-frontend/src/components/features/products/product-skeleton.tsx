import { Card, CardContent } from "../../ui/card";
import { Skeleton } from "../../ui/skeleton";

// ─── Skeleton loader ──────────────────────────────────────────────────────────
export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-border">
      <Skeleton className="aspect-3/4 w-full rounded-none" />
      <CardContent className="p-4 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/4 mt-1" />
      </CardContent>
    </Card>
  )
}
