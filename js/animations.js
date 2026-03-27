/* ===================================================
   Allen Kenoyer Glass — GSAP Scroll Animations
   =================================================== */

gsap.registerPlugin(ScrollTrigger);

// ── Hero: Background parallax
gsap.to(".hero-bg", {
    yPercent: 28,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

// ── Hero: Content stagger on load
gsap.fromTo(".hero-content .eyebrow, .hero-content h1, .hero-content p, .hero-btns",
    { y: 28, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power2.out", delay: 0.2 }
);

// ── Hero: Art glass cards stagger in
gsap.fromTo(".hero-glass-card",
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, stagger: 0.15, ease: "power2.out", delay: 0.4 }
);

// ── Hero: Gem decorations float in
gsap.fromTo(".gem-purple",
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 0.75, duration: 0.8, ease: "back.out(1.7)", delay: 0.7 }
);
gsap.fromTo(".gem-rose",
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 0.7, duration: 0.8, ease: "back.out(1.7)", delay: 0.8 }
);
gsap.fromTo(".gem-gold",
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 0.75, duration: 0.8, ease: "back.out(1.7)", delay: 0.9 }
);

// ── Trust bar items
gsap.fromTo(".trust-item",
    { y: 22, opacity: 0 },
    {
        y: 0, opacity: 1,
        duration: 0.65,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: ".trust-bar", start: "top 88%" }
    }
);

// ── Section headers
gsap.utils.toArray(".section-header").forEach(el => {
    gsap.fromTo(el,
        { y: 30, opacity: 0 },
        {
            y: 0, opacity: 1,
            duration: 0.85,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" }
        }
    );
});

// ── Service cards
gsap.fromTo(".service-card",
    { y: 45, opacity: 0 },
    {
        y: 0, opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: ".services-grid", start: "top 85%" }
    }
);

// ── About images
gsap.fromTo(".about-images",
    { x: -40, opacity: 0 },
    {
        x: 0, opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: { trigger: ".about-split", start: "top 82%" }
    }
);

gsap.fromTo(".about-content > *",
    { y: 30, opacity: 0 },
    {
        y: 0, opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: ".about-content", start: "top 85%" }
    }
);

// ── Gallery items
gsap.fromTo(".gallery-item",
    { scale: 0.92, opacity: 0 },
    {
        scale: 1, opacity: 1,
        duration: 0.65,
        stagger: 0.06,
        ease: "power2.out",
        scrollTrigger: { trigger: ".gallery-grid", start: "top 85%" }
    }
);

// ── Testimonial cards
gsap.fromTo(".testimonial-card",
    { y: 35, opacity: 0 },
    {
        y: 0, opacity: 1,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: ".testimonials-grid", start: "top 85%" }
    }
);

// ── Classes banner
gsap.fromTo(".classes-banner",
    { scale: 0.96, opacity: 0 },
    {
        scale: 1, opacity: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: { trigger: ".classes-banner", start: "top 80%" }
    }
);

// ── Contact section
gsap.fromTo(".contact-info > *",
    { y: 28, opacity: 0 },
    {
        y: 0, opacity: 1,
        duration: 0.75,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: ".contact-section", start: "top 85%" }
    }
);

gsap.fromTo(".hours-box",
    { x: 40, opacity: 0 },
    {
        x: 0, opacity: 1,
        duration: 0.9,
        ease: "power2.out",
        scrollTrigger: { trigger: ".hours-box", start: "top 88%" }
    }
);
