export function TechnologySection() {
  const stack = [
    {
      category: "Frontend",
      techs: ["Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Recharts"]
    },
    {
      category: "Backend",
      techs: ["FastAPI", "Python", "Pydantic", "SQLAlchemy"]
    },
    {
      category: "Data & ML",
      techs: ["PostgreSQL", "Redis", "scikit-learn", "Isolation Forest"]
    },
    {
      category: "Security & Infra",
      techs: ["Argon2id", "JWT", "Docker", "NGINX"]
    }
  ]

  return (
    <section className="py-24 px-6 bg-[#050505] border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Enterprise Technology Stack</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Built on modern, scalable, and battle-tested infrastructure.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stack.map((group, i) => (
            <div key={i} className="glass-panel p-6 bg-[#111416]/50">
              <h3 className="text-sm font-bold text-foreground mb-4 tracking-wider uppercase text-primary/80">{group.category}</h3>
              <ul className="space-y-3">
                {group.techs.map((tech, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-border" />
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
