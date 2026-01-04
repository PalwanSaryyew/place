// components/telegram-theme-provider.tsx

"use client";

import React, { useEffect, useState } from "react";
import { applyTelegramTheme, TelegramThemeParams } from "@/utils/apply-theme"; // 1. adımda oluşturduğumuz dosya
import { webApp } from "@/lib/webApp";

/**
 * TelegramTemaSağlayıcı (Telegram Theme Provider)
 * Uygulama yüklendiğinde Telegram tema renklerini uygular
 */
export function TelegramThemeProvider({
   children,
}: {
   children: React.ReactNode;
}) {
   const [isThemeApplied, setIsThemeApplied] = useState(false);

   useEffect(() => {
      let cleanup: (() => void) | undefined;

      async function getApp() {
         const WebApp = await webApp();
         // WebApp'in başlatılıp başlatılmadığını kontrol et
         if (WebApp.initData && WebApp.themeParams && !isThemeApplied) {
            // WebApp.themeParams may have a broader type; cast it to the expected shape
            const themeParams: TelegramThemeParams = WebApp.themeParams as unknown as TelegramThemeParams;

            console.log("Telegram Tema Parametreleri Yüklendi:", themeParams);

            // Renkleri CSS değişkenlerine uygula
            applyTelegramTheme(themeParams);
            setIsThemeApplied(true);

            // Opsiyonel: Eğer kullanıcı Telegram uygulamasında temayı değiştirirse
            // dinamik olarak güncellemek için event listener ekle
            const onThemeChanged = () => {
               // Tema değiştiğinde applyTelegramTheme'i tekrar çağır
               applyTelegramTheme(WebApp.themeParams as unknown as TelegramThemeParams);
               console.log("Telegram Tema Değişti ve Uygulandı.");
            };
            WebApp.onEvent("themeChanged", onThemeChanged);

            // Cleanup fonksiyonu: Component kaldırıldığında listener'ı temizle
            cleanup = () => {
               WebApp.offEvent("themeChanged", onThemeChanged);
            };
         }
      }

      getApp();

      return () => {
         cleanup?.();
      };
   }, [isThemeApplied]);

   // Tema yüklenirken bir yüklenme ekranı gösterebilirsiniz,
   // ancak genellikle bu işlem çok hızlıdır.
   return <>{children}</>;
}
