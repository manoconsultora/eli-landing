import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { siteDetails } from '@/data/siteDetails';
import { footerDetails } from '@/data/footer';
import { getPlatformIconByName } from '@/utils';

const Footer: React.FC = () => {
    return (
        <footer
            className="footer-surface relative isolate w-full overflow-hidden py-10 text-secondary"
        >
            <div className="footer-grid absolute inset-0 -z-10" />
            <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div>
                    <Link href="/" className="flex items-center gap-2">
                    <Image src="/images/eli-logo.svg" alt="ELI Consorcios" width={28} height={28} className="min-w-fit h-5 w-5 md:h-7 md:w-7" />
                        <h3 className="manrope text-xl font-semibold cursor-pointer">
                            {siteDetails.siteName}
                        </h3>
                    </Link>
                    <p className="mt-3.5 max-w-sm text-secondary/72">
                        {footerDetails.subheading}
                    </p>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                    <ul className="text-secondary/72">
                        {footerDetails.quickLinks.map(link => (
                            <li key={link.text} className="mb-2">
                                <Link href={link.url} className="transition-colors hover:text-secondary">{link.text}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4">Escribinos: </h4>

                    {footerDetails.email && <a href={`mailto:${footerDetails.email}`}  className="block text-secondary/72 transition-colors hover:text-secondary">Email: {footerDetails.email}</a>}

                    {footerDetails.telephone && <a href={`tel:${footerDetails.telephone}`} className="block text-secondary/72 transition-colors hover:text-secondary">Phone: {footerDetails.telephone}</a>}

                    {footerDetails.socials && (
                        <div className="mt-5 flex items-center gap-5 flex-wrap">
                            {Object.keys(footerDetails.socials).map(platformName => {
                                if (platformName && footerDetails.socials[platformName]) {
                                    return (
                                        <Link
                                            href={footerDetails.socials[platformName]}
                                            key={platformName}
                                            aria-label={platformName}
                                            className="text-secondary/72 transition-colors hover:text-secondary"
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
            <div className="mt-8 px-6 pt-8 text-center text-secondary/72">
    <p>
        © {new Date().getFullYear()} {siteDetails.siteName}. Todos los derechos reservados.
    </p>

    <p className="mt-2 text-sm text-secondary/50">
        Un producto de{" "}
        <a
            href="https://ma-no.work"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-secondary transition-colors hover:text-secondary/80 hover:underline"
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
