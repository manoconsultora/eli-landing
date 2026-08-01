import Link from 'next/link';
import React from 'react';

import { siteDetails } from '@/data/siteDetails';
import { footerDetails } from '@/data/footer';
import { getPlatformIconByName } from '@/utils';

const Footer: React.FC = () => {
    return (
        <footer className="bg-hero-background text-foreground py-10">
            <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div>
                    <Link href="/" className="flex items-center gap-2">
                    <img src="/images/eli-logo.svg" alt="ELI Consorcios" className="min-w-fit w-5 h-5 md:w-7 md:h-7" />
                        <h3 className="manrope text-xl font-semibold cursor-pointer">
                            {siteDetails.siteName}
                        </h3>
                    </Link>
                    <p className="mt-3.5 text-foreground-accent">
                        {footerDetails.subheading}
                    </p>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                    <ul className="text-foreground-accent">
                        {footerDetails.quickLinks.map(link => (
                            <li key={link.text} className="mb-2">
                                <Link href={link.url} className="hover:text-foreground">{link.text}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4">Escribinos: </h4>

                    {footerDetails.email && <a href={`mailto:${footerDetails.email}`}  className="block text-foreground-accent hover:text-foreground">Email: {footerDetails.email}</a>}

                    {footerDetails.telephone && <a href={`tel:${footerDetails.telephone}`} className="block text-foreground-accent hover:text-foreground">Phone: {footerDetails.telephone}</a>}

                    {footerDetails.socials && (
                        <div className="mt-5 flex items-center gap-5 flex-wrap">
                            {Object.keys(footerDetails.socials).map(platformName => {
                                if (platformName && footerDetails.socials[platformName]) {
                                    return (
                                        <Link
                                            href={footerDetails.socials[platformName]}
                                            key={platformName}
                                            aria-label={platformName}
                                        >
                                            {getPlatformIconByName(platformName)}
                                        </Link>
                                    )
                                }
                            })}
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-8 px-6 text-center text-foreground-accent">
    <p>
        © {new Date().getFullYear()} {siteDetails.siteName}. Todos los derechos reservados.
    </p>

    <p className="mt-2 text-sm text-gray-500">
        Un producto de{" "}
        <a
            href="https://ma-no.work"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline transition-colors"
        >
            MANO DIGITAL CONSULTING
        </a>
        .
    </p>
</div>
        </footer>
    );
};

export default Footer;
