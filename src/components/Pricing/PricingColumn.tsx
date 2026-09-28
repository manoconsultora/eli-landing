import clsx from "clsx";
import Link from "next/link";
import { BsFillCheckCircleFill } from "react-icons/bs";

import { IPricing } from "@/types";

interface Props {
  tier: IPricing;
  highlight?: boolean;
}

const PricingColumn: React.FC<Props> = ({ tier, highlight }: Props) => {
  const { name, price, features, slug, action } = tier;

  const href =
    action === "onboarding"
      ? `/onboarding?plan=${slug}`
      : "#cta";

  const isCore = slug === "core";
  const isProfessional = slug === "professional";
  const isScale = slug === "scale";

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
      <div className="p-6">
        <Link
          href={href}
          className={clsx(
            "block w-full rounded-2xl px-5 py-4 text-center text-white shadow-md transition-all hover:shadow-lg",
            {
              "bg-[#2346DD] shadow-[#2346DD]/15 hover:bg-[#1f3fc7]": !isScale,
              "bg-primary shadow-primary/15 hover:bg-primary/90": isScale,
            }
          )}
        >
          {action === "onboarding" ? (
            <>
              <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/75">
                Iniciar onboarding
              </div>

              <div className="mt-0.5 font-sans text-xl font-bold leading-tight text-white">
                {isCore && "PLAN CORE"}
                {isProfessional && "PLAN PRO"}
              </div>

              <div className="mt-1 text-sm font-medium text-white/85">
                {price}
              </div>
            </>
          ) : (
            <>
              <div className="font-sans text-xl font-bold leading-tight text-white">
                PLAN A MEDIDA
              </div>

              <div className="mt-1 text-sm font-medium text-white/85">
                Contanos tu idea.
              </div>
            </>
          )}
        </Link>
      </div>

      <div className="px-6 pb-8 pt-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex items-start text-sm leading-snug text-primary"
            >
              <BsFillCheckCircleFill className="mr-2.5 mt-0.5 h-4 w-4 shrink-0 text-primary" />

              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PricingColumn;
