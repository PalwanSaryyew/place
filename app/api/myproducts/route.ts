// /app/api/myproducts/route.ts
import { getUserDataFromInitData, validateTelegramInitData } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Promise'e zaman aşımı ekleyen yardımcı fonksiyon
function withTimeout<T>(
   promise: Promise<T>,
   ms: number
): Promise<T> {
   return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
         reject(new Error(`İstek zaman aşımına uğradı (${ms}ms)`));
      }, ms);

      promise
         .then((res) => {
            clearTimeout(timeoutId);
            resolve(res);
         })
         .catch((err) => {
            clearTimeout(timeoutId);
            reject(err);
         });
   });
}


export async function POST(request: NextRequest) {
   console.log("/api/myproducts isteği alındı.");
   try {
      const { initData } = await request.json();

      if (!initData) {
         console.error("Hata: initData eksik.");
         return NextResponse.json(
            { error: "initData eksik." },
            { status: 400 }
         );
      }

      console.log("initData doğrulanıyor...");
      const isDataValid = await validateTelegramInitData(initData);
      const userData = await getUserDataFromInitData(initData);

      if (
         (process.env.NODE_ENV !== "development" && !isDataValid) ||
         !userData?.id
      ) {
         console.error("Hata: Yetkisiz erişim veya kullanıcı kimliği eksik.");
         return NextResponse.json(
            { error: "Yetkisiz erişim veya kullanıcı kimliği eksik." },
            { status: 401 }
         );
      }

      const telegramIdString = userData.id.toString();
      console.log(`Kullanıcı ID'si ${telegramIdString} için işlem yapılıyor.`);

      // --- ZAMAN AŞIMI İLE VERİTABANI İŞLEMİ ---
      const DATABASE_TIMEOUT = 8000; // 8 saniye

      console.log("Veritabanından kullanıcı aranıyor...");
      const user = await withTimeout(prisma.user.findUnique({
         where: { id: telegramIdString },
         select: { id: true },
      }), DATABASE_TIMEOUT);
      
      if (!user) {
         console.error(`Kullanıcı ${telegramIdString} veritabanında bulunamadı.`);
         return NextResponse.json(
            { error: "Kullanıcı veritabanında bulunamadı." },
            { status: 404 }
         );
      }
      
      console.log(`Kullanıcı ${user.id} bulundu, ürünleri aranıyor...`);
      const products = await withTimeout(prisma.product.findMany({
         where: { userId: user.id },
         orderBy: { createdAt: "desc" },
      }), DATABASE_TIMEOUT);

      console.log(`${products.length} adet ürün bulundu ve gönderiliyor.`);
      return NextResponse.json({ products: products, }, { status: 200 });

   } catch (error) {
      // Hatanın bir Error nesnesi olup olmadığını kontrol edelim
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("API rotasında hata oluştu:", errorMessage);

      // Zaman aşımı hatasını ön yüze gönder
      if (errorMessage.includes("zaman aşımına uğradı")) {
         return NextResponse.json(
            { error: "Veritabanı bağlantısı zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin." },
            { status: 504 } // Gateway Timeout
         );
      }

      return NextResponse.json(
         { error: "Sunucu hatası. Ürünler yüklenemedi." },
         { status: 500 }
      );
   }
}
