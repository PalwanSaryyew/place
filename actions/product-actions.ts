// actions/product-actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export async function toggleProductStatus(
   productId: string,
   currentStatus: boolean
) {
   try {
      await prisma.product.update({
         where: { id: productId },
         data: { isPublished: !currentStatus },
      });
      return { success: true };
   } catch (error) {
      console.error("Status update error:", error);
      return { success: false, error: "Veritabanı hatası" };
   }
}

export async function deleteProduct(productId: string) {
   try {
      const product = await prisma.product.findUnique({
         where: { id: productId },
         select: { images: true },
      });

      if (!product) {
         return { success: false, error: "Ürün bulunamadı" };
      }

      // Delete images from the uploads folder
      if (product.images && product.images.length > 0) {
         for (const image of product.images) {
            const filename = path.basename(image);
            const imagePath = path.join(process.cwd(), "uploads", filename);
            try {
               await fs.unlink(imagePath);
            } catch (error: Error | unknown) {
               // Log the error but continue, maybe the file doesn't exist
               console.error(`Error deleting image ${imagePath}:`, error);
            }
         }
      }

      await prisma.product.delete({
         where: { id: productId },
      });
      return { success: true };
   } catch (error) {
      console.error("Delete product error:", error);
      return { success: false, error: "Silme işlemi başarısız" };
   }
}
