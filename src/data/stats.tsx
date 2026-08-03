import { BsBarChartFill, BsFillStarFill } from "react-icons/bs";
import { PiGlobeFill } from "react-icons/pi";

import { IStats } from "@/types";

export const stats: IStats[] = [
  {
    title: "Multi-consorcio",
    icon: <PiGlobeFill size={28} />,
    description:
      "Administrá uno o cientos de edificios desde un único Dashboard.",
  },
  {
    title: "Automatización",
    icon: <BsBarChartFill size={28} />,
    description:
      "Reducí horas de trabajo repetitivo y mejorá los tiempos de respuesta.",
  },
  {
    title: "Mejor experiencia",
    icon: <BsFillStarFill size={28} />,
    description:
      "Vecinos atendidos las 24 horas, reclamos con seguimiento y administradores con más tiempo.",
  },
];
