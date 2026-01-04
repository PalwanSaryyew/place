// context/WebAppContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { DEV_USER_ID } from "@/lib/settings";

// Context'in yeni veri yapısı: Hem SDK nesnesini hem de initData'yı ayrı ayrı tutar
export interface WebAppContextType {
   webApp: typeof WebApp | null;
   initData: string | null;
}

const WebAppContext = createContext<WebAppContextType | null>(null);

export const useWebApp = () => {
   const context = useContext(WebAppContext);
   if (!context) {
      throw new Error("useWebApp must be used within a WebAppProvider");
   }
   return context;
};

export const WebAppProvider = ({ children }: { children: React.ReactNode }) => {
   const [webApp, setWebApp] = useState<typeof WebApp | null>(null);
   const [initData, setInitData] = useState<string | null>(null);

   useEffect(() => {
      const initWebApp = async () => {
         if (typeof window === "undefined") return;

         try {
            const sdk = (await import("@twa-dev/sdk")).default;
            
            // SDK'yı state'e ayarla
            setWebApp(sdk);
            
            await sdk.ready();

            // SDK'dan gelen gerçek initData'yı kontrol et
            if (sdk.initData && sdk.initData.length > 0) {
               console.log("Gerçek Telegram initData bulundu.");
               setInitData(sdk.initData);
            } else {
               // Gerçek initData yoksa (örn. masaüstü tarayıcı), sahte veri oluştur
               console.log("Gerçek initData bulunamadı, sahte veri oluşturuluyor.");
               const testUser = {
                  id: DEV_USER_ID,
                  first_name: "Test",
                  last_name: "User",
                  username: "testuser",
                  language_code: "en",
                  is_premium: true,
               };
               const mockInitData = new URLSearchParams({
                  user: JSON.stringify(testUser)
               }).toString();
               
               setInitData(mockInitData);
            }

            // SDK ile ilgili diğer ayarlar (renk vb.)
            sdk.setHeaderColor(sdk.themeParams.header_bg_color);
            sdk.setBackgroundColor(sdk.themeParams.bg_color);
            
         } catch (error) {
            console.error("Telegram SDK başlatılırken hata oluştu:", error);
            // Hata durumunda initData'yı null olarak bırakabilir veya
            // hata işleme state'i ekleyebilirsiniz.
            setInitData(null); 
         }
      };

      initWebApp();
   }, []);

   // Provider'a hem webApp hem de initData'yı içeren bir nesne ver
   const value = { webApp, initData };

   return (
      <WebAppContext.Provider value={value}>{children}</WebAppContext.Provider>
   );
};
