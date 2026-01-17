import { Product } from "@/generated/prisma/client";
import { ProductEditHistory } from "../../shared/generated/prisma/client";

export type ProductWithHistory = Product & {
  editHistory?: ProductEditHistory[];
};
