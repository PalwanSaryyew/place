// app/api/comments/[productId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Belirli bir ürün ID'sine göre yorumları getirir.
 * @param request NextRequest
 * @param params productId içeren obje
 * @returns Yorumların listesi veya hata mesajı
 */
export async function GET(
   request: NextRequest,
   context: { params: Promise<{ productId: string }> }
) {
   try {
      const { productId } = await context.params;

      if (!productId) {
         return NextResponse.json(
            { error: "Ürün ID'si gerekli." },
            { status: 400 }
         );
      }

      const comments = await prisma.comment.findMany({
         where: {
            productId: parseInt(productId),
         },
         include: {
            user: {
               select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  username: true,
               },
            },
         },
         orderBy: {
            createdAt: "desc", // En yeni yorumlar üstte
         },
      });

      if (!comments) {
         return NextResponse.json(
            { error: "Yorumlar bulunamadı." },
            { status: 404 }
         );
      }

      return NextResponse.json(comments, { status: 200 });
   } catch (error) {
      console.error("Yorumları çekerken hata oluştu:", error);
      return NextResponse.json(
         { error: "Yorumları çekerken bir hata oluştu." },
         { status: 500 }
      );
   }
}
