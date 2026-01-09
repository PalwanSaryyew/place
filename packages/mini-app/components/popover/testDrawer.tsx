import { useTranslations } from "next-intl";
import { Button } from "../ui/button";
import {
   Drawer,
   DrawerClose,
   DrawerContent,
   DrawerDescription,
   DrawerFooter,
   DrawerHeader,
   DrawerTitle,
   DrawerTrigger,
} from "../ui/drawer";

const TestDrawer = () => {
   const t = useTranslations("testDrawer");
   return (
      <Drawer>
         <DrawerTrigger>{t("open")}</DrawerTrigger>
         <DrawerContent>
            <DrawerHeader>
               <DrawerTitle>{t("are_you_sure")}</DrawerTitle>
               <DrawerDescription>
                  {t("this_action_cannot_be_undone")}
               </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
               <Button>{t("submit")}</Button>
               <DrawerClose>
                  <Button variant="outline">{t("cancel")}</Button>
               </DrawerClose>
            </DrawerFooter>
         </DrawerContent>
      </Drawer>
   );
};

export default TestDrawer;
