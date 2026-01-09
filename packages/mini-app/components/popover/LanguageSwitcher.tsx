"use client";

import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LanguageSwitcher({ children }: { children: React.ReactNode }) {
   const router = useRouter();
   const [open, setOpen] = useState(false);

   const changeLanguage = (locale: string) => {
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
      router.refresh();
      setOpen(false);
   };
   const t = useTranslations("languageDialog");

   return (
      <Dialog open={open} onOpenChange={setOpen}>
         <DialogTrigger asChild>{children}</DialogTrigger>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>{t("title")}</DialogTitle>
               <DialogDescription>{t("explanation")}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
               <Button onClick={() => changeLanguage("en")}>{t("english")}</Button>
               <Button onClick={() => changeLanguage("tk")}>{t("turkmen")}</Button>
               <Button onClick={() => changeLanguage("ru")}>{t("russian")}</Button>
               <Button onClick={() => changeLanguage("tr")}>{t("turkish")}</Button>
            </div>
         </DialogContent>
      </Dialog>
   );
}
