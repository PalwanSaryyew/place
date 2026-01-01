import { getUserDataFromInitData, validateTelegramInitData } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { deleteProduct, toggleProductStatus } from "@/actions/product-actions";
import { prisma } from "@/lib/prisma";

export async function DELETE(
   request: NextRequest,
   context: { params: Promise<{ id: string }> }
) {
   try {
      const { initData } = await request.json();
      const { id: productId } = await context.params;

      if (!initData) {
         return NextResponse.json(
            { error: "initData is missing." },
            { status: 400 }
         );
      }

      const isDataValid = await validateTelegramInitData(initData);
      const userData = await getUserDataFromInitData(initData);

      if (
         (process.env.NODE_ENV !== "development" && !isDataValid) ||
         !userData?.id
      ) {
         return NextResponse.json(
            { error: "Unauthorized access or user ID is missing." },
            { status: 401 }
         );
      }

      const telegramIdString = userData.id.toString();

      const user = await prisma.user.findUnique({
         where: { id: telegramIdString },
         select: { id: true },
      });

      if (!user) {
         return NextResponse.json(
            { error: "User not found in the database." },
            { status: 404 }
         );
      }

      const product = await prisma.product.findUnique({
         where: { id: productId },
         select: { userId: true },
      });

      if (!product) {
         return NextResponse.json(
            { error: "Product not found." },
            { status: 404 }
         );
      }

      if (product.userId !== user.id) {
         return NextResponse.json(
            { error: "User is not authorized to delete this product." },
            { status: 403 }
         );
      }

      const result = await deleteProduct(productId);

      if (result.success) {
         return NextResponse.json({ success: true }, { status: 200 });
      } else {
         return NextResponse.json(
            { success: false, error: result.error },
            { status: 500 }
         );
      }
   } catch (error) {
      const errorMessage =
         error instanceof Error ? error.message : String(error);
      console.error("Error in API route:", errorMessage);
      return NextResponse.json(
         { error: "Server error. Could not delete product." },
         { status: 500 }
      );
   }
}

export async function PATCH(
   request: NextRequest,
   context: { params: Promise<{ id: string }> }
) {
   try {
      const { initData, isPublished } = await request.json();
      const { id: productId } = await context.params;

      if (!initData) {
         return NextResponse.json(
            { error: "initData is missing." },
            { status: 400 }
         );
      }

      const isDataValid = await validateTelegramInitData(initData);
      const userData = await getUserDataFromInitData(initData);

      if (
         (process.env.NODE_ENV !== "development" && !isDataValid) ||
         !userData?.id
      ) {
         return NextResponse.json(
            { error: "Unauthorized access or user ID is missing." },
            { status: 401 }
         );
      }

      const telegramIdString = userData.id.toString();

      const user = await prisma.user.findUnique({
         where: { id: telegramIdString },
         select: { id: true },
      });

      if (!user) {
         return NextResponse.json(
            { error: "User not found in the database." },
            { status: 404 }
         );
      }

      const product = await prisma.product.findUnique({
         where: { id: productId },
         select: { userId: true },
      });

      if (!product) {
         return NextResponse.json(
            { error: "Product not found." },
            { status: 404 }
         );
      }

      if (product.userId !== user.id) {
         return NextResponse.json(
            { error: "User is not authorized to update this product." },
            { status: 403 }
         );
      }

      const result = await toggleProductStatus(productId, isPublished);
      console.log(result);

      if (result.success) {
         return NextResponse.json({ success: true }, { status: 200 });
      } else {
         return NextResponse.json(
            { success: false, error: result.error },
            { status: 500 }
         );
      }
   } catch (error) {
      const errorMessage =
         error instanceof Error ? error.message : String(error);
      console.error("Error in API route:", errorMessage);
      return NextResponse.json(
         { error: "Server error. Could not update product status." },
         { status: 500 }
      );
   }
}
