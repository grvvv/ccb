import { useCategories } from '@/hooks/use-category'
import type { CategoryDetails } from '@/types/category'
import { Link } from '@tanstack/react-router'
import {
  Phone,
  Mail,
  MapPin,
  Instagram
} from 'lucide-react'

// ── Data ─────────────────────────────────────────────────────────────────────
const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
]

const ACCOUNT_LINKS = [
  { label: 'My Orders', href: '/orders' },
  { label: 'Update Profile', href: '/account' },
]

// ── Sub-components ────────────────────────────────────────────────────────────
function FooterLinkGroup({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-5 tracking-wide">{title}</h3>
      <ul className="space-y-3">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              to={href}
              className="text-sm text-muted-foreground capitalize hover:text-primary transition-colors duration-150"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  const { data } = useCategories()
  const categories: CategoryDetails[] = data?.result || [];

  const CATEGORY_LINKS = categories
    .slice(0, 5)
    .map((category) => ({
      label: category.name,
      href: `/category/${category.slug}`,
  }));

  return (
    <footer className="border-t border-border bg-background">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand block */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
          {/* Logo placeholder — swap src with your actual logo */}
          <Link to="/" className="inline-block">
            <span className="text-lg font-bold tracking-tight">
                <span className="text-primary">CC</span>bakebox
            </span>
          </Link>

          <address className="not-italic text-sm text-muted-foreground leading-relaxed space-y-1">
            <p className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
              Shop No. 6, Mannu Villa<br />Nr. Eastern Mall, Pushpa Park<br/>Daftary Road, Malad (E)<br/> Mumbai, MH - 400097
            </p>
            <p className="flex items-center gap-2">
              <Phone size={14} className="shrink-0 text-primary" />
              937-215-7014
            </p>
            <p className="flex items-center gap-2">
              <Mail size={14} className="shrink-0 text-primary" />
              craftycake@gmail.com
            </p>
          </address>
        </div>

        <FooterLinkGroup title="Company" links={COMPANY_LINKS} />
        <FooterLinkGroup title="Categories" links={CATEGORY_LINKS} />
        <FooterLinkGroup title="My Account" links={ACCOUNT_LINKS} />
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Socials */}
          <div className="flex items-center gap-2">
              <a
                key="Instagram"
                href="https://www.instagram.com/cc_bakebox_"
                target="_blank"
                rel="noreferrer"
                aria-label="instagram-link"
                className="opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-150"
              >
                <Instagram /> cc_bakebox_
              </a>
          </div>

          {/* Call CTA */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Call Us Anytime</p>
            <p className="text-lg font-bold text-primary leading-tight">+91 702-190-7091</p>
          </div>

          {/* Copyright */}
          <a className="text-xs text-muted-foreground" href='http://tridenzic.com'>
            © {new Date().getFullYear()} Tridenzic. All rights reserved.
          </a>
        </div>
      </div>
    </footer>
  )
}