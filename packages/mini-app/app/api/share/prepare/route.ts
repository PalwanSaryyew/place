// app/api/share/prepare/route.ts
import { APP_NAME, BOT_USERNAME } from "@/lib/settings";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { productId, title, description, price, imageUrl, userId } =
      await request.json();

    // 1. User ID Kontrolü
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    const startAppParam = `product-${productId}`;
    const deepLinkUrl = `https://t.me/${BOT_USERNAME}/${APP_NAME}?startapp=${startAppParam}`;

    // --- 2. URL DÜZELTME VE TAMAMLAMA ---
    let finalImageUrl = imageUrl;

    // LOG: İlk gelen veriyi görelim
    console.log("Gelen Ham URL:", finalImageUrl);

    // A) Eğer URL '/' ile başlıyorsa (Relative Path), başına domaini ekle
    if (finalImageUrl && finalImageUrl.startsWith("/")) {
      // request.url o anki API çağrısının tam adresidir (örn: https://site.com/api/share/prepare)
      // new URL(request.url).origin bize sadece 'https://site.com' kısmını verir.
      const origin = process.env.NEXT_PUBLIC_API_URL;
      finalImageUrl = `${origin}/${finalImageUrl}`;
      console.log("Tamamlanmış URL:", finalImageUrl);
    }

    // B) Telegram Uyumluluk Kontrolü (Localhost ve HTTP engelleme)
    if (
      !finalImageUrl ||
      !finalImageUrl.startsWith("http") ||
      finalImageUrl.includes("localhost") ||
      finalImageUrl.includes("127.0.0.1")
    ) {
      console.log(
        "⚠️ Geçersiz veya Yerel Resim URL'si, placeholder kullanılıyor."
      );
      // Localhost'ta çalışırken Telegram resimleri göremez, bu yüzden placeholder şarttır.
      // Ancak deploy ettiğinizde yukarıdaki (A) adımı sayesinde gerçek resim gidecektir.
      finalImageUrl =
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop";
    }
    // ------------------------

    // --- 3. CAPTION KISALTMA ---
    const MAX_DESCRIPTION_LENGTH = 800;
    let safeDescription = description || "";

    if (safeDescription.length > MAX_DESCRIPTION_LENGTH) {
      safeDescription =
        safeDescription.substring(0, MAX_DESCRIPTION_LENGTH) + "...";
    }
    // ---------------------------

    const telegramData = {
      user_id: userId,
      result: {
        type: "photo",
        id: productId,
        photo_url: finalImageUrl, // Artık tam URL
        thumb_url: finalImageUrl,
        caption: `<b>${title}</b>\n<u>${price} USDT</u>\n<blockquote expandable>${safeDescription}</blockquote>`,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔎Giňişleýin görmek🔍",
                url: deepLinkUrl,
              },
            ],
          ],
        },
      },
      allow_user_chats: true,
      allow_group_chats: true,
      allow_channel_chats: true,
    };

    const apiResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/savePreparedInlineMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(telegramData),
      }
    );

    const apiResult = await apiResponse.json();

    if (!apiResult.ok) {
      console.error("Telegram API Error:", apiResult);
      throw new Error(apiResult.description);
    }

    return NextResponse.json({
      preparedMessageId: apiResult.result.id,
    });
  } catch (error) {
    console.error("Prepared message error:", error);
    return NextResponse.json(
      { error: "Mesaj hazırlanamadı" },
      { status: 500 }
    );
  }
}