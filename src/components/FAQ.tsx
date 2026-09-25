"use client"
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { BiMinus, BiPlus } from "react-icons/bi";

import SectionTitle from "./SectionTitle";
import { faqs } from "@/data/faq";

const FAQ: React.FC = () => {
    return (
        <section id="faq" className="py-10 lg:py-20">
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="">
                    <p className="hidden lg:block text-foreground-accent">FAQ&apos;S</p>
                    <SectionTitle>
                        <h2 className="my-3 !leading-snug lg:max-w-sm text-center lg:text-left">Preguntas Frecuentes</h2>
                    </SectionTitle>
                    <p className="lg:mt-10 text-foreground-accent text-center lg:text-left">
                        Preguntanos lo que quieras!
                    </p>
                    <a href="mailto:" className="mt-3 block text-center text-xl font-semibold text-[#2346DD] hover:underline lg:text-left lg:text-4xl">hey@ma-no.work</a>
                </div>

                <div className="mx-auto w-full border-b border-surface/90 lg:max-w-2xl">
                    {faqs.map((faq, index) => (
                        <div key={index} className="mb-7">
                            <Disclosure>
                                {({ open }) => (
                                    <>
                                        <DisclosureButton className="flex w-full items-center justify-between border-t border-surface/90 px-4 pt-6 text-left text-base">
                                            <span className="text-xl font-semibold text-foreground sm:text-[1.35rem]">{faq.question}</span>
                                            {open ? <BiMinus className="w-5 h-5 text-secondary" /> : <BiPlus className="w-5 h-5 text-secondary" />}
                                        </DisclosureButton>
                                        <DisclosurePanel className="px-4 pt-3 pb-2 text-sm leading-7 text-foreground-accent sm:text-base">
                                            {faq.answer}
                                        </DisclosurePanel>
                                    </>
                                )}
                            </Disclosure>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
