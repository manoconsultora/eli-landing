import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { footerDetails } from '@/data/footer';
import { getPlatformIconByName } from '@/utils';

const Footer: React.FC = () => {
    return (
        <footer
            className="hero-surface relative isolate w-full overflow-hidden py-10 text-primary"
        >
            <div className="hero-grid absolute inset-0 -z-10 opacity-70" />
            <div className="max-w-7xl w-full mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div>
                    <Link href="/" className="flex items-center">
                    <Image src="/images/logo_eli.svg" alt="ELI Consorcios" width={56} height={56} className="min-w-fit h-12 w-12 md:h-7 md:w-7" />
                    </Link>
                    <p className="mt-3.5 max-w-sm text-primary/72">
                        Eli Desk - Centro de Operaciones para Administradores de Consorcios.
                    </p>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                    <ul className="text-primary/72">
                        {footerDetails.quickLinks.map(link => (
                            <li key={link.text} className="mb-2">
                                <Link href={link.url} className="transition-colors hover:text-primary/80">{link.text}</Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="text-lg font-semibold mb-4">Escribinos: </h4>

                    {footerDetails.email && <a href={`mailto:${footerDetails.email}`}  className="block text-primary/72 transition-colors hover:text-primary/80">Email: {footerDetails.email}</a>}

                    {footerDetails.telephone && <a href={`tel:${footerDetails.telephone}`} className="block text-primary/72 transition-colors hover:text-primary/80">Phone: {footerDetails.telephone}</a>}

                    {footerDetails.socials && (
                        <div className="mt-5 flex items-center gap-5 flex-wrap">
                            {Object.keys(footerDetails.socials).map(platformName => {
                                if (platformName && footerDetails.socials[platformName]) {
                                    return (
                                        <Link
                                            href={footerDetails.socials[platformName]}
                                            key={platformName}
                                            aria-label={platformName}
                                            className="text-primary/72 transition-colors hover:text-primary/80"
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
            <div className="mt-8 px-6 pt-8 text-center text-primary/72">
                <p className="font-semibold text-primary">ELI Desk ™ {new Date().getFullYear()}</p>
                <p className="mt-2">Administración Inteligente de Consorcios</p>
                <p className="mt-2 text-sm text-primary/50">
                    Powered by{" "}
                    <a
                        href="https://ma-no.work"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
                    >
                        MANOBOTS™
                    </a>{" "}
                    | Todos los derechos reservados.
                </p>
                <p className="mt-2 text-sm text-primary/50">
                    Un producto de{" "}
                    <a
                        href="https://ma-no.work/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
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
