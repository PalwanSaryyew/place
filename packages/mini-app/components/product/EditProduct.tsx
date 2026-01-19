"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
   Drawer,
   DrawerContent,
   DrawerHeader,
   DrawerTitle,
   DrawerDescription,
   DrawerFooter,
   DrawerClose,
} from "@/components/ui/drawer";
import EditProductForm from "@/components/forms/EditProductForm";
import { Edit } from "lucide-react";
import { Product, Category } from "@/generated/prisma/client";
import { useTranslations } from "next-intl";

// Manually define the type as a workaround
interface ProductEditHistory {
  id: number;
  changedAt: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oldValues: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  newValues: any;
  productId: number;
}

type ProductWithCategory = Product & {
   category: Category;
   editHistory?: ProductEditHistory[];
};

interface EditProductProps {
    product: ProductWithCategory;
    disabled?: boolean;
}

export function EditProduct({ product, disabled }: EditProductProps) {
    const t = useTranslations("editProduct");
    const [isOpen, setIsOpen] = useState(false);

    const handleSuccess = () => {
        setIsOpen(false);
    };

    return (
        <>
            <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsOpen(true)}
                disabled={disabled}
            >
                <Edit className="w-4 h-4 mr-2" />
                {t("edit")}
            </Button>
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <DrawerContent className="max-h-[90dvh]">
                    <DrawerHeader>
                        <DrawerTitle>{t("edit_product")}: {product.title}</DrawerTitle>
                        <DrawerDescription>
                            {t("you_can_update_the_information")}
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 overflow-y-auto">
                        <EditProductForm product={product} onSuccess={handleSuccess} />
                    </div>
                    <DrawerFooter className="pt-2">
                        <DrawerClose asChild>
                            <Button variant="outline">{t("cancel")}</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
