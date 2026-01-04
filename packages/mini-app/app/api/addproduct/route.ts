// /app/api/addproduct/route.ts - REFACTORED
import { getUserDataFromInitData, validateTelegramInitData } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { rename, access, mkdir } from "fs/promises";
import { constants } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

export const maxDuration = 3000;

export async function POST(request: NextRequest) {
   try {
      // --- 1. Read JSON payload ---
      const body = await request.json();
      const {
         initData,
         title,
         price: priceString,
         description,
         tempImageUrls,
         categoryId,
         attributes,
      } = body;

      // --- 2. Authentication ---
      if (!initData) {
         return NextResponse.json(
            { error: "initData is missing." },
            { status: 400 }
         );
      }
      const userData = getUserDataFromInitData(initData);
      if (process.env.NODE_ENV === "production") {
         if (!validateTelegramInitData(initData)) {
            return NextResponse.json(
               { error: "Invalid initData." },
               { status: 401 }
            );
         }
      }
      if (!userData?.id) {
         return NextResponse.json(
            { error: "Could not retrieve user ID." },
            { status: 400 }
         );
      }

      // --- 3. Validation ---
      if (
         !title ||
         title.length < 5 ||
         !description ||
         description.length < 20 ||
         !priceString ||
         !tempImageUrls ||
         tempImageUrls.length === 0 ||
         !categoryId
      ) {
         return NextResponse.json(
            { error: "Required fields are missing or invalid." },
            { status: 400 }
         );
      }
      const price = parseFloat(priceString);
      if (isNaN(price) || price <= 0) {
         return NextResponse.json({ error: "Invalid price." }, { status: 400 });
      }
      const categoryIdInt = parseInt(categoryId);
      if (isNaN(categoryIdInt)) {
         return NextResponse.json(
            { error: "Invalid category ID." },
            { status: 400 }
         );
      }

      // --- 4. Move files from temp to uploads ---
      const finalImagePaths: string[] = [];
      const tempDir = path.join(process.cwd(), "temp");
      const uploadDir = path.join(process.cwd(), "uploads");

      try {
         await access(uploadDir, constants.F_OK);
      } catch {
         await mkdir(uploadDir, { recursive: true });
      }

      for (const tempUrl of tempImageUrls) {
         const filename = path.basename(tempUrl);
         const tempFilePath = path.join(tempDir, filename);
         const finalFilePath = path.join(uploadDir, filename);

         try {
            await rename(tempFilePath, finalFilePath);
            finalImagePaths.push(`/api/images/${filename}`); // Create final URL
         } catch (error) {
            console.warn(`Could not move file: ${filename}`, error);
            // Decide if you want to skip this file or fail the request
         }
      }

      if (finalImagePaths.length === 0) {
         return NextResponse.json(
            { error: "No images could be processed." },
            { status: 500 }
         );
      }

      // --- 5. Database Operations ---
      const user = await prisma.user.upsert({
         where: { id: userData.id.toString() },
         update: {
            firstName: userData.first_name,
            lastName: userData.last_name || null,
            username: userData.username || null,
            languageCode: userData.language_code || null,
            lastActivity: new Date(),
         },
         create: {
            id: userData.id.toString(),
            firstName: userData.first_name,
            lastName: userData.last_name || null,
            username: userData.username || null,
            languageCode: userData.language_code || null,
            lastActivity: new Date(),
         },
      });

      const newProduct = await prisma.product.create({
         data: {
            title,
            description,
            price,
            images: finalImagePaths,
            userId: user.id,
            categoryId: categoryIdInt,
            attributes,
         },
      });

      // --- 6. Return Success Response ---
      return NextResponse.json(
         {
            message: "Product created successfully!",
            product: newProduct,
         },
         { status: 200 }
      );
   } catch (error) {
      console.error("Add product error:", error);
      return NextResponse.json(
         { error: "Server error during product creation." },
         { status: 500 }
      );
   }
}
