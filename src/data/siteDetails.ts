export const siteDetails = {
    siteName: 'ELI Consorcios',
    siteUrl: 'https://eli.ma-no.work/',
    metadata: {
        title: 'ELI Consorcios | Automatizá Reclamos, Pagos y Atención con IA',
        description: 'ELI transforma el caos de WhatsApp en una operación organizada. Automatizá consultas, reclamos y pagos desde un único centro de control.',
    },
    language: 'es-ar',
    locale: 'es-AR',
    siteLogo: `${process.env.BASE_PATH || ''}/images/eli-logo.svg`, //logo oficial de eli consorcios
    googleAnalyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? '',
}
