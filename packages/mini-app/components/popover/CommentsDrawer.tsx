// components/popover/CommentsDrawer.tsx
"use client";

import * as React from "react";
import {
   Drawer,
   DrawerContent,
   DrawerHeader,
   DrawerTitle,
   DrawerDescription,
   DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { RiTelegram2Fill } from "react-icons/ri";
import { useWebApp } from "@/context/WebAppContext";

// Gelen yorumlar için tip tanımı
type CommentWithUser = {
   id: string;
   text: string;
   createdAt: string;
   user: {
      firstName: string;
      lastName: string | null;
   };
};

interface CommentsDrawerProps {
   productId: string;
   productName: string;
   isOpen: boolean;
   onOpenChange: (open: boolean) => void;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
   productId,
   productName,
   isOpen,
   onOpenChange,
}) => {
   const { initData } = useWebApp();
   const [comments, setComments] = React.useState<CommentWithUser[]>([]);
   const [isLoadingComments, setIsLoadingComments] = React.useState(false);
   const [error, setError] = React.useState<string | null>(null);

   const [isSubmitting, setIsSubmitting] = React.useState(false);
   const [submitError, setSubmitError] = React.useState<string | null>(null);

   React.useEffect(() => {
      const fetchComments = async () => {
         if (!isOpen || !productId) return;

         setIsLoadingComments(true);
         setError(null);
         try {
            const response = await fetch(`/api/comments/${productId}`);
            if (!response.ok) {
               const errorData = await response.json();
               throw new Error(errorData.error || "Yorumlar yüklenemedi.");
            }
            const data = await response.json();
            setComments(data);
         } catch (err: Error | unknown) {
            setError(err instanceof Error ? err.message : "Yorumlar yüklenemedi.");
         } finally {
            setIsLoadingComments(false);
         }
      };

      fetchComments();
   }, [isOpen, productId]);

   const handleCommentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const commentText = formData.get("comment") as string;
      const form = event.currentTarget;

      if (!commentText.trim()) return;

      if (!initData) {
         setSubmitError("Yorum gönderebilmek için Telegram uygulaması gereklidir.");
         return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
         const response = await fetch("/api/addcomment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               initData: initData,
               productId: productId,
               text: commentText,
            }),
         });
		 
         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Yorum gönderilemedi.");
         }

         const newComment = await response.json();
         setComments((prevComments) => [newComment, ...prevComments]);
         form.reset();
      } catch (err: Error | unknown) {
         setSubmitError(err instanceof Error ? err.message : "Yorum gönderilemedi.");
      } finally {
         setIsSubmitting(false);
      }
   };

   const renderContent = () => {
      if (isLoadingComments) {
         return (
            <div className="space-y-4">
               {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-accent/20 p-3 rounded-lg">
                     <Skeleton className="h-4 w-1/4 mb-2" />
                     <Skeleton className="h-4 w-3/4" />
                  </div>
               ))}
            </div>
         );
      }

      if (error) {
         return <div className="text-center text-red-500">{error}</div>;
      }

      if (comments.length === 0) {
         return <div className="text-center text-muted-foreground">Heniz teswir ýok. Birinji bol!</div>;
      }

      return comments.map((comment) => (
         <div key={comment.id} className="bg-accent/20 p-3 rounded-lg">
            <p className="font-semibold text-sm">
               {comment.user.firstName} {comment.user.lastName}
            </p>
            <p className="text-muted-foreground text-sm">{comment.text}</p>
         </div>
      ));
   };

   return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
         <DrawerContent className="!h-[50dvh] flex flex-col focus:outline-none">
            <DrawerHeader>
               <DrawerTitle>Teswirler ({!isLoadingComments && !error ? comments.length : "..."})</DrawerTitle>
               <DrawerDescription>{productName} harydy üçin edilen teswirler.</DrawerDescription>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto px-4 space-y-4">{renderContent()}</div>
            <DrawerFooter className="mt-auto pt-4">
               <form onSubmit={handleCommentSubmit} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 bg-input border border-input rounded-3xl">
                     <Input
                        className="!bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        name="comment"
                        placeholder="Teswiriňizi ýazyň..."
                        autoComplete="off"
                        disabled={isSubmitting}
                     />
                     <Button type="submit" size={"icon"} className="rounded-full p-0 bg-primary m-[2px]" disabled={isSubmitting}>
                        {isSubmitting ? (
                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                           <RiTelegram2Fill className="scale-150" />
                        )}
                     </Button>
                  </div>
                  {submitError && <p className="text-xs text-red-500 px-4">{submitError}</p>}
               </form>
            </DrawerFooter>
         </DrawerContent>
      </Drawer>
   );
};
