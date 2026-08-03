import clsx from "clsx";
import { BsFillCheckCircleFill } from "react-icons/bs";

import { IPricing } from "@/types";

interface Props {
    tier: IPricing;
    highlight?: boolean;
}

const PricingColumn: React.FC<Props> = ({ tier, highlight }: Props) => {
    const { name, price, features } = tier;

    return (
        <div
            className={clsx(
                "mx-auto w-full max-w-sm rounded-2xl border border-surface/90 bg-white lg:max-w-full",
                {
                    "pricing-highlight-shadow ring-1 ring-secondary/35": highlight,
                    "shadow-sm shadow-primary/5": !highlight,
                }
            )}
        >
            <div className="rounded-t-2xl border-b border-surface/90 p-6">
                <h3 className="mb-4 text-2xl font-semibold text-foreground">{name}</h3>
                <p className="mb-6 text-3xl font-bold text-foreground md:text-5xl">
                    <span className={clsx({ "text-secondary": highlight })}>
                        {typeof price === 'number' ? `$${price}` : price}
                    </span>
                    {typeof price === 'number' && <span className="text-lg font-normal text-foreground-accent">/mo</span>}
                </p>
                <button
                    className={clsx(
                        "w-full rounded-full px-4 py-3 font-semibold transition-colors",
                        {
                            "bg-primary text-background hover:bg-primary/92": highlight,
                            "bg-surface/45 text-foreground hover:bg-surface/80": !highlight,
                        }
                    )}
                >
                    Solicitar demo
                </button>
            </div>
            <div className="p-6 mt-1">
                <p className="mb-0 font-bold text-foreground">FUNCIONES</p>
                <p className="mb-5 text-foreground-accent">Todo lo necesario para empezar.</p>
                <ul className="space-y-4 mb-8">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                            <BsFillCheckCircleFill className="mr-2 h-5 w-5 text-secondary" />
                            <span className="text-foreground-accent">{feature}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default PricingColumn
