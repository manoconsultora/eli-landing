import { FiBarChart2, FiBriefcase, FiDollarSign, FiLock, FiPieChart, FiShield, FiTarget, FiTrendingUp, FiUser } from "react-icons/fi";

import { IBenefit } from "@/types"

export const benefits: IBenefit[] = [
    {
        title: "Caos, ¿te resulta familiar?",
        description: "WhatsApp, llamados, reclamos, proveedores, expensas y consultas llegan por todos lados. Cuando toda la operación depende de vos, el tiempo nunca alcanza.",
        bullets: [
            {
                title: "Todo sin organizar",
                description: "Información dispersa en múltiples canales.",
                icon: <FiBarChart2 size={26} />
            },
            {
                title: "Objetivos postergados",
                description: "El caos no deja gestionar.",
                icon: <FiTarget size={26} />
            },
            {
                title: "Problemas que escalan",
                description: "Los reclamos crecen sin control.",
                icon: <FiTrendingUp size={26} />
            }
        ],
        imageSrc: "/images/mockup-1.webp"
    },
    {
        title: "Con Eli tenes, Todo en un solo lugar",
        description: "ELI centraliza consultas, reclamos, pagos y comunicaciones para que administrar un consorcio vuelva a ser simple.",
        bullets: [
            {
                title: "Consultas centralizadas",
                description: "WhatsApp, web y más, desde un único lugar.",
                icon: <FiDollarSign size={26} />
            },
            {
                title: "Gestión inteligente",
                description: "Priorizá tareas y resolvé más rápido.",
                icon: <FiBriefcase size={26} />
            },
            {
                title: "Seguimiento completo",
                description: "Cada reclamo queda registrado.",
                icon: <FiPieChart size={26} />
            }
        ],
        imageSrc: "/images/mockup-2.webp"
    },
    {
        title: "Diseñada para Administradores modernos",
        description: "ELI combina lo ultimo en inteligencia artificial, automatización y una infraestructura robusta para acompañar el crecimiento de tu operacion.",
        bullets: [
            {
                title: "Infraestructura segura",
                description: "Protección y disponibilidad para tu información.",
                icon: <FiLock size={26} />
            },
            {
                title: "Acceso por perfiles",
                description: "Cada usuario ve solo lo que necesita.",
                icon: <FiUser size={26} />
            },
            {
                title: "Escalable desde el primer día",
                description: "Gestioná uno o cientos de consorcios.",
                icon: <FiShield size={26} />
            }
        ],
        imageSrc: "/images/mockup-3.webp"
    },
]