'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { Transition } from '@headlessui/react';
import { HiOutlineXMark, HiBars3 } from 'react-icons/hi2';

import Container from './Container';
import { menuItems } from '@/data/menuItems';

const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <header className="bg-transparent fixed top-0 left-0 right-0 md:absolute z-[120] mx-auto w-full">
            <Container className="!px-4">
                <nav className="relative z-[120] mx-auto mt-3 flex w-full items-center justify-between gap-3 overflow-hidden rounded-full bg-background/88 px-5 py-2 text-foreground shadow-xl shadow-primary/12 backdrop-blur md:mt-6 md:max-w-6xl md:py-3">
                    {/* Logo */}
                    <Link href="/" className="flex min-w-0 flex-1 items-center overflow-hidden pr-2">
                        <Image src="/images/logo_eli.svg" alt="ELI Consorcios" width={72} height={72} className="h-16 w-16 shrink-0 md:h-20 md:w-20" />
                    </Link>

                    {/* Desktop Menu */}
                    <ul className="hidden md:flex space-x-6">
                        {menuItems.map(item => (
                            <li key={item.text}>
                                <Link href={item.url} className="text-foreground/72 hover:text-foreground transition-colors">
                                    {item.text}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link href="#cta" className="rounded-full bg-[#54eded] px-8 py-3 font-semibold text-primary transition-colors hover:bg-[#47d7d7]">
                                Consulta sin Cargo!
                            </Link>
                        </li>
                    </ul>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden relative z-[130] flex shrink-0 items-center">
                        <button
                            onClick={toggleMenu}
                            type="button"
                            className="relative z-[130] flex h-10 w-10 items-center justify-center rounded-full bg-primary text-background focus:outline-none"
                            aria-controls="mobile-menu"
                            aria-expanded={isOpen}
                        >
                            {isOpen ? (
                                <HiOutlineXMark className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <HiBars3 className="h-6 w-6" aria-hidden="true" />
                            )}
                            <span className="sr-only">Toggle navigation</span>
                        </button>
                    </div>
                </nav>
            </Container>

            {/* Mobile Menu with Transition */}
            <Transition
                show={isOpen}
                enter="transition ease-out duration-200 transform"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-75 transform"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <div id="mobile-menu" className="relative z-[125] mx-4 mt-3 rounded-3xl bg-background/96 text-foreground shadow-2xl shadow-primary/12 backdrop-blur md:hidden">
                    <ul className="flex flex-col space-y-4 pt-1 pb-6 px-6">
                        {menuItems.map(item => (
                            <li key={item.text}>
                                <Link href={item.url} className="block text-foreground/78 transition-colors hover:text-foreground" onClick={toggleMenu}>
                                    {item.text}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link href="#cta" className="block w-fit rounded-full bg-[#54eded] px-5 py-2 font-semibold text-white transition-colors hover:bg-[#47d7d7]" onClick={toggleMenu}>
                                Consulta sin Cargo!
                            </Link>
                        </li>
                    </ul>
                </div>
            </Transition>
        </header>
    );
};

export default Header;
