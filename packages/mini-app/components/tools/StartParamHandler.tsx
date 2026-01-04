// app/components/tools/StartParamHandler.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { webApp } from "@/lib/webApp";
import { WebApp as WebAppType } from "@twa-dev/types";

export function StartParamHandler() {
  const router = useRouter();
  
  // Bu ref, bileşen render olsa bile sıfırlanmaz.
  // Uygulama yenilenmediği sürece hafızada tutulur.
  const isExecuted = useRef(false);

  useEffect(() => {
    const handleStartParam = async () => {
      // 1. Eğer daha önce çalıştıysa DUR.
      // React Strict Mode yüzünden 2 kere çalışsa bile bu korur.
      if (isExecuted.current || typeof window === "undefined") return;

      try {
        const app = (await webApp()) as WebAppType;
        const startParam = app.initDataUnsafe?.start_param;

        // 2. start_param var mı?
        if (startParam && startParam.startsWith("product-")) {
          const productId = startParam.replace("product-", "");

          console.log("🚀 Deep Link Algılandı, Yönlendiriliyor:", productId);
          
          // 3. İŞLEMİ İŞARETLE (Çok Önemli)
          // Bunu router işleminden HEMEN ÖNCE yapıyoruz ki döngüye girmesin.
          isExecuted.current = true;

          // 4. push kullanıyoruz ki "Geri" tuşu geçmişte bir yer bulabilsin.
          // replace yaparsak geri tuşu uygulamayı kapatabilir.
          router.push(`/?product-id=${productId}`, { scroll: false });
        }
      } catch (e) {
        console.error("Start param hatası:", e);
      }
    };

    handleStartParam();

    // DİKKAT: Bağımlılık dizisi (dependency array) BOŞ olmalı [].
    // Böylece URL (searchParams) değişse bile bu kod tekrar çalışmaz.
  }, [router]); 

  return null;
}