import React from 'react';
import { testimonials } from '@/data/testimonials';

const Testimonials: React.FC = () => {
    return (
        <div className="grid gap-8 max-w-lg w-full mx-auto lg:grid-cols-3 lg:max-w-full">
            {testimonials.map((testimonial, index) => {
                const Icon = testimonial.icon;

                return (
                    <div
                        key={index}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
                    >
                        <div className="flex items-center mb-5">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00BCC8]/10">
                                <Icon className="h-7 w-7 text-[#00BCC8]" strokeWidth={2} />
                            </div>

                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-black">
                                    {testimonial.name}
                                </h3>
                                <p className="text-sm text-foreground-accent">
                                    {testimonial.role}
                                </p>
                            </div>
                        </div>

                        <p className="text-foreground-accent leading-7">
                            {testimonial.message}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default Testimonials;