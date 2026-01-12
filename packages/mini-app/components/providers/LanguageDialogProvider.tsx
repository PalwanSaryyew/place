"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { changeLanguage } from "@/actions/language-actions";
import { useRouter } from "next/navigation";

export function LanguageDialogProvider({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale?: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const t = useTranslations("languageDialog");
  const router = useRouter();

  useEffect(() => {
    if (!locale) {
      setDialogOpen(true);
    }
  }, [locale]);

  const handleLanguageChange = (newLocale: string) => {
    changeLanguage(newLocale);
    setDialogOpen(false);
    router.refresh();
  };

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("explanation")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Button onClick={() => handleLanguageChange("en")}>English</Button>
            <Button onClick={() => handleLanguageChange("tk")}>Türkmen</Button>
            <Button onClick={() => handleLanguageChange("tr")}>Türkçe</Button>
            <Button onClick={() => handleLanguageChange("ru")}>Русский</Button>
          </div>
        </DialogContent>
      </Dialog>
      {children}
    </>
  );
}
