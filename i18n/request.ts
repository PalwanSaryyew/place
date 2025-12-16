import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
   const store = await cookies();
   let locale = store.get("NEXT_LOCALE")?.value;
   if (!locale) {
      locale = "en";
   }

   return {
      locale,
      messages: (await import(`../messages/${locale}.json`)).default,
   };
});
