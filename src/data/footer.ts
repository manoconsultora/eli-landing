import { IMenuItem, ISocials } from "@/types";

export const footerDetails: {
    subheading: string;
    quickLinks: IMenuItem[];
    email: string;
    telephone?: string;
    socials: ISocials;
} = {
    subheading: "ELI transforma el caos de WhatsApp en una operación organizada. Automatizá consultas, reclamos y pagos desde un único centro de control.",
    quickLinks: [
        {
            text: "El problema",
            url: "#features"
        },
        {
            text: "Elegi tu plan",
            url: "#pricing"
        },
        {
            text: "Onboarding",
            url: "#testimonials"
        }
    ],
    email: 'hey@ma-no.work',
    // telephone: '+1 (123) 456-7890',
    socials: {
        // github: 'https://github.com',
        // x: 'https://twitter.com/x',
        // twitter: 'https://twitter.com/Twitter',
        // facebook: 'https://facebook.com',
        // youtube: 'https://youtube.com',
        // linkedin: 'https://www.linkedin.com',
        // threads: 'https://www.threads.net',
        instagram: 'https://www.instagram.com/manoconsultora',
    }
}