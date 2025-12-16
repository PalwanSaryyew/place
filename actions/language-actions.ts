"use server";

import { cookies } from "next/headers";

export async function changeLanguage(locale: string) {
  cookies().set("NEXT_LOCALE", locale);
}
