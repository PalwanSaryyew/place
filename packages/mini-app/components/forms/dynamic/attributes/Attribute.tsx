import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

const Attribute = ({
   visible,
   visibleFields,
   handleCheckboxChange,
   attribute,
   placeholder,
   type = "number",
}: {
   visible: boolean;
   visibleFields: { [key: string]: boolean };
   handleCheckboxChange: (field: string) => void;
   attribute: string;
   placeholder?: string;
   type?: string;
}) => {
   const t = useTranslations("attributes.pubg_account");

   return (
      <>
         <div className="flex items-center space-x-2">
            <Checkbox
               id={`toggle-${attribute}`}
               checked={visibleFields[attribute]}
               onCheckedChange={() => handleCheckboxChange(attribute)}
            />
            <label
               htmlFor={`toggle-${attribute}`}
               className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
               {t(attribute)}
            </label>
         </div>
         {visible && (
            <Field>
               <Input
                  id={attribute}
                  name={`attributes[${attribute}]`}
                  type={type}
                  placeholder={placeholder || "e.g., 123456789"}
               />
            </Field>
         )}
      </>
   );
};

export default Attribute;
