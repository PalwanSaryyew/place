"use client";

import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { useRouter }  from "next/navigation";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import Image from "next/image";
import { useWebApp } from "@/context/WebAppContext";
import { toast } from "sonner";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
import { CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Product } from "@/generated/prisma/client";

interface EditProductFormProps {
   product: Product;
   onSuccess?: () => void;
}

export default function EditProductForm({ product, onSuccess }: EditProductFormProps) {
   const webApp = useWebApp();
   const router = useRouter();
   const fileInputRef = useRef<HTMLInputElement>(null);

   // --- NEW STATE MANAGEMENT ---
   const [existingImages, setExistingImages] = useState<string[]>(product.images || []);
   const [newTempImageUrls, setNewTempImageUrls] = useState<string[]>([]);
   const [isUploading, setIsUploading] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const totalImages = existingImages.length + newTempImageUrls.length;

   // --- IMMEDIATE UPLOAD LOGIC ---
   const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      if (totalImages + files.length > 6) {
         toast.error("Iň köp 6 surat ýükläp bilersiňiz.");
         return;
      }

      setIsUploading(true);
      const formData = new FormData();
      files.forEach(file => formData.append("files", file));

      try {
         const response = await fetch("/api/upload/temp", {
            method: "POST",
            body: formData,
         });

         if (!response.ok) throw new Error("Surat ýüklenmedi");

         const { uploadedFileNames } = await response.json();
         const newUrls = uploadedFileNames.map((name: string) => `/api/tempimages/${name}`);
         setNewTempImageUrls(prev => [...prev, ...newUrls]);

      } catch (error) {
         console.log(error);
         
         toast.error("Surat ýüklemekde ýalňyşlyk ýüze çykdy.");
      } finally {
         setIsUploading(false);
         if (fileInputRef.current) fileInputRef.current.value = "";
      }
   };

    const removeExistingImage = (urlToRemove: string) => {
      setExistingImages(prev => prev.filter(url => url !== urlToRemove));
   };

   const removeNewTempImage = (urlToRemove: string) => {
      setNewTempImageUrls(prev => prev.filter(url => url !== urlToRemove));
      // Note: Does not delete from server temp folder.
   };
   
   const handleUploadClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      fileInputRef.current?.click();
   };

   // --- FINAL FORM SUBMISSION ---
   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting || isUploading || totalImages === 0) return;

      setIsSubmitting(true);
      toast.info("Maglumatlar täzelenýär...");

      const form = event.currentTarget;
      const formValues = new FormData(form);
      
      const payload = {
         productId: product.id,
         initData: webApp?.initData || "",
         title: formValues.get("title") as string,
         price: formValues.get("price") as string,
         description: formValues.get("description") as string,
         keptImages: existingImages, // Images that were not removed
         newTempImageUrls: newTempImageUrls, // Freshly uploaded images
      };

      try {
         const response = await fetch("/api/updateproduct", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
         });

         if (response.ok) {
            toast.success("Önüm üstünlikli täzelendi!");
            if (onSuccess) onSuccess();
            router.refresh();
         } else {
            const error = await response.json();
            toast.error(`Ýalňyşlyk: ${error.error || "Näsazlyk"}`);
         }
      } catch (error) {
         console.log(error);
         
         toast.error("Tor ýalňyşlygy.");
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="w-full max-w-md mx-auto">
         <form onSubmit={handleSubmit}>
            <FieldGroup>
               {/* Form Fields (with defaultValues) */}
                 <FieldSet>
                  <FieldLegend>Önüm maglumatlary</FieldLegend>
                  <FieldDescription>Hasabyň maglumatlaryny düzediň.</FieldDescription>
                  <Field>
                     <FieldLabel htmlFor="title">Gysgaça ady</FieldLabel>
                     <Input id="title" name="title" defaultValue={product.title} required />
                  </Field>
                  <Field>
                     <FieldLabel htmlFor="price">Bahasy (TMT)</FieldLabel>
                     <Input id="price" name="price" type="number" defaultValue={product.price} required />
                  </Field>
               </FieldSet>

               {/* --- REFACTORED IMAGE UPLOAD AREA --- */}
               <FieldSet>
                  <div className="bg-popover rounded-lg border-dashed border-2 grid py-2 cursor-pointer min-h-[200px]" onClick={handleUploadClick}>
                     {totalImages > 0 ? (
                        <div className="grid grid-cols-3 gap-2 px-2">
                           {/* Render existing images */}
                           {existingImages.map((url, index) => (
                              <div key={url + index} className="relative aspect-square">
                                 <Image src={url} alt="Öňki surat" className="w-full h-full object-cover rounded-md" fill sizes="33vw" />
                                 <button type="button" onClick={(e) => { e.stopPropagation(); removeExistingImage(url); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-10"><X size={12} /></button>
                              </div>
                           ))}
                           {/* Render new temp images */}
                           {newTempImageUrls.map((url) => (
                              <div key={url} className="relative aspect-square">
                                 <Image src={url} alt="Täze surat" className="w-full h-full object-cover rounded-md" fill sizes="33vw" />
                                 <button type="button" onClick={(e) => { e.stopPropagation(); removeNewTempImage(url); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-10"><X size={12} /></button>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center">
                           <ImagePlus color="gray" size={35} />
                           <CardHeader><CardTitle className="text-center text-sm">Suratlary saýlaň</CardTitle><CardDescription className="text-center text-xs">Azyndan 1 surat bolmaly.</CardDescription></CardHeader>
                        </div>
                     )}
                     <CardFooter className="flex justify-center items-center mt-auto pt-4">
                        {isUploading ? (
                           <Button type="button" variant="secondary" size="sm" disabled><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ýüklenýär...</Button>
                        ) : (
                           <Button type="button" variant="secondary" size="sm" onClick={handleUploadClick} disabled={totalImages >= 6}><Upload className="w-4 h-4 mr-2" /> Surat goş</Button>
                        )}
                        <input type="file" ref={fileInputRef} multiple accept="image/*" className="sr-only" onChange={handleFileChange} disabled={isUploading} />
                     </CardFooter>
                  </div>
               </FieldSet>

               {/* Description Field (with defaultValue) */}
               <FieldSet>
                  <Field>
                     <FieldLabel htmlFor="description">Giňişleýin düşündiriş</FieldLabel>
                     <Textarea id="description" name="description" defaultValue={product.description || ""} className="resize-none" rows={6} required />
                  </Field>
               </FieldSet>
            </FieldGroup>
            
            <div className="mt-4">
               <Button type="submit" className="w-full" disabled={isSubmitting || isUploading || totalImages === 0}>
                  {isSubmitting ? "Täzelenýär..." : "Täzele"}
               </Button>
            </div>
         </form>
      </div>
   );
}
