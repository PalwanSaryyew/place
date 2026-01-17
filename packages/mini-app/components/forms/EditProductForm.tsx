"use client";

import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter }  from "next/navigation";
import { ChangeEvent, FormEvent, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useWebApp } from "@/context/WebAppContext";
import { toast } from "sonner";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "../ui/field";
import { Input } from "../ui/input";
import { CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Product } from "@/generated/prisma/client";
import PubgAccountFields from "./dynamic/PubgAccountFields";
import TelegramNftGiftFields from "./dynamic/TelegramNftGiftFields";

interface Category {
   id: number;
   name: string;
   children: Category[];
}

interface Attributes {
    [key: string]: string | number;
}

interface EditProductFormProps {
   product: Product & { category: { name: string, parentId: number | null }};
   onSuccess?: () => void;
}

export default function EditProductForm({ product, onSuccess }: EditProductFormProps) {
   const t = useTranslations("editProductForm");
   const webApp = useWebApp();
   const router = useRouter();
   const fileInputRef = useRef<HTMLInputElement>(null);

   const [existingImages, setExistingImages] = useState<string[]>(product.images || []);
   const [newTempImageUrls, setNewTempImageUrls] = useState<string[]>([]);
   const [isUploading, setIsUploading] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   
   const [parentCategoryName, setParentCategoryName] = useState<string>('');

   useEffect(() => {
      const fetchCategories = async () => {
         try {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            
            // Find parent category name
            if (product.category.parentId) {
                const parent = data.find((c: Category) => c.id === product.category.parentId);
                if (parent) {
                    setParentCategoryName(parent.name);
                }
            }
         } catch (error) {
            console.error(error);
            toast.error(t("failed_to_load_categories"));
         }
      };
      fetchCategories();
   }, [t, product.category.parentId]);


   const totalImages = existingImages.length + newTempImageUrls.length;

   const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      if (totalImages + files.length > 6) {
         toast.error(t("max_6_images"));
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

         if (!response.ok) throw new Error(t("image_upload_failed"));

         const { uploadedFileNames } = await response.json();
         const newUrls = uploadedFileNames.map((name: string) => `/api/tempimages/${name}`);
         setNewTempImageUrls(prev => [...prev, ...newUrls]);

      } catch (error) {
         console.log(error);
         toast.error(t("image_upload_error"));
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
   };
   
   const handleUploadClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      fileInputRef.current?.click();
   };

   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting || isUploading || totalImages === 0) return;

      setIsSubmitting(true);
      toast.info(t("updating_data"));

      const form = event.currentTarget;
      const formValues = new FormData(form);
      
      const attributes: { [key: string]: string | number } = {};
      const attributeRegex = /attributes\[(.*?)\]/;
      for (const [key, value] of formValues.entries()) {
         const match = key.match(attributeRegex);
         if (match && value) {
            const attrName = match[1];
             if (attrName === "game_id") {
               attributes[attrName] = value as string;
            } else {
               const numValue = parseFloat(value as string);
               if (!isNaN(numValue)) {
                  attributes[attrName] = numValue;
               }
            }
         }
      }

      const payload = {
         productId: product.id,
         initData: webApp?.initData || "",
         title: formValues.get("title") as string,
         price: formValues.get("price") as string,
         description: formValues.get("description") as string,
         keptImages: existingImages, 
         newTempImageUrls: newTempImageUrls,
         attributes, // Include attributes in the payload
      };

      try {
         const response = await fetch("/api/updateproduct", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
         });

         if (response.ok) {
            toast.success(t("product_updated_successfully"));
            if (onSuccess) onSuccess();
            router.refresh();
         } else {
            const error = await response.json();
            toast.error(`${t("error")}: ${error.error || t("something_went_wrong")}`);
         }
      } catch (error) {
         console.log(error);
         toast.error(t("network_error"));
      } finally {
         setIsSubmitting(false);
      }
   };
   
   const renderDynamicFields = () => {
      if (!product.category?.name) return null;

      switch (product.category.name) {
         case 'PUBG Accounts':
            const pubgAttributes: Attributes = typeof product.attributes === 'string'
                ? JSON.parse(product.attributes)
                : product.attributes as Attributes;
            return <PubgAccountFields attributes={pubgAttributes} />;
         case 'Telegram NFT Gifts':
             const telegramAttributes: Attributes = typeof product.attributes === 'string'
                ? JSON.parse(product.attributes)
                : product.attributes as Attributes;
            return <TelegramNftGiftFields attributes={telegramAttributes} />;
         default:
            return null;
      }
   }

   return (
      <div className="w-full max-w-md mx-auto">
         <form onSubmit={handleSubmit}>
            <FieldGroup>
                 <FieldSet>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>{t("main_category")}</FieldLabel>
                            <Input value={parentCategoryName} disabled />
                        </Field>
                        <Field>
                           <FieldLabel>{t("sub_category")}</FieldLabel>
                           <Input value={product.category.name} disabled />
                        </Field>
                    </FieldGroup>
                </FieldSet>

                 <FieldSet>
                  <FieldLegend>{t("product_information")}</FieldLegend>
                  <FieldDescription>{t("edit_account_information")}</FieldDescription>
                  <Field>
                     <FieldLabel htmlFor="title">{t("short_title")}</FieldLabel>
                     <Input id="title" name="title" defaultValue={product.title} required />
                  </Field>
                  <Field>
                     <FieldLabel htmlFor="price">{t("price_in_tmt")}</FieldLabel>
                     <Input id="price" name="price" type="number" defaultValue={product.price} required />
                  </Field>
               </FieldSet>

                {renderDynamicFields()}

               <FieldSet>
                  <div className="bg-popover rounded-lg border-dashed border-2 grid py-2 cursor-pointer min-h-[200px]" onClick={handleUploadClick}>
                     {totalImages > 0 ? (
                        <div className="grid grid-cols-3 gap-2 px-2">
                           {existingImages.map((url, index) => (
                              <div key={url + index} className="relative aspect-square">
                                 <Image src={url} alt={t("previous_image")} className="w-full h-full object-cover rounded-md" fill sizes="33vw" />
                                 <button type="button" onClick={(e) => { e.stopPropagation(); removeExistingImage(url); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-10"><X size={12} /></button>
                              </div>
                           ))}
                           {newTempImageUrls.map((url) => (
                              <div key={url} className="relative aspect-square">
                                 <Image src={url} alt={t("new_image")} className="w-full h-full object-cover rounded-md" fill sizes="33vw" />
                                 <button type="button" onClick={(e) => { e.stopPropagation(); removeNewTempImage(url); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-10"><X size={12} /></button>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="flex flex-col items-center justify-center">
                           <ImagePlus color="gray" size={35} />
                           <CardHeader><CardTitle className="text-center text-sm">{t("select_images")}</CardTitle><CardDescription className="text-center text-xs">{t("at_least_one_image")}</CardDescription></CardHeader>
                        </div>
                     )}
                     <CardFooter className="flex justify-center items-center mt-auto pt-4">
                        {isUploading ? (
                           <Button type="button" variant="secondary" size="sm" disabled><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("uploading")}</Button>
                        ) : (
                           <Button type="button" variant="secondary" size="sm" onClick={handleUploadClick} disabled={totalImages >= 6}><Upload className="w-4 h-4 mr-2" /> {t("add_image")}</Button>
                        )}
                        <input type="file" ref={fileInputRef} multiple accept="image/*" className="sr-only" onChange={handleFileChange} disabled={isUploading} />
                     </CardFooter>
                  </div>
               </FieldSet>

               <FieldSet>
                  <Field>
                     <FieldLabel htmlFor="description">{t("detailed_description")}</FieldLabel>
                     <Textarea id="description" name="description" defaultValue={product.description || ""} className="resize-none" rows={6} required />
                  </Field>
               </FieldSet>
            </FieldGroup>
            
            <div className="mt-4">
               <Button type="submit" className="w-full" disabled={isSubmitting || isUploading || totalImages === 0}>
                  {isSubmitting ? t("updating") : t("update")}
               </Button>
            </div>
         </form>
      </div>
   );
}
