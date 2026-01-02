// components/forms/dynamic/PubgAccountFields.tsx
import {
    Field,
    FieldGroup,
    FieldLabel,
 } from "@/components/ui/field";
 import { Input } from "@/components/ui/input";
 
 export default function PubgAccountFields() {
    return (
       <FieldGroup>
          <Field>
             <FieldLabel htmlFor="account_level">Account Level</FieldLabel>
             <Input id="account_level" name="attributes.account_level" type="number" placeholder="e.g., 72" />
          </Field>
          <Field>
          <FieldLabel htmlFor="royale_pass">Royale Pass</FieldLabel>
          <Input id="royale_pass" name="attributes.royale_pass" type="text" placeholder="e.g., M1-M15" />
       </Field>
       </FieldGroup>
    );
 }
 