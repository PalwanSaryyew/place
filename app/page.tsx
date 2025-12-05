// app/page.tsx
import InfiniteProductList from "@/components/product/InfiniteProductList";
import { getProducts } from "@/lib/data"; // Yeni fonksiyonu import et
import { INITIAL_LIMIT } from "@/lib/settings";
import { getTranslations } from "next-intl/server";

export default async function Page() {
   // Pull initial data directly from Prisma
   const initialProducts = await getProducts({ limit: INITIAL_LIMIT, page: 1 });

   // Pass the API URL for the Client Component to fetch subsequent pages
   const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
   const t = await getTranslations("HomePage");

   return (
      <>
         <h1>{t("title")}</h1>
         <InfiniteProductList
            initialProducts={initialProducts}
            apiUrl={apiUrl}
         />
      </>
   );
}
