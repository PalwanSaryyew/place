// components/popover/ProductDrawer.tsx
"use client";

import { CommentsDrawer } from "./CommentsDrawer";
import { ProductPhotosCarousel } from "../product/ProductPhotosCarousel";
import { ProductCardProps } from "../product/ProductCard";
import { webApp as Webapp } from "@/lib/webApp";
import { WebApp } from "@twa-dev/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
   Drawer,
   DrawerContent,
   DrawerHeader,
   DrawerTitle,
   DrawerDescription,
   DrawerFooter,
   DrawerClose,
} from "@/components/ui/drawer";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import * as React from "react";
import { MessageCircle, PanelBottomClose, Send } from "lucide-react";
import { GiBuyCard } from "react-icons/gi";
import { useTranslations } from "next-intl";

// TWA Tip Tanımlamaları (shareMessage özelliğini ekliyoruz)
const isTwaAvailable = (
   app: WebApp
): app is WebApp & {
   BackButton: unknown;
   initData: string;
   shareMessage: (msgId: string, callback?: (result: boolean) => void) => void;
} => {
   return (
      !!app.initData &&
      !!app.BackButton &&
      typeof app.BackButton.show === "function"
   );
};

export function ProductDrawer({
   children,
   id,
   name,
   description,
   price,
   imageUrls,
}: ProductCardProps & {
   children: React.ReactNode;
}) {
   const [webApp, setWebApp] = React.useState<WebApp | undefined>();
   const [isLoading, setIsLoading] = React.useState(false);
   const [isSharing, setIsSharing] = React.useState(false); 
   const [isCommentsOpen, setIsCommentsOpen] = React.useState(false); 

   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const isOpen = searchParams.get("product-id") === id;

   const t = useTranslations("productDrawer");

   React.useEffect(() => {
      const initWebApp = async () => {
         if (typeof window !== "undefined") {
            try {
               const app = await Webapp();
               setWebApp(app);
            } catch (e) {
               console.error("TWA yüklenemedi", e);
            }
         }
      };
      initWebApp();
   }, []);

   React.useEffect(() => {
      if (isOpen) {
         const timer = setTimeout(() => setIsLoading(false), 150);
         return () => clearTimeout(timer);
      }
   }, [isOpen]);

   const openDrawer = () => {
      setIsLoading(true);
      const params = new URLSearchParams(searchParams.toString());
      params.set("product-id", id);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
   };

   const closeDrawer = React.useCallback(() => {
      const currentId = searchParams.get("product-id");
      if (currentId === id) {
         router.back();
      }
   }, [id, searchParams, router]);

   const onOpenChange = (open: boolean) => {
      if (!open) {
         setIsLoading(false);
         closeDrawer();
      }
   };

   const handleSmartShare = async () => {
      if (!webApp || !isTwaAvailable(webApp)) {
         alert("Bu özellik sadece Telegram içinde çalışır.");
         return;
      }

      const userId = webApp.initDataUnsafe?.user?.id;

      if (!userId) {
         alert("Kullanıcı bilgisi alınamadı.");
         return;
      }

      setIsSharing(true);

      try {
         const response = await fetch("/api/share/prepare", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               productId: id,
               title: name,
               price: price,
               description: description,
               imageUrl: imageUrls[0],
               userId: userId,
            }),
         });

         if (!response.ok) {
            throw new Error("API Error");
         }

         const data = await response.json();

         if (data.preparedMessageId) {
            webApp.shareMessage(data.preparedMessageId, (result) => {
               if (result) {
                  console.log("Mesaj başarıyla paylaşıldı!");
               }
            });
         } else {
            console.error("Mesaj ID alınamadı");
         }
      } catch (error) {
         console.error("Paylaşım hatası:", error);
      } finally {
         setIsSharing(false);
      }
   };

   React.useEffect(() => {
      if (!webApp || !isTwaAvailable(webApp)) return;
      const handleTwaBack = () => router.back();

      if (isOpen) {
         webApp.BackButton.show();
         webApp.BackButton.onClick(handleTwaBack);
      } else {
         webApp.BackButton.hide();
         webApp.BackButton.offClick(handleTwaBack);
      }

      return () => {
         if(webApp && webApp.BackButton) {
            webApp.BackButton.offClick(handleTwaBack);
         }
      };
   }, [isOpen, webApp, router]);

   const DrawerLoadingContent = () => (
      <div className="flex-1 overflow-y-auto px-4">
         <div className="flex justify-center pt-4">
            <Skeleton className="h-64 w-full rounded-xl" />
         </div>
         <div className="mt-4 space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
         </div>
      </div>
   );

   const DrawerRealContent = () => (
      <div className="flex-1 overflow-y-auto px-4">
         <div className="flex justify-center pt-4">
            <ProductPhotosCarousel imageUrls={imageUrls} />
         </div>
         <DrawerHeader className="px-0 mt-4 text-left">
            <DrawerTitle className="text-2xl font-bold text-left">
               {name}
            </DrawerTitle>
            <div className="text-left mt-2">
               <Badge variant={"secondary"} className="text-sm">
                  {price} TMT
               </Badge>
            </div>
            <DrawerDescription className="mt-2 text-base text-left leading-relaxed">
               {description}
            </DrawerDescription>
         </DrawerHeader>
      </div>
   );

   return (
      <>
         <Drawer open={isOpen || isLoading} onOpenChange={onOpenChange}>
            <div onClick={openDrawer} className="cursor-pointer">
               {children}
            </div>

            <DrawerContent className="!max-h-[90dvh] flex flex-col focus:outline-none">
               {isLoading && !isOpen ? (
                  <DrawerLoadingContent />
               ) : (
                  <DrawerRealContent />
               )}

               <DrawerFooter className="pt-2 bg-card rounded-t-4xl border-t">
                  <div className="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden">
                     <Button
                        variant="secondary"
                        disabled={isLoading && !isOpen}
                        className="w-full rounded-sm shadow-none border-none bg-popover hover:bg-secondary text-foreground"
                     >
                        <GiBuyCard />
                        {t("buy")}
                     </Button>

                     <Button
                        variant="secondary"
                        onClick={() => setIsCommentsOpen(true)}
                        disabled={isLoading && !isOpen}
                        className="w-full rounded-sm shadow-none border-none bg-popover hover:bg-secondary text-foreground"
                     >
                        <MessageCircle />
                        {t("comments")}
                     </Button>

                     <Button
                        variant="secondary"
                        onClick={handleSmartShare}
                        disabled={(isLoading && !isOpen) || isSharing}
                        className="w-full rounded-sm shadow-none border-none bg-popover hover:bg-secondary text-foreground"
                     >
                        <Send />
                        {isSharing ? t("share.wait") : t("share.share")}
                     </Button>

                     <DrawerClose asChild>
                        <Button
                           variant="secondary"
                           className="w-full rounded-sm shadow-none border-none bg-popover hover:bg-destructive hover:text-destructive-foreground text-foreground"
                        >
                           <PanelBottomClose />
                           {t("close")}
                        </Button>
                     </DrawerClose>
                  </div>
               </DrawerFooter>
            </DrawerContent>
         </Drawer>

         <CommentsDrawer
            productId={id}
            productName={name}
            isOpen={isCommentsOpen}
            onOpenChange={setIsCommentsOpen}
         />
      </>
   );
}
