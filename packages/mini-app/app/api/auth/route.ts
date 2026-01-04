// Gerekli Next.js ve TypeScript tiplerini içe aktarıyoruz
import { validateTelegramInitData } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
/**
 * Telegram Mini Uygulamasından gelen initData'yı doğrulamak için POST isteği işleyicisi.
 * @param request Gelen Next.js isteği
 * @returns Başarı veya hata yanıtı
 */
export async function POST(request: NextRequest) {
   try {
      // 1. İstek gövdesini JSON olarak okuyoruz
      const body = await request.json();

      // 2. 'initData' alanını gövdeden çıkarıyoruz
      const initData: string | undefined = body.initData;

      // 3. initData'nın varlığını ve tipini kontrol ediyoruz
      if (!initData || typeof initData !== "string") {
         console.error("Hata: İstek gövdesinde geçerli initData bulunamadı.");

         // Eksik veya hatalı giriş için 400 Bad Request döndürüyoruz
         return NextResponse.json(
            {
               success: false,
               message: "initData stringi gereklidir.",
            },
            { status: 400 }
         );
      }

      // 4. Mevcut doğrulama fonksiyonunuzu çağırıyoruz
      const isValid = validateTelegramInitData(initData);

      // 5. Sonuca göre yanıtı döndürüyoruz
      if (isValid) {
         // Doğrulama başarılı
         console.log("Başarılı: Telegram Init Data doğrulandı.");
         return NextResponse.json(
            {
               success: true,
               message: "Veri başarıyla doğrulandı.",
               // İstenirse, buradan kullanıcı bilgisi gibi ek veri de döndürülebilir
            },
            { status: 200 }
         );
      } else {
         // Doğrulama başarısız
         console.warn(
            "Başarısız: Telegram Init Data doğrulanamadı. Olası yetkisiz erişim."
         );
         return NextResponse.json(
            {
               success: false,
               message: "Yetkisiz erişim. initData doğrulanamadı.",
            },
            { status: 401 } // 401 Unauthorized
         );
      }
   } catch (error) {
      // İstek gövdesini okurken veya JSON ayrıştırılırken hata oluşursa
      console.error("Sunucu Hatası:", error);
      return NextResponse.json(
         {
            success: false,
            message: "İç sunucu hatası.",
         },
         { status: 500 }
      );
   }
}

// Diğer HTTP metotlarına (GET, PUT, vb.) izin vermemek için isterseniz ekleyebilirsiniz
export async function GET() {
   return NextResponse.json(
      { message: "Sadece POST istekleri kabul edilir." },
      { status: 405 }
   );
}
