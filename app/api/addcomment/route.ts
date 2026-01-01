// /app/api/addcomment/route.ts
import { getUserDataFromInitData, validateTelegramInitData } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
   try {
      const { initData, productId, text } = await request.json();

      // 1. Gelen veriyi doğrula
      if (!initData || !productId || !text) {
         return NextResponse.json(
            { error: "Eksik parametreler: initData, productId ve text zorunludur." },
            { status: 400 }
         );
      }

      if (text.trim().length < 1 || text.trim().length > 500) {
         return NextResponse.json(
            { error: "Yorum metni 1 ile 500 karakter arasında olmalıdır." },
            { status: 400 }
         );
      }

      // 2. Telegram kullanıcısını doğrula
      const isDataValid = await validateTelegramInitData(initData);
      const userData = await getUserDataFromInitData(initData);

      if ((process.env.NODE_ENV !== "development" && !isDataValid) || !userData?.id) {
         return NextResponse.json(
            { error: "Geçersiz kullanıcı kimliği veya yetkisiz erişim." },
            { status: 401 }
         );
      }

      const userIdString = userData.id.toString();

      // 3. Kullanıcıyı veritabanında bul veya oluştur (Upsert)
      const user = await prisma.user.upsert({
         where: { id: userIdString },
         update: { lastActivity: new Date() }, // Sadece aktivite zamanını güncelle
         create: {
            id: userIdString,
            firstName: userData.first_name,
            lastName: userData.last_name || null,
            username: userData.username || null,
            languageCode: userData.language_code || null,
            lastActivity: new Date(),
         },
      });

      // 4. Yorumu veritabanına kaydet
      const newComment = await prisma.comment.create({
         data: {
            text: text.trim(),
            productId: productId,
            userId: user.id,
         },
         include: { // Yorumu yapan kullanıcının bilgisini de döndür
            user: {
               select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  username: true,
               },
            },
         },
      });

      // 5. Başarılı yanıtı yeni yorumla birlikte döndür
      return NextResponse.json(newComment, { status: 201 });

   } catch (error) {
      console.error("Yorum eklenirken hata oluştu:", error);
      return NextResponse.json(
         { error: "Sunucu hatası. Yorum eklenemedi." },
         { status: 500 }
      );
   }
}
