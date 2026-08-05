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
                "mx-auto w-full max-w-sm rounded-2xl bg-white lg:max-w-full",
                {
                    "pricing-highlight-shadow": highlight,
                    "shadow-sm shadow-primary/5": !highlight,
                }
            )}
        >
            <div className="rounded-t-2xl p-6">
                <h3 className="mb-4 text-2xl font-semibold text-foreground">{name}</h3>
                <p className="mb-6 text-3xl font-bold text-foreground md:text-5xl">
                    <span className={clsx({ "text-[#54eded]": highlight })}>
                        {typeof price === 'number' ? `$${price}` : price}
                    </span>
                    {typeof price === 'number' && <span className="text-lg font-normal text-foreground-accent">/mo</span>}
                </p>
                <button
                    className={clsx(
                        "w-full rounded-full bg-[#54eded] px-4 py-3 text-white transition-colors hover:bg-[#47d7d7] sm:text-primary"
                    )}
                >
                    <div className="text-xs text-primary">
                        Iniciar onboarding
                    </div>
                    <div className="-mt-1 font-sans text-xl font-semibold">
                        Contratar servicio
                    </div>
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
