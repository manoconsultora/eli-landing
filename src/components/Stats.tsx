import { stats } from "@/data/stats"

const Stats: React.FC = () => {
    const accentStyles = [
        "text-primary",
        "text-primary",
        "text-primary",
    ];

    return (
        <section id="stats" className="py-10 lg:py-20">
            <div className="grid sm:grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                    <div key={stat.title} className="mx-auto flex max-w-md flex-col rounded-2xl bg-white p-6 text-center shadow-sm shadow-primary/5 sm:max-w-full sm:text-left">
                        <h3 className="mb-5 flex items-center gap-3 text-3xl font-semibold justify-center text-foreground sm:justify-start">
                            <span className={`flex h-10 w-10 items-center justify-center ${accentStyles[index % accentStyles.length]}`}>
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
