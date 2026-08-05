import React from 'react';
import { testimonials } from '@/data/testimonials';

const Testimonials: React.FC = () => {
    const accentStyles = [
        {
            badge: "bg-secondary/14 text-secondary",
            card: "shadow-secondary/10",
        },
        {
            badge: "bg-primary/10 text-primary",
            card: "shadow-primary/10",
        },
        {
            badge: "bg-foreground-accent/12 text-foreground-accent",
            card: "shadow-primary/8",
        },
    ];

    return (
        <div className="grid gap-8 max-w-lg w-full mx-auto lg:grid-cols-3 lg:max-w-full">
            {testimonials.map((testimonial, index) => {
                const Icon = testimonial.icon;
                const accent = accentStyles[index % accentStyles.length];

                return (
                    <div
                        key={index}
                        className={`rounded-2xl bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 ${accent.card}`}
                    >
                        <div className="flex items-center mb-5">
                            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent.badge}`}>
                                <Icon className="h-7 w-7" strokeWidth={2} />
                            </div>

                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-foreground">
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
