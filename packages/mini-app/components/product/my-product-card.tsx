// components/product/my-product-card.tsx
"use client";

import { useState } from "react"; // <-- State'i ekle
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
   // ... diğer ikonlar ...
   MoreHorizontal,
   Trash,
   Eye,
   MessageSquare,
   PauseCircle,
   PlayCircle,
   Loader2,
} from "lucide-react";
// ... diğer importlar ...
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useWebApp } from "@/context/WebAppContext";

import { ProductDrawer } from "../popover/ProductDrawer";
import { CommentsDrawer } from "../popover/CommentsDrawer"; // CommentsDrawer'ı içe aktar
import { cn } from "@/lib/utils";
import { EditProduct } from "./EditProduct";
import { Product, Category } from "@/generated/prisma/client";

// ... (other code) ...

// Manually define the type as a workaround
interface ProductEditHistory {
  id: number;
  changedAt: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldValues: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValues: any;
  productId: number;
}

// CommentsDrawer'ı tetikleyecek ve yönetecek yeni bileşen
function CommentsDrawerTrigger({
   children,
   productId,
   productName,
}: {
   children: React.ReactNode;
   productId: string;
   productName: string;
}) {
   const [isOpen, setIsOpen] = useState(false);
   return (
      <>
         <span
            onClick={() => setIsOpen(true)}
            className={cn(
               "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            )}
         >
            {children}
         </span>
         <CommentsDrawer
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            productId={productId}
            productName={productName}
         />
      </>
   );
}

type ProductWithCategory = Product & {
   category: Category;
   editHistory?: ProductEditHistory[];
};
interface MyProductCardProps {
   product: ProductWithCategory;
}

export function MyProductCard({ product }: MyProductCardProps) {
   const t = useTranslations("myProductCard");
   const router = useRouter();
   const { initData } = useWebApp();

   // Yerel State'ler (Anlık tepki için)
   const [isDeleted, setIsDeleted] = useState(false); // Kart silindi mi?
   const [isPublished, setIsPublished] = useState(
      product.status === "AVAILABLE"
   ); // Yayın durumu
   const [isLoading, setIsLoading] = useState(false); // İşlem sürüyor mu?

   // Eğer silindiyse, bileşeni hiç render etme (DOM'dan kaldır)
   if (isDeleted) return null;

   const handleToggleStatus = async () => {
      setIsLoading(true);

      // 1. Hemen arayüzü güncelle (Optimistic)
      const newStatus = !isPublished;
      setIsPublished(newStatus);

      try {
         const response = await fetch(`/api/product/${product.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData, isPublished }),
         });

         const result = await response.json();

         if (response.ok && result.success) {
            toast.success(
               newStatus ? t("product_published") : t("product_unpublished")
            );
            router.refresh();
         } else {
            // Hata olursa eski haline döndür
            setIsPublished(!newStatus);
            toast.error(result.error || t("status_update_failed"));
         }
      } catch {
         setIsPublished(!newStatus);
         toast.error(t("status_update_failed"));
      } finally {
         setIsLoading(false);
      }
   };

   const handleDelete = async () => {
      const confirmDelete = confirm(t("confirm_delete"));
      if (!confirmDelete) return;

      setIsLoading(true);

      try {
         const response = await fetch(`/api/product/${product.id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData }),
         });

         const result = await response.json();

         if (response.ok && result.success) {
            // 2. Başarılıysa kartı hemen yok et
            setIsDeleted(true);
            toast.success(t("product_deleted"));
            router.refresh(); // Arka planda yine de veriyi tazele
         } else {
            toast.error(result.error || t("delete_failed"));
         }
      } catch {
         toast.error(t("error_occurred"));
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <Card
         className={`overflow-hidden flex flex-col justify-between transition-opacity ${
            isLoading ? "opacity-50" : "opacity-100"
         }`}
      >
         <div className="relative h-48 w-full">
            <Image
               src={product.images?.[0] || "/placeholder.png"}
               alt={product.title}
               fill
               className="object-cover"
            />
            <div className="absolute top-2 right-2">
               {/* State'teki isPublished değerini kullanıyoruz */}
               <Badge variant={isPublished ? "default" : "secondary"}>
                  {isPublished ? t("on_sale") : t("not_on_sale")}
               </Badge>
            </div>
         </div>

         <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
               <h3 className="font-semibold text-lg line-clamp-1">
                  {product.title}
               </h3>
               {product.editHistory && product.editHistory.length > 0 && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                     {t('updated')}: {new Date(product.editHistory[0].changedAt).toLocaleDateString()}
                  </span>
               )}
            </div>
            <p className="text-sm text-muted-foreground">{product.price} {t("currency")}</p>
         </CardHeader>

         <CardFooter className="flex gap-2 pt-4">
            <EditProduct product={product} disabled={isLoading} />

            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isLoading}>
                     <MoreHorizontal className="w-4 h-4" />
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>

                  <DropdownMenuItem asChild>
                     <ProductDrawer
                        id={product.id.toString()}
                        name={product.title}
                        description={product.description}
                        price={product.price}
                        imageUrls={product.images}
                        attributes={product.attributes}
                     >
                        <span
                           className={cn(
                              "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                           )}
                        >
                           <Eye className="w-4 h-4 mr-2" /> {t("preview")}
                        </span>
                     </ProductDrawer>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                     onSelect={(e) => e.preventDefault()}
                     asChild
                  >
                     <CommentsDrawerTrigger
                        productId={product.id.toString()}
                        productName={product.title}
                     >
                        <MessageSquare className="w-4 h-4 mr-2" /> {t("comments")}
                     </CommentsDrawerTrigger>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                     onClick={handleToggleStatus}
                     className="cursor-pointer"
                  >
                     {isPublished ? (
                        <>
                           <PauseCircle className="w-4 h-4 mr-2" /> {t("unpublish")}
                        </>
                     ) : (
                        <>
                           <PlayCircle className="w-4 h-4 mr-2" /> {t("publish")}
                        </>
                     )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                     onClick={handleDelete}
                     className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                  >
                     {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     ) : (
                        <Trash className="w-4 h-4 mr-2" />
                     )}
                     {t("delete")}
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </CardFooter>
      </Card>
   );
}
