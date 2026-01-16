import {
   Card,
   CardContent,
   CardDescription,
   CardFooter,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { ProductDrawer } from "../popover/ProductDrawer";
import { JsonValue } from "@/generated/prisma/internal/prismaNamespace";
import { useTranslations } from "next-intl";

export interface ProductCardProps {
   id: string;
   name: string;
   description: string;
   price: number;
   imageUrls: string[];
   attributes: JsonValue;
}

export default function ProductCard({
   id,
   name,
   description,
   price,
   imageUrls,
   attributes,
}: ProductCardProps) {
   const t = useTranslations("productCard");
   return (
      <ProductDrawer
         id={id}
         name={name}
         description={description}
         price={price}
         imageUrls={imageUrls}
         attributes={attributes}
      >
         <Card className="w-full overflow-hidden pt-0 pb-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-2xl">
            <CardHeader className="p-0">
               <div className="relative w-full aspect-video">
                  <Image
                     fill
                     src={imageUrls[0]}
                     alt={name}
                     className="object-cover"
                  />
               </div>
               <CardTitle className="text-lg sm:text-xl font-bold leading-tight truncate px-2">
                  {name}
               </CardTitle>
               {/* <CardAction>Card Action</CardAction> */}
            </CardHeader>
            <CardContent className="px-2">
               <CardDescription className="text-sm sm:text-base whitespace-pre-wrap max-h-24 overflow-y-auto">
                  {description}
               </CardDescription>
            </CardContent>
            <CardFooter className="text-lg px-4 md:text-2xl font-extrabold text-primary">
               {price} {t("currency")}
            </CardFooter>
         </Card>
      </ProductDrawer>
   );
}
