// components/forms/dynamic/PubgAccountFields.tsx
"use client";
import { FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import Attribute from "./attributes/Attribute";

export default function PubgAccountFields() {
   const [visibleFields, setVisibleFields] = useState({
      game_id: false,
      account_level: false,
      collection_level: false,
      upgradeable_weapons: false,
      upgradeable_vehicles: false,
      brand_vehicles: false,
      sports_cars: false,
      royale_pass: false,
      companions_count: false,
      ultimate_suits: false,
   });

   const handleCheckboxChange = (field: keyof typeof visibleFields) => {
      setVisibleFields((prev) => ({ ...prev, [field]: !prev[field] }));
   };

   const attributes = [
      { name: "game_id", placeholder: "e.g., 5123456789", type: "text" },
      { name: "account_level", placeholder: "e.g., 75" },
      { name: "collection_level", placeholder: "e.g., 45" },
   ];

   const weaponAttributes = [
      { name: "upgradeable_weapons", placeholder: "e.g., 21" },
      { name: "ultimate_suits", placeholder: "e.g., 6" },
   ];

   const vehicleAttributes = [
      { name: "upgradeable_vehicles", placeholder: "e.g., 8" },
      { name: "brand_vehicles", placeholder: "e.g., 3" },
      { name: "sports_cars", placeholder: "e.g., 3" },
   ];

   const otherAttributes = [
      { name: "royale_pass", placeholder: "e.g., 12" },
      { name: "companions_count", placeholder: "e.g., 2" },
   ];

   const renderAttribute = (attr: {
      name: string;
      placeholder: string;
      type?: string;
   }) => (
      <Attribute
         key={attr.name}
         visible={visibleFields[attr.name as keyof typeof visibleFields]}
         visibleFields={visibleFields}
         handleCheckboxChange={handleCheckboxChange as (field: string) => void}
         attribute={attr.name}
         placeholder={attr.placeholder}
         type={attr.type}
      />
   );

   return (
      <FieldGroup>
         {attributes.map(renderAttribute)}
         <Separator className="bg-amber-500" />
         {weaponAttributes.map(renderAttribute)}
         <Separator className="bg-blue-500 w-[75%]!" />
         {vehicleAttributes.map(renderAttribute)}
         <Separator className="bg-blue-500 w-[75%]!" />
         <Separator className="bg-amber-500" />
         {otherAttributes.map(renderAttribute)}
      </FieldGroup>
   );
}
