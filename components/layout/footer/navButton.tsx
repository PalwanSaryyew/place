"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type ReactNode } from "react";

interface NavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   children: ReactNode;
   href?: string;
}

const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
   ({ children, href, className, ...props }, ref) => {
      const currentPath = usePathname();
      const isActive = currentPath === href;

      const baseClasses =
         "flex-1 p-6 rounded-full shadow-inner transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl active:scale-95";
      const inactiveClasses = "bg-background text-primary";
      const activeClasses = "bg-primary text-background shadow-2xl";

      if (href) {
         return (
            <Link href={href} passHref className="flex-1 via-gray-500 flex">
               <Button
                  {...props}
                  ref={ref}
                  className={cn(
                     baseClasses,
                     isActive ? activeClasses : inactiveClasses,
                     className
                  )}
                  size={"icon"}
               >
                  {children}
               </Button>
            </Link>
         );
      }

      return (
         <span className="flex-1 via-gray-500 flex">
            <Button
               {...props}
               ref={ref}
               className={cn(
                  baseClasses,
                  // When no href is provided, it shouldn't be considered active.
                  inactiveClasses,
                  className
               )}
               size={"icon"}
            >
               {children}
            </Button>
         </span>
      );
   }
);

NavButton.displayName = "NavButton";

export default NavButton;
