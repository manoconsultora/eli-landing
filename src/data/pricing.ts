import { IPricing } from "@/types";

export const tiers: IPricing[] = [
  {
    name: "Core",
    price: "$90.600",
    features: [
      "Hasta 2 consorcios",
      "Hasta 100 UF totales",
      "Atención automática con IA",
      "Gestión de reclamos y tickets",
      "Dashboard en tiempo real",
      "Base documental inteligente",
      "Bot de Telegram operativo desde el primer día",
      "Onboarding para WhatsApp Business",
      "Soporte y actualizaciones",
    ],
  },
  {
    name: "Profesional",
    price: "$152.000",
    features: [
      "Hasta 8 consorcios",
      "Hasta 500 UF totales",
      "Todo lo incluido en Core",
      "Automatización de consultas",
      "OCR de comprobantes y documentos",
      "Gestión inteligente de pagos",
      "Reportes y métricas",
      "Panel multiusuario",
      "Onboarding asistido para WhatsApp Business",
      "Soporte prioritario",
    ],
  },
  {
    name: "Escala",
    price: "Consultar",
    features: [
      "Más de 8 consorcios",
      "Más de 500 UF totales",
      "Capacidad adaptada a tu operación",
      "Dashboard multi-consorcio",
      "Roles y permisos avanzados",
      "Integraciones personalizadas",
      "Automatizaciones a medida",
      "Capacitación del equipo",
      "Implementación dedicada",
      "Acompañamiento permanente",
    ],
  },
];