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
import { useRef, useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { useWebApp } from "@/context/WebAppContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AddProductForm() {
   const webApp = useWebApp();
   const router = useRouter();
   const fileInputRef = useRef<HTMLInputElement>(null);

   // --- NEW STATE MANAGEMENT ---
   const [tempImageUrls, setTempImageUrls] = useState<string[]>([]);
   const [isUploading, setIsUploading] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   // --- IMMEDIATE UPLOAD LOGIC ---
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
      // Note: This does not delete the file from the server's temp folder.
      // A DELETE API endpoint would be needed for that.
   };

   const handleUploadClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      fileInputRef.current?.click();
   };

   // --- FINAL FORM SUBMISSION ---
   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isSubmitting || tempImageUrls.length === 0) return;

      setIsSubmitting(true);
      toast.info("Maglumatlar ugradylýar...");

      const form = event.currentTarget;
      const formData = new FormData(form);
      const title = formData.get("title") as string;
      const price = formData.get("price") as string;
      const description = formData.get("description") as string;

      const payload = {
         initData: webApp?.initData || "",
         title,
         price,
         description,
         tempImageUrls,
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

   return (
      <div className="w-full max-w-md mx-auto">
         <form onSubmit={handleSubmit}>
            <FieldGroup>
               {/* Form Fields (Unchanged) */}
               <FieldSet>
                  <FieldLegend>PUBG Hasaby </FieldLegend>
                  <FieldDescription>
                     hasabyňyzy satlyga çykarmak üçin maglumatlary giriziň we
                     suratlary ýükläň.
                  </FieldDescription>
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
                        <FieldLabel htmlFor="price">Bahasy (TMT)</FieldLabel>
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

               {/* --- REFACTORED IMAGE UPLOAD AREA --- */}
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
                           <ImagePlus color="gray" size={46} className="self-center my-2"/>
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

               {/* Description Field (Unchanged) */}
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
            </FieldGroup>

            <div className="mt-4">
               <Button
                  type="submit"
                  className="w-full"
                  disabled={
                     isSubmitting || isUploading || tempImageUrls.length === 0
                  }
               >
                  {isSubmitting ? "Ugradylýar..." : "Tabşyr"}
               </Button>
            </div>
         </form>
      </div>
   );
}
