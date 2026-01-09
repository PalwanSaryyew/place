// components/forms/dynamic/TelegramNftGiftFields.tsx
import {
    Field,
    FieldGroup,
    FieldLabel,
 } from "@/components/ui/field";
 import { Input } from "@/components/ui/input";
 import { useTranslations } from "next-intl";
 
 export default function TelegramNftGiftFields() {
   const t = useTranslations("attributes.telegram_nft_gift");
    return (
       <FieldGroup>
          <Field>
             <FieldLabel htmlFor="nft_collection">{t("nft_collection")}</FieldLabel>
             <Input id="nft_collection" name="attributes.nft_collection" type="text" placeholder={t("nft_collection_placeholder")} />
          </Field>
          <Field>
          <FieldLabel htmlFor="validity">{t("validity")}</FieldLabel>
          <Input id="validity" name="attributes.validity" type="text" placeholder={t("validity_placeholder")} />
       </Field>
       </FieldGroup>
    );
 }