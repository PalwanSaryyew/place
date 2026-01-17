// components/forms/dynamic/PubgAccountFields.tsx
"use client";
import { FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import Attribute from "./attributes/Attribute";

// Define the expected structure of the attributes prop
interface Attributes {
  [key: string]: string | number;
}

interface PubgAccountFieldsProps {
  attributes?: Attributes;
}

export default function PubgAccountFields({ attributes = {} }: PubgAccountFieldsProps) {
    // Initialize visibility based on whether the attribute key exists in the props
    const initialVisibility = {
        game_id: attributes.hasOwnProperty('game_id'),
        account_level: attributes.hasOwnProperty('account_level'),
        collection_level: attributes.hasOwnProperty('collection_level'),
        upgradeable_weapons: attributes.hasOwnProperty('upgradeable_weapons'),
        upgradeable_vehicles: attributes.hasOwnProperty('upgradeable_vehicles'),
        brand_vehicles: attributes.hasOwnProperty('brand_vehicles'),
        sports_cars: attributes.hasOwnProperty('sports_cars'),
        royale_pass: attributes.hasOwnProperty('royale_pass'),
        companions_count: attributes.hasOwnProperty('companions_count'),
        ultimate_suits: attributes.hasOwnProperty('ultimate_suits'),
    };

   const [visibleFields, setVisibleFields] = useState(initialVisibility);

   const handleCheckboxChange = (field: keyof typeof visibleFields) => {
      setVisibleFields((prev) => ({ ...prev, [field]: !prev[field] }));
   };

   const attributeList = [
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
         defaultValue={attributes[attr.name]} // Pass the default value here
      />
   );

   return (
      <FieldGroup>
         {attributeList.map(renderAttribute)}
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
