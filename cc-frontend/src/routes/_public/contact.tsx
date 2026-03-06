import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from "lucide-react";

export const Route = createFileRoute('/_public/contact')({
  component: RouteComponent,
})
 
function RouteComponent() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    // Replace with your actual submit logic
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const contacts = [
    {
      icon: <Mail className="w-5 h-5" />,
      label: "Email",
      value: "hello@yourstore.com",
      sub: "We reply within 24 hours",
    },
    {
      icon: <Phone className="w-5 h-5" />,
      label: "Phone",
      value: "+1 (555) 000-0000",
      sub: "Mon–Fri, 9am–6pm",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      label: "Address",
      value: "123 Store Street",
      sub: "New York, NY 10001",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <section className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-16 md:py-10">
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
      <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-5 gap-12">

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

          {/* Hours card */}
          <div className="p-4 rounded-xl bg-secondary border border-border mt-2">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Business Hours</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Monday – Friday</span>
                <span>9:00 – 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Saturday</span>
                <span>10:00 – 15:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sunday</span>
                <span className="text-muted-foreground/60">Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="md:col-span-3">
          <div className="flex items-center gap-2 mb-6">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Send a Message</h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Subject
              </label>
              <input
                type="text"
                placeholder="What's this about?"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full h-10 px-3 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors placeholder:text-muted-foreground/50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                Message
              </label>
              <textarea
                rows={5}
                placeholder="Tell us what's on your mind..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none placeholder:text-muted-foreground/50"
              />
            </div>

            <button
              onClick={handleSubmit}
              className={`inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${sent
                  ? "bg-green-500 text-white cursor-default"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
            >
              {sent ? (
                "Message Sent!"
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}