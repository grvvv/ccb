import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
	SheetClose,
} from "@/components/ui/sheet";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

type NavLinks = ({
	label: string;
	href: string;
	children?: undefined;
} | {
	label: string;
	href: string;
	children: {
		label: string;
		href: string;
		description: string;
	}[] | undefined;
})[]

export default function HamburgerMenu({ links, isLoggedIn }: { isLoggedIn: boolean, links: NavLinks }) {
	const [open, setOpen] = useState(false)
	const navigate = useNavigate()
	const { logout } = useAuth()

	return (
		<div className="flex items-center lg:hidden">
			<Sheet open={open} onOpenChange={setOpen}>
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
							{links.map((link) => (
								<div key={link.label}>
									<SheetClose asChild>
										<Link
											to={link.href}
											className="flex items-center justify-between px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
										>
											{link.label}
											{link.children && <ChevronDown className="h-4 w-4 text-muted-foreground" />}
										</Link>
									</SheetClose>
									{link.children && (
										<div className="bg-muted/40">
											{link.children.map((child) => (
												<SheetClose asChild>
													<Link
														key={child.label}
														to={child.href}
														className="flex flex-col px-10 py-2 hover:bg-accent transition-colors"
													>
														<span className="text-sm font-medium">{child.label}</span>
														<span className="text-xs text-muted-foreground">{child.description}</span>
													</Link>
												</SheetClose>

											))}
										</div>
									)}
								</div>
							))}
						</nav>
						<div className="border-t border-border px-6 py-4 space-y-2">
							{
								isLoggedIn ? (
									<Button variant="outline" size="sm" className="w-full" onClick={() => logout()}>
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
	)
}