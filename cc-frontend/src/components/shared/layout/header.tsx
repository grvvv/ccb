import { useState, useEffect } from "react";
import { Search, Menu, X, ChevronDown, LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
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
import { useCategories } from "@/hooks/use-category";

export default function Header({ isLoggedIn }: { isLoggedIn: boolean, isAdmin: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { logout } = useAuth()
  const navigate = useNavigate()

  const { data } = useCategories({ page: 1, limit: 6 })

  let topCategories = data?.result.map((cat) => {
      return {
          label: cat.name,
          href: `/category/${cat.slug}`,
          description: `Search for ${cat.slug}`
      }
  })

  const NAV_LINKS = [
    {
      label: "Products",
      href: "/products",
    },
    {
      label: "Categories",
      href: "/category",
      children: topCategories
    },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

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
            <div className="flex items-center lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                      <span className="text-lg font-bold tracking-tight">
                        <span className="text-primary">CC</span>bakebox
                      </span>
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon">
                          <X className="h-4 w-4" />
                        </Button>
                      </SheetClose>
                    </div>
                    <nav className="flex-1 overflow-y-auto py-4">
                      {NAV_LINKS.map((link) => (
                        <div key={link.label}>
                          <Link
                            to={link.href}
                            className="flex items-center justify-between px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            {link.label}
                            {link.children && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                          </Link>
                          {link.children && (
                            <div className="bg-muted/40">
                              {link.children.map((child) => (
                                <a
                                  key={child.label}
                                  href={child.href}
                                  className="flex flex-col px-10 py-2 hover:bg-accent transition-colors"
                                >
                                  <span className="text-sm font-medium">{child.label}</span>
                                  <span className="text-xs text-muted-foreground">{child.description}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </nav>
                    <div className="border-t border-border px-6 py-4 space-y-2">
                      {
                        isLoggedIn ? (
                          <Button variant="outline" size="sm" className="w-full" onClick={() => logout() }>
                            Logout
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="w-full" onClick={() => navigate({ to: '/login' })}>
                            Login / Sign Up
                          </Button>
                        )
                      }
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

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
                          <ul className="grid w-[360px] gap-1 p-3">
                            {link.children.map((child) => (
                              <li key={child.label}>
                                <NavigationMenuLink asChild>
                                  <a
                                    href={child.href}
                                    className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  >
                                    <div className="text-sm font-medium leading-none mb-1 capitalize">{child.label}</div>
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                      {child.description}
                                    </p>
                                  </a>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    ) : (
                      <NavigationMenuItem key={link.label}>
                        <NavigationMenuLink asChild>
                          <a
                            href={link.href}
                            className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                          >
                            {link.label}
                          </a>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    )
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Search */}
              {/* <div className="relative flex items-center">
                {searchOpen ? (
                  <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                    <Input
                      autoFocus
                      placeholder="Search products..."
                      className="h-8 w-40 sm:w-56 text-sm"
                      onBlur={() => setSearchOpen(false)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSearchOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-5 w-5" />
                    <span className="sr-only">Search</span>
                  </Button>
                )}
              </div> */}
              
              {!searchOpen && <ModeToggle />}
              {/* Cart */}
              {!searchOpen && <CartSheet />}

              {!searchOpen && 
               isLoggedIn ? (
                <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={() => logout() }>
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">Logout</span>
                </Button>
               ) : (
                <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => navigate({ to: '/login' })}>
                  <LogIn className="h-5 w-5 mr-1" />
                  Log In
                </Button>
              )}

              
            </div>
          </div>
        </div>
      </header>
    </>
  );
}