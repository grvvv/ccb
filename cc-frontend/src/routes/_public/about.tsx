import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute('/_public/about')({
  component: RouteComponent,
})


function RouteComponent() {
  const stats = [
    { value: "10K+", label: "Happy Customers" },
    { value: "500+", label: "Products" },
    { value: "4.8★", label: "Avg. Rating" },
    { value: "24/7", label: "Support" },
  ];

  const values = [
    {
      title: "Quality First",
      description:
        "Every product on our platform goes through a strict quality check before it reaches you.",
    },
    {
      title: "Transparency",
      description:
        "We believe in honest pricing, clear descriptions, and no hidden surprises.",
    },
    {
      title: "Community",
      description:
        "We partner with local suppliers and small businesses to support the community.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-18">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">
            About Us
          </span>
          <h1 className="mt-3 text-4xl md:text-6xl font-bold leading-tight max-w-2xl">
            We make shopping{" "}
            <span className="text-primary">simple</span> and{" "}
            <span className="text-primary">delightful</span>.
          </h1>
          <p className="mt-6 text-muted-foreground text-lg max-w-xl leading-relaxed">
            Founded with a simple mission — bring quality products closer to people
            who care about what they buy. We're a small team with big standards.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-primary">{s.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              It started with a frustration — finding good products online felt like
              searching through a haystack. Too many options, too little trust. We
              set out to build something different.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, we curate every listing, verify every seller, and stand behind
              every purchase. Because shopping should feel good — not overwhelming.
            </p>
          </div>
          <div className="bg-secondary rounded-xl h-64 flex items-center justify-center">
            <span className="text-6xl">🛍️</span>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-b border-border bg-muted/30">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-10">What We Stand For</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-background rounded-xl border border-border p-6 hover:border-primary transition-colors duration-150"
              >
                <div className="w-8 h-1 bg-primary rounded mb-4" />
                <h3 className="font-semibold text-base mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {/* <section>
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-10">Meet the Team</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex flex-col items-center text-center p-6 rounded-xl border border-border hover:border-primary transition-colors duration-150"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary font-bold text-lg flex items-center justify-center mb-4">
                  {member.initials}
                </div>
                <div className="font-semibold text-sm">{member.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
}