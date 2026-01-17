// /app/api/updateproduct/route.ts - REFACTORED
import { NextRequest, NextResponse } from "next/server";
import { rename, unlink, access, mkdir } from "fs/promises";
import { constants } from "fs";
import path from "path";
import { getUserDataFromInitData, validateTelegramInitData } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../../shared/generated/prisma/client";

export const maxDuration = 3000;

export async function POST(request: NextRequest) {
   try {
      // --- 1. Read JSON payload ---
      const body = await request.json();
      const { 
         productId, 
         initData, 
         title, 
         price: priceString, 
         description, 
         keptImages, 
         newTempImageUrls,
         attributes // <<< Destructure attributes
      } = body;

      // --- 2. Authentication and Authorization ---
      if (!initData || !productId) {
         return NextResponse.json({ error: "initData or Product ID is missing." }, { status: 400 });
      }
      const userData = getUserDataFromInitData(initData);
      if (process.env.NODE_ENV === "production") {
         if (!validateTelegramInitData(initData)) {
            return NextResponse.json({ error: "Invalid initData." }, { status: 401 });
         }
      }
      if (!userData?.id) {
         return NextResponse.json({ error: "Could not retrieve user ID." }, { status: 400 });
      }

      // --- 3. Field Validation ---
      if (!title || title.length < 5 || !description || description.length < 20 || !priceString) {
         return NextResponse.json({ error: "Required fields are missing or invalid." }, { status: 400 });
      }
      const price = parseFloat(priceString);
      if (isNaN(price) || price <= 0) {
         return NextResponse.json({ error: "Invalid price." }, { status: 400 });
      }
      if (keptImages.length === 0 && newTempImageUrls.length === 0) {
        return NextResponse.json({ error: "At least one image is required." }, { status: 400 });
      }

      // --- 4. Fetch Original Product (before transaction) ---
      const originalProduct = await prisma.product.findUnique({ where: { id: productId } });
      if (!originalProduct) {
         return NextResponse.json({ error: "Product not found." }, { status: 404 });
      }
      if (originalProduct.userId !== userData.id.toString()) {
         return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
      }
      
      // --- 5. Handle Image File Operations (outside transaction) ---
      const uploadDir = path.join(process.cwd(), "uploads");
      const tempDir = path.join(process.cwd(), "temp");

      // Deletions
      const imagesToDelete = originalProduct.images.filter(imgUrl => !keptImages.includes(imgUrl));
      for (const imageUrl of imagesToDelete) {
         const filename = path.basename(imageUrl);
         const filepath = path.join(uploadDir, filename);
         try {
            await unlink(filepath);
         } catch (error) {
            console.warn(`Failed to delete file: ${filepath}`, error);
         }
      }

      // Additions (move from temp)
      const newFinalImagePaths: string[] = [];
      try {
         await access(uploadDir, constants.F_OK);
      } catch {
         await mkdir(uploadDir, { recursive: true });
      }
      for (const tempUrl of newTempImageUrls) {
          const filename = path.basename(tempUrl);
          const tempFilePath = path.join(tempDir, filename);
          const finalFilePath = path.join(uploadDir, filename);
          try {
              await rename(tempFilePath, finalFilePath);
              newFinalImagePaths.push(`/api/images/${filename}`);
          } catch (error) {
              console.warn(`Could not move file: ${filename}`, error);
          }
      }
      const finalImagePaths = [...keptImages, ...newFinalImagePaths];

      // --- 6. Update Database within a Transaction ---
      const updatedProduct = await prisma.$transaction(async (tx) => {
        // Step 6a: Update the product
        const productUpdate = await tx.product.update({
           where: { id: productId },
           data: { 
               title, 
               description, 
               price, 
               images: finalImagePaths,
               attributes: attributes || originalProduct.attributes // <<< Update attributes
            },
        });

        // Step 6b: Compare and create edit history
        const oldData: Prisma.JsonValue = {};
        const newData: Prisma.JsonValue = {};

        if (originalProduct.title !== title) {
            oldData.title = originalProduct.title;
            newData.title = title;
        }
        if (originalProduct.description !== description) {
            oldData.description = originalProduct.description;
            newData.description = description;
        }
        if (originalProduct.price !== price) {
            oldData.price = originalProduct.price;
            newData.price = price;
        }
        // <<< Compare attributes
        if (JSON.stringify(originalProduct.attributes) !== JSON.stringify(attributes)) {
            oldData.attributes = originalProduct.attributes;
            newData.attributes = attributes;
        }

        // Only create a history record if something actually changed
        if (Object.keys(oldData).length > 0) {
            await tx.productEditHistory.create({
                data: {
                    productId: productId,
                    oldValues: oldData,
                    newValues: newData,
                }
            });
        }

        return productUpdate;
      });


      // --- 7. Return Success Response ---
      return NextResponse.json({
         message: "Product updated successfully!",
         product: updatedProduct,
      }, { status: 200 });

   } catch (error) {
      console.error("Update product error:", error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle transaction errors
        return NextResponse.json({ error: "Database transaction failed." }, { status: 500 });
      }
      return NextResponse.json({ error: "Server error during product update." }, { status: 500 });
   }
}
