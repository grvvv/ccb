import { useState, useEffect, useMemo, memo } from "react";
import { LogIn, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { Link, useNavigate } from "@tanstack/react-router";
import { CartSheet } from "../../features/cart/cart-sheet";
import { ModeToggle } from "@/components/molecules/mode-toogle";
import AnnouncementBar from "@/components/features/discount/announcement-bar";
import HamburgerMenu from "./mobile-hamburger";
import type { CategoryDetails } from "@/types/category";

function Header({ isLoggedIn, isAdmin = false, categories }: { isLoggedIn: boolean, isAdmin: boolean, categories: CategoryDetails[] }) {
  const [scrolled, setScrolled] = useState(false);
  const { logout } = useAuth()
  const navigate = useNavigate()

  const topCategories = useMemo(() =>
    categories.slice(0, 6).map((cat) => ({
      label: cat.name,
      href: `/category/${cat.slug}`,
      description: `Search for ${cat.slug}`,
    })),
    [categories]
  )

  const NAV_LINKS = useMemo(() => [
    { label: "Products", href: "/products" },
    { label: "Categories", href: "/category", children: topCategories },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ], [topCategories])


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  return (
    <>
      <AnnouncementBar />
      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 transition-shadow duration-300",
          scrolled && "shadow-md"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Mobile: Hamburger */}
            <HamburgerMenu links={NAV_LINKS} isLoggedIn={isLoggedIn} />

            {/* Logo */}
            <Link to="/" className="flex items-center shrink-0">
              <span className="text-xl font-bold tracking-tight">
                <span className="text-primary">CC</span>bakebox
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center flex-1 justify-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {NAV_LINKS.map((link) =>
                    link.children ? (
                      <NavigationMenuItem key={link.label}>
                        <NavigationMenuTrigger className="text-sm font-medium bg-transparent">
                          {link.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid grid-cols-2 w-[360px] gap-1 p-3">
                            {link.children.map((child) => (
                              <li key={child.label}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    to={child.href}
                                    className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  >
                                    <div className="text-sm font-medium leading-none mb-1 capitalize">{child.label}</div>
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                      {child.description}
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    ) : (
                      <NavigationMenuItem key={link.label}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={link.href}
                            className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                          >
                            {link.label}
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    )
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 shrink-0">

              <ModeToggle />
              {isLoggedIn && <CartSheet />}
              {
                isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><UserCircle2 /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigate({ to: "/account" })}>Profile</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate({ to: "/orders" })}>Orders</DropdownMenuItem>
                      { isAdmin ? <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>Admin View</DropdownMenuItem> : <></> }
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logout()}
                      className="text-primary">Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate({ to: '/login' })}>
                  <LogIn />Login
                </Button>
              )
              }

            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default memo(Header)