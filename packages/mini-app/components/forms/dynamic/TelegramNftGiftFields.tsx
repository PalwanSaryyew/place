// components/forms/dynamic/TelegramNftGiftFields.tsx
import {
    Field,
    FieldGroup,
    FieldLabel,
 } from "@/components/ui/field";
 import { Input } from "@/components/ui/input";
 
 export default function TelegramNftGiftFields() {
    return (
       <FieldGroup>
          <Field>
             <FieldLabel htmlFor="nft_collection">NFT Collection</FieldLabel>
             <Input id="nft_collection" name="attributes.nft_collection" type="text" placeholder="e.g., Rare usernames" />
          </Field>
          <Field>
          <FieldLabel htmlFor="validity">Validity</FieldLabel>
          <Input id="validity" name="attributes.validity" type="text" placeholder="e.g., 1 year" />
       </Field>
       </FieldGroup>
    );
 }