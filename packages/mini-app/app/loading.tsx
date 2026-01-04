import { Skeleton } from "@/components/ui/skeleton";

function ProductCardSkeleton() {
   return (
      <div className="flex flex-col space-y-3">
         <Skeleton className="relative w-full aspect-video" />
         <div className="space-y-2 px-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
         </div>
         <div className="px-2">
            <Skeleton className="h-8 w-1/3" />
         </div>
      </div>
   );
}

export default function ProductsLoading() {
   return (
      <div
         className="
        grid gap-2 px-4 
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        lg:grid-cols-5
        xl:grid-cols-6
    "
      >
         {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
         ))}
      </div>
   );
}