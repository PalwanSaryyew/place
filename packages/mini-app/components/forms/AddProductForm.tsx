"use client";
import { Button } from "@/components/ui/button";
import {
   Field,
   FieldDescription,
   FieldGroup,
   FieldLabel,
   FieldLegend,
   FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { useRef, useState, ChangeEvent, FormEvent, useEffect } from "react";
import Image from "next/image";
import { useWebApp } from "@/context/WebAppContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import PubgAccountFields from "./dynamic/PubgAccountFields";
import TelegramNftGiftFields from "./dynamic/TelegramNftGiftFields";


interface Category {
   id: string;
   name: string;
   children: Category[];
}

export default function AddProductForm() {
   const webApp = useWebApp();
   const router = useRouter();
   const fileInputRef = useRef<HTMLInputElement>(null);

   const [tempImageUrls, setTempImageUrls] = useState<string[]>([]);
   const [isUploading, setIsUploading] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   const [categories, setCategories] = useState<Category[]>([]);
   const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);
   const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

   useEffect(() => {
      const fetchCategories = async () => {
         try {
            const response = await fetch('/api/categories');
            if (!response.ok) {
               throw new Error('Failed to fetch categories');
            }
            const data = await response.json();
            setCategories(data);
         } catch (error) {
            console.error(error);
            toast.error("Kategoriýalary ýükläp bolmady.");
         }
      };
      fetchCategories();
   }, []);

   const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;
      if (tempImageUrls.length + files.length > 6) {
         toast.error("Iň köp 6 surat ýükläp bilersiňiz.");
         return;
      }
      setIsUploading(true);
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      try {
         const response = await fetch("/api/upload/temp", {
            method: "POST",
            body: formData,
         });
         if (!response.ok) {
            throw new Error("Surat ýüklenmedi");
         }
         const { uploadedFileNames } = await response.json();
         const newUrls = uploadedFileNames.map(
            (name: string) => `/api/tempimages/${name}`
         );
         setTempImageUrls((prev) => [...prev, ...newUrls]);
      } catch (error) {
         console.error(error);
         toast.error("Surat ýüklemekde ýalňyşlyk ýüze çykdy.");
      } finally {
         setIsUploading(false);
         if (fileInputRef.current) {
            fileInputRef.current.value = "";
         }
      }
   };

   const removeTempImage = (urlToRemove: string) => {
      setTempImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
   };

   const handleUploadClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      fileInputRef.current?.click();
   };

   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting || tempImageUrls.length === 0 || !selectedSubCategory) {
          toast.warning("Kategoriýa saýlanyň.")
         return
      };

      setIsSubmitting(true);
      toast.info("Maglumatlar ugradylýar...");

      const form = event.currentTarget;
      const formData = new FormData(form);
      const title = formData.get("title") as string;
      const price = formData.get("price") as string;
      const description = formData.get("description") as string;

      const attributes: { [key: string]: string | number } = {};
      const attributeRegex = /attributes\[(.*?)\]/;
      for (const [key, value] of formData.entries()) {
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
         initData: webApp?.initData || "",
         title,
         price,
         description,
         tempImageUrls,
         categoryId: selectedSubCategory,
         attributes
      };

      try {
         const response = await fetch("/api/addproduct", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
         });

         if (response.ok) {
            toast.success("Önüm üstünlikli goşuldy!");
            router.push("/myproducts");
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

   const parentCategories = categories;
   const subCategories = selectedParentCategory
      ? categories.find(c => c.id === selectedParentCategory)?.children || []
      : [];

   const renderDynamicFields = () => {
      const subCategory = subCategories.find(sc => sc.id === selectedSubCategory);
      if (!subCategory) return null;

      switch (subCategory.name) {
         case 'PUBG Accounts':
            return <PubgAccountFields />;
         case 'Telegram NFT Gifts':
            return <TelegramNftGiftFields />;
         default:
            return null;
      }
   }

 
   return (
      <div className="w-full max-w-md mx-auto">
         <form onSubmit={handleSubmit}>
            <FieldGroup>
               <FieldSet>
                  <FieldLegend>Önüm goş</FieldLegend>
                  <FieldDescription>
                     Harydyňyzy satlyga çykarmak üçin maglumatlary giriziň we suratlary ýükläň.
                  </FieldDescription>
               </FieldSet>

               <FieldSet>
                  <FieldGroup>
                     <Field>
                        <FieldLabel>Esasy kategoriýa</FieldLabel>
                        <Select onValueChange={(value) => {
                           setSelectedParentCategory(value)
                           setSelectedSubCategory(null)
                        }}
                        >
                           <SelectTrigger>
                              <SelectValue placeholder="Kategoriýa saýlaň" />
                           </SelectTrigger>
                           <SelectContent>
                              {parentCategories.map(category => (
                                 <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </Field>
                     {selectedParentCategory && (
                        <Field>
                           <FieldLabel>Içki kategoriýa</FieldLabel>
                           <Select onValueChange={setSelectedSubCategory}
                           >
                              <SelectTrigger>
                                 <SelectValue placeholder="Içki kategoriýa saýlaň" />
                              </SelectTrigger>
                              <SelectContent>
                                 {subCategories.map(category => (
                                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                        </Field>
                     )}
                  </FieldGroup>
               </FieldSet>

               {selectedSubCategory && (
                  <>
                     <FieldSet>
                        <FieldGroup>
                           <Field>
                              <FieldLabel htmlFor="title">Gysgaça ady</FieldLabel>
                              <Input
                                 id="title"
                                 name="title"
                                 minLength={5}
                                 maxLength={20}
                                 placeholder="20 simwoldan az"
                                 required
                              />
                           </Field>
                        </FieldGroup>
                     </FieldSet>
                     <FieldSet>
                        <FieldGroup>
                           <Field>
                              <FieldLabel htmlFor="price">Bahasy (USDT)</FieldLabel>
                              <Input
                                 id="price"
                                 name="price"
                                 type="number"
                                 min={1}
                                 step="0.01"
                                 placeholder="Bahasyny giriziň"
                                 required
                              />
                           </Field>
                        </FieldGroup>
                     </FieldSet>

                     {renderDynamicFields()}

                     <FieldSet>
                        <div
                           className="bg-popover rounded-lg border-dashed border-2 grid py-2 cursor-pointer min-h-[200px]"
                           onClick={handleUploadClick}
                        >
                           {tempImageUrls.length > 0 ? (
                              <div className="grid grid-cols-3 gap-2 px-2">
                                 {tempImageUrls.map((url, index) => (
                                    <div key={url} className="relative aspect-square">
                                       <Image
                                          src={url}
                                          alt={`Önizleme ${index + 1}`}
                                          className="w-full h-full object-cover rounded-md border"
                                          fill
                                          sizes="33vw"
                                       />
                                       <button
                                          type="button"
                                          onClick={(e) => {
                                             e.stopPropagation();
                                             removeTempImage(url);
                                          }}
                                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 z-10"
                                       >
                                          <X size={12} />
                                       </button>
                                       {index === 0 && (
                                          <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1 rounded-sm z-10">
                                             Esasy
                                          </span>
                                       )}
                                    </div>
                                 ))}
                              </div>
                           ) : (
                              <div className="flex flex-col  ">
                                 <ImagePlus color="gray" size={46} className="self-center my-2" />
                                 <CardHeader>
                                    <CardTitle className="text-center text-sm">
                                       Suratlary ýükläň
                                    </CardTitle>
                                    <CardDescription className="text-center text-xs">
                                       Azyndan 1 surat bolmaly.
                                    </CardDescription>
                                 </CardHeader>
                              </div>
                           )}
                           <CardFooter className="flex justify-center items-center mt-auto pt-4">
                              {isUploading ? (
                                 <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    disabled
                                 >
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                                    Ýüklenýär...
                                 </Button>
                              ) : (
                                 <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleUploadClick}
                                    disabled={tempImageUrls.length >= 6}
                                 >
                                    <Upload className="w-4 h-4 mr-2" /> Saýla
                                 </Button>
                              )}
                              <input
                                 type="file"
                                 name="images"
                                 ref={fileInputRef}
                                 multiple
                                 accept="image/*"
                                 className="sr-only"
                                 onChange={handleFileChange}
                                 disabled={isUploading}
                              />
                           </CardFooter>
                        </div>
                     </FieldSet>

                     <FieldSet>
                        <FieldGroup>
                           <Field>
                              <FieldLabel htmlFor="description">
                                 Giňişleýin düşündiriş
                              </FieldLabel>
                              <Textarea
                                 minLength={20}
                                 maxLength={10000}
                                 id="description"
                                 name="description"
                                 placeholder="Goşmaça maglumatlary şu ýere giriziň..."
                                 className="resize-none"
                                 required
                              />
                           </Field>
                        </FieldGroup>
                     </FieldSet>
                  </>
               )}
            </FieldGroup>

            <div className="mt-4">
               <Button
                  type="submit"
                  className="w-full"
                  disabled={
                     isSubmitting || isUploading || tempImageUrls.length === 0 || !selectedSubCategory
                  }
               >
                  {isSubmitting ? "Ugradylýar..." : "Tabşyr"}
               </Button>
            </div>
         </form>
      </div>
   );
}
