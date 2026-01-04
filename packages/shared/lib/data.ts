// lib/data.ts

import { unstable_noStore as noStore } from "next/cache"; // 👈 Bu satırı ekleyin
import { prisma } from "./prisma";
import { Product } from "@/generated/prisma/client";

// API rotanızdaki tüm mantığı buraya taşıyın.
export async function getProducts({
   limit = 20,
   page = 1,
}): Promise<Product[]> {
   noStore(); // 👈 Veri çekimini dinamik hale getirir ve önbelleği devre dışı bırakır.

   const skip = (page - 1) * limit;
   try {
      const products = await prisma.product.findMany({
         where: { status: "AVAILABLE" },
         skip: skip,
         take: limit,
         orderBy: { createdAt: "desc" },
      });
      return products;
   } catch (error) {
      console.error("Veritabanı hatası:", error);
      return [];
   }
}
