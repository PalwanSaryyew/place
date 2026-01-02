import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
   try {
      const categories = await prisma.category.findMany({
         where: {
            parentId: null,
         },
         include: {
            children: true,
         },
      });

      // Convert id to string for frontend compatibility
      const formattedCategories = categories.map((category) => ({
         ...category,
         id: category.id.toString(),
         children: category.children.map((child) => ({
            ...child,
            id: child.id.toString(),
         })),
      }));

      return NextResponse.json(formattedCategories);
   } catch (error) {
      console.error("Error fetching categories:", error);
      return new NextResponse("Internal Server Error", { status: 500 });
   }
}
