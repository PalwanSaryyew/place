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
import { Product } from "@/generated/prisma/client";

interface EditProductProps {
    product: Product;
    disabled?: boolean;
}

export function EditProduct({ product, disabled }: EditProductProps) {
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
                Düzediş
            </Button>
            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <DrawerContent className="max-h-[90dvh]">
                    <DrawerHeader>
                        <DrawerTitle>Önümi Düzediň: {product.title}</DrawerTitle>
                        <DrawerDescription>
                            Maglumatlary täzeläp bilersiňiz.
                        </DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 overflow-y-auto">
                        <EditProductForm product={product} onSuccess={handleSuccess} />
                    </div>
                    <DrawerFooter className="pt-2">
                        <DrawerClose asChild>
                            <Button variant="outline">Bes et</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}
