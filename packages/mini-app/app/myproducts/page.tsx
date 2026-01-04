// /app/myproducts/page.tsx
"use client";
import { useWebApp } from "@/context/WebAppContext";
import { useEffect, useState } from "react";

import { Loader2, AlertTriangle } from "lucide-react";

import { MyProductCard } from "@/components/product/my-product-card";

// Ürün tipi (Prisma modelinize göre ayarlayın)
import { Product } from "@/generated/prisma/client";

export default function MyProductsPage() {
   // Güncellenmiş context'ten hem webApp hem de initData'yı al
   const { initData } = useWebApp();
   const [products, setProducts] = useState<Product[]>([]);
   // isLoading başlangıçta false olabilir, çünkü initData'nın gelmesini bekleyeceğiz
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   useEffect(() => {
      // initData null ise (henüz yükleniyor) veya boş ise bir şey yapma
      if (!initData) {
         // Eğer initData'nın gelmesini bekliyorsak, isLoading true kalabilir.
         // Eğer context'te bir hata oluştuysa initData hiç gelmeyebilir.
         // Şimdilik sadece bekleyelim.
         return;
      }

      const fetchProducts = async () => {
         setIsLoading(true);
         setError(null);
         try {
            console.log("API'ye gönderilen initData:", initData);
            const response = await fetch("/api/myproducts", {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify({ initData: initData }),
            });

            if (response.ok) {
               const data = await response.json();
               setProducts(data.products || []);
            } else {
               const errorData = await response.json();
               setError(
                  errorData.error || "Ürünler yüklenirken bir hata oluştu."
               );
            }
         } catch (err) {
            const errorMessage =
               err instanceof Error ? err.message : String(err);
            console.error("Fetch hatası:", errorMessage);
            setError(`Ağ hatası: ${errorMessage}`);
         } finally {
            setIsLoading(false);
         }
      };

      fetchProducts();
   }, [initData]); // useEffect artık sadece ve sadece initData'ya bağımlı

   return (
      <div className="p-4 max-w-2xl mx-auto">
         <h1 className="text-2xl font-bold mb-6">Meniň Satlyk Hasaplarym</h1>

         {/* Yükleme ve Hata Durumları */}
         {isLoading && (
            <div className="flex justify-center items-center h-40">
               <Loader2 className="w-6 h-6 animate-spin mr-2" />
               <p>Önümler ýüklenýär...</p>
            </div>
         )}

         {error && (
            <div className="flex items-center p-4 rounded-lg bg-red-100 text-red-800">
               <AlertTriangle className="w-5 h-5 mr-2" />
               <p>Error: {error}</p>
            </div>
         )}

         {/* Ürün Listesi */}
         {!isLoading &&
            !error &&
            (products.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                     <MyProductCard key={product.id} product={product} />
                  ))}
               </div>
            ) : (
               <p className="text-center text-gray-500 mt-10">
                  Hiç hili satlyk hasap tapylmady. Täze hasap goşmak üçin Goş
                  düwmesine basyň.
               </p>
            ))}
      </div>
   );
}
