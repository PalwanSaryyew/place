// components/product/InfiniteProductList.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "./ProductCard";
import { INITIAL_LIMIT } from "@/lib/settings";
import { toast } from "sonner";
import { Product } from "@/generated/prisma/client";

// Types expected by the API
interface ProductData {
   products: Product[];
}

// Receives initial data and API URL from the server component.
interface InfiniteProductListProps {
   initialProducts: Product[];
   apiUrl: string;
}

const PRODUCTS_PER_PAGE = INITIAL_LIMIT; // Must match API route (default 'limit').

export default function InfiniteProductList({
   initialProducts,
   apiUrl,
}: InfiniteProductListProps) {
   const [products, setProducts] = useState<Product[]>(initialProducts);
   const [page, setPage] = useState(2); // Initially page is 1 loaded, next page is 2
   const [hasMore, setHasMore] = useState(
      initialProducts.length === PRODUCTS_PER_PAGE
   ); // Whether more data is available
   const [isLoading, setIsLoading] = useState(false);

   // Div element to act as trigger for infinite scrolling.
   const loaderRef = useRef<HTMLDivElement>(null);

   // Asynchronous function that pulls the next page from the API
   const loadMoreProducts = useCallback(async () => {
      if (!hasMore || isLoading) return;

      setIsLoading(true);
      try {
         // We send limit and page parameters to the API route.
         const response = await fetch(
            `${apiUrl}/api/getall?limit=${PRODUCTS_PER_PAGE}&page=${page}`
         );

         if (!response.ok) {
            toast.error("Önümleri ýüklemekde ýalňyşlyk ýüze çykdy. (1)");
            setIsLoading(false);
            return;
         }

         const data: ProductData = await response.json();

         setProducts((prevProducts) => [...prevProducts, ...data.products]);
         setPage((prevPage) => prevPage + 1);

         // If the number of incoming products is less than the requested limit, there is no more data.
         if (data.products.length < PRODUCTS_PER_PAGE) {
            setHasMore(false);
         }
      } catch (error) {
         console.error("Data extraction error:", error);
         toast.error("Önümleri ýüklemekde ýalňyşlyk ýüze çykdy. (2)");
      } finally {
         setIsLoading(false);
      }
   }, [apiUrl, page, hasMore, isLoading]); // We add dependencies.

   // Set up Intersection Observer
   useEffect(() => {
      const observer = new IntersectionObserver(
         (entries) => {
            // If the trigger field is visible and there is more data, call loadMoreProducts
            if (entries[0].isIntersecting && hasMore && !isLoading) {
               loadMoreProducts();
            }
         },
         {
            root: null, // use viewport as root
            rootMargin: "0px",
            threshold: 1.0,
         }
      );

      const currentLoader = loaderRef.current;

      if (currentLoader) {
         observer.observe(currentLoader);
      }

      // Clear observer when component is unmounted
      return () => {
         if (currentLoader) {
            observer.unobserve(currentLoader);
         }
      };
   }, [loadMoreProducts, hasMore, isLoading]);

   return (
      <>
         <div
            className="
                    grid gap-2 px-4 
                    grid-cols-2              /* Varsayılan: İki Sütun */
                    sm:grid-cols-3           /* sm (640px) ve üstü: Üç Sütun */
                    md:grid-cols-4           /* md (768px) ve üstü: Dört Sütun */
                    lg:grid-cols-5           /* lg (1024px) ve üstü: Beş Sütun */
                    xl:grid-cols-6           /* xl (1280px) ve üstü: Altı Sütun */
                "
         >
            {/* List all uploaded products */}
            {products.map((product) => (
               <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.title}
                  description={product.description}
                  price={product.price}
                  imageUrls={product.images}
               />
            ))}
         </div>

         {/* Trigger and Loading Status Area */}
         {hasMore && (
            <div ref={loaderRef} className="col-span-full py-6 text-center">
               {isLoading ? (
                  <p className="text-blue-500 font-semibold">
                     Bildirişler yüklenyär...
                  </p>
               ) : (
                  // LoaderRef is attached to this div. When the user sees this field, new data will be pulled..
                  <p className="text-gray-400">Dowamy ýüklenyär.</p>
               )}
            </div>
         )}

         {!hasMore && products.length > 0 && (
            <div className="col-span-full py-10 text-center text-gray-500">
               Gutardy!
            </div>
         )}

         {products.length === 0 && (
            <div className="col-span-full text-center py-10 text-xl text-gray-500">
               Bildiriş ýok.
            </div>
         )}
      </>
   );
}
