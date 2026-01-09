"use client";
import {
  ClipboardList,
  LayoutGrid,
  Mailbox,
  Plus,
  UserRound,
  LogOut,
  User,
  Settings,
  Globe,
  Wallet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NavButton from "./navButton";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { changeLanguage } from "../../../actions/language-actions";

const Footer = () => {
  const t = useTranslations("languageDialog");
  const f = useTranslations("footer");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleLanguageChange = (locale: string) => {
    changeLanguage(locale);
    setDialogOpen(false);
  };

  return (
    <div className="bg-secondary/75 backdrop-blur-2xl fixed flex items-center justify-around gap-2 bottom-0 right-0 left-0 h-16 px-4 border-t">
      <NavButton href="/notifications">
        <Mailbox className="scale-125" />
      </NavButton>
      <NavButton href="/myproducts">
        <ClipboardList className="scale-125" />
      </NavButton>
      <NavButton href="/">
        <LayoutGrid className="scale-125" />
      </NavButton>
      <NavButton href="/addproduct">
        <Plus className="scale-125" />
      </NavButton>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <NavButton>
            <UserRound className="scale-125" />
          </NavButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" sideOffset={10}>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{f("profile")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/wallet" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span>{f("wallet")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setDialogOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                <span>{f("change_language")}</span>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("title")}</DialogTitle>
                <DialogDescription>{t("explanation")}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleLanguageChange("en")}>
                  {f("english")}
                </Button>
                <Button onClick={() => handleLanguageChange("tk")}>
                  {f("turkmen")}
                </Button>
                <Button onClick={() => handleLanguageChange("ru")}>
                  {f("russian")}
                </Button>
                <Button onClick={() => handleLanguageChange("tr")}>
                  {f("turkish")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <DropdownMenuItem asChild>
            <Link href="/settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span>{f("settings")}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            <span>{f("log_out")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Footer;
