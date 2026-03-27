/* ===================================================
   Allen Kenoyer Glass — GSAP Scroll Animations
   =================================================== */

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Hero Parallax
gsap.to(".hero-bg", {
    yPercent: 20,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

// Content Fade-ins
const reveals = document.querySelectorAll(
    ".service-card, .about-content, .about-image, .gallery-item, .section-header"
);

reveals.forEach(el => {
    gsap.from(el, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none"
        }
    });
});

// Classes Banner Animation
gsap.from(".classes-banner", {
    scale: 0.95,
    opacity: 0,
    duration: 1.2,
    scrollTrigger: {
        trigger: ".classes-banner",
        start: "top 80%"
    }
});
