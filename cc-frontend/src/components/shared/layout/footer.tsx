import { Link } from '@tanstack/react-router'
import {
  Phone,
  Mail,
  MapPin,
  Instagram,
  FacebookIcon,
  TwitterIcon,
} from 'lucide-react'

// ── Data ─────────────────────────────────────────────────────────────────────
const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
]

const CATEGORY_LINKS = [
  { label: 'Soft Drink', href: '/search?category=drinks' },
  { label: 'Milk & Dairy', href: '/search?category=milk-dairy' },
  { label: 'Beauty & Health', href: '/search?category=beauty-health' },
]

const ACCOUNT_LINKS = [
  { label: 'Dashboard', href: '#' },
  { label: 'My Orders', href: '#' },
  { label: 'Recent Orders', href: '#' },
  { label: 'Update Profile', href: '#' },
]

const SOCIALS = [
  { label: 'Facebook', href: 'https://www.facebook.com/', Icon: FacebookIcon },
  { label: 'Twitter / X', href: 'https://twitter.com/', Icon: TwitterIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/', Icon: Instagram },
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
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-150"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
export function Footer() {
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
              XYZ Road,<br />Mumbai, IND
            </p>
            <p className="flex items-center gap-2">
              <Phone size={14} className="shrink-0 text-primary" />
              833.XXX.1666
            </p>
            <p className="flex items-center gap-2">
              <Mail size={14} className="shrink-0 text-primary" />
              ccbakebox@test.com
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
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-150"
              >
                <Icon />
              </a>
            ))}
          </div>

          {/* Call CTA */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Call Us Anytime</p>
            <p className="text-lg font-bold text-primary leading-tight">+65 9988 7766</p>
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Tridenzic. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}