import PricingColumn from "./PricingColumn";
import { FiInfo } from "react-icons/fi";

import { tiers } from "@/data/pricing";

const Pricing: React.FC = () => {
    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {tiers.map((tier, index) => (
                    <PricingColumn
                        key={tier.name}
                        tier={tier}
                        highlight={index === 1}
                    />
                ))}
            </div>

            <div className="mx-auto mt-10 max-w-4xl space-y-4 text-sm text-foreground-accent">
                <div className="flex items-start gap-2">
                    <FiInfo className="mt-0.5 shrink-0 text-secondary" />
                    <p>
                        Los límites de consorcios y unidades funcionales garantizan el rendimiento óptimo de ELI.
                        Si tu administración requiere una mayor capacidad, diseñaremos un plan a medida.
                    </p>
                </div>

                <div className="flex items-start gap-2">
                    <FiInfo className="mt-0.5 shrink-0 text-secondary" />
                    <p>
                        Todos los planes incluyen la implementación inicial y un onboarding de 4 semanas.
                        Durante ese período configuramos ELI, ordenamos la información clave y ajustamos la operación
                        para dejar el servicio en marcha.
                    </p>
                </div>

                <div className="flex items-start gap-2">
                    <FiInfo className="mt-0.5 shrink-0 text-secondary" />
                    <p>
                        La contratación es directa: abonás el primer mes y el segundo queda sin cargo para amortizar las
                        4 semanas de onboarding, configuración y puesta a punto.
                    </p>
                </div>
            </div>
        </>
    );
}

export default Pricing;
