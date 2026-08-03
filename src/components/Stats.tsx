import { stats } from "@/data/stats"

const Stats: React.FC = () => {
    const accentStyles = [
        "bg-primary/10 text-primary",
        "bg-secondary/15 text-secondary",
        "bg-foreground-accent/12 text-foreground-accent",
    ];

    return (
        <section id="stats" className="py-10 lg:py-20">
            <div className="grid sm:grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                    <div key={stat.title} className="mx-auto flex max-w-md flex-col rounded-2xl border border-surface/90 bg-white p-6 text-center shadow-sm shadow-primary/5 sm:max-w-full sm:text-left">
                        <h3 className="mb-5 flex items-center gap-3 text-3xl font-semibold justify-center text-foreground sm:justify-start">
                            <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentStyles[index % accentStyles.length]}`}>
                                {stat.icon}
                            </span>
                            {stat.title}
                        </h3>
                        <p className="text-foreground-accent">{stat.description}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Stats
