import { createFileRoute } from '@tanstack/react-router'
import { Mail, Phone, MapPin} from "lucide-react";

export const Route = createFileRoute('/_public/contact')({
  component: RouteComponent,
})
 
function RouteComponent() {

  const contacts = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email",
      value: "craftycake@gmail.com",
      sub: "We reply within 24 hours",
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Phone",
      value: "+91 702-190-7091",
      sub: "Mon–Fri, 9am–6pm",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Address",
      value: "Shop No. 6, Mannu Villa, Nr. Eastern Mall, Pushpa Park, Daftary Road, Malad (E)",
      sub: "Mumbai, MH - 400097",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <section className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            Contact
          </span>
          <h1 className="mt-3 text-4xl md:text-5xl font-bold leading-tight">
            Get in Touch
          </h1>
          <p className="mt-4 text-muted-foreground text-lg max-w-md leading-relaxed">
            Have a question, feedback, or just want to say hi? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-5 gap-12">

        {/* Left: contact info */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Contact Info</h2>
            <p className="text-sm text-muted-foreground">
              Reach us through any of these channels.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {contacts.map((c) => (
              <div
                key={c.label}
                className="flex gap-4 p-4 rounded-xl border border-border hover:border-primary transition-colors duration-150"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  {c.icon}
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                  <div className="text-sm font-medium">{c.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.sub}</div>
                </div>
              </div>
            ))}
          </div>

        </div>

      </section>
    </div>
  );
}