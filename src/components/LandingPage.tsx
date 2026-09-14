import React, { useState, useRef, useEffect, useCallback } from "react";
import { Shield, Sparkles, Scale, X, ArrowRight, Check } from "lucide-react";
import { gsap } from "gsap";
import AcidSquares from "./AcidSquares.jsx";

interface LandingPageProps {
  onStartApp: (
    initialTab?: "record" | "statements" | "statistics" | "benchmark",
  ) => void;
}

/* -------------------------------------------------------------------------- */
/*                              IPHONE COMPONENTS                              */
/* -------------------------------------------------------------------------- */

const StatusBarIcons: React.FC<{ color?: string }> = ({
  color = "#171310",
}) => (
  <div className="flex items-center gap-[4px]">
    {/* Signal */}
    <svg width="14" height="10" viewBox="0 0 16 11" fill={color}>
      <rect x="0" y="7" width="2.6" height="4" rx="0.8" />
      <rect x="4.2" y="4.8" width="2.6" height="6.2" rx="0.8" />
      <rect x="8.4" y="2.4" width="2.6" height="8.6" rx="0.8" />
      <rect x="12.6" y="0" width="2.6" height="11" rx="0.8" />
    </svg>

    {/* Wi-Fi */}
    <svg
      width="14"
      height="11"
      viewBox="0 0 16 12"
      fill="none"
      stroke={color}
      strokeWidth="1.7"
      strokeLinecap="round"
    >
      <path d="M1.6 4.6C3.4 3 5.6 2.1 8 2.1s4.6.9 6.4 2.5" />
      <path d="M4.1 7.3C5.2 6.3 6.5 5.7 8 5.7s2.8.6 3.9 1.6" />
      <circle cx="8" cy="10.1" r="1.25" fill={color} stroke="none" />
    </svg>

    {/* Battery */}
    <svg width="23" height="11" viewBox="0 0 25 12" fill="none">
      <rect
        x="0.6"
        y="0.6"
        width="20.8"
        height="10.8"
        rx="3.2"
        stroke={color}
        strokeOpacity="0.45"
        strokeWidth="1.1"
      />
      <rect x="2.2" y="2.2" width="15.5" height="7.6" rx="1.9" fill={color} />
      <path
        d="M22.9 4.1v3.8c1.1-.3 1.8-1 1.8-1.9s-.7-1.6-1.8-1.9z"
        fill={color}
        fillOpacity="0.45"
      />
    </svg>
  </div>
);

interface IPhoneProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const IPhone: React.FC<IPhoneProps> = ({
  children,
  className = "",
  style,
  onClick,
}) => (
  <div
    onClick={onClick}
    style={style}
    className={`absolute group cursor-pointer select-none ${className}`}
  >
    {/* Hardware buttons */}
    <div className="absolute -left-[3px] top-[15%] h-[18px] w-[3px] rounded-l bg-[#343438]" />
    <div className="absolute -left-[3px] top-[22.5%] h-[32px] w-[3px] rounded-l bg-[#343438]" />
    <div className="absolute -left-[3px] top-[30.5%] h-[32px] w-[3px] rounded-l bg-[#343438]" />
    <div className="absolute -right-[3px] top-[26.5%] h-[48px] w-[3px] rounded-r bg-[#343438]" />

    {/* Titanium outer frame */}
    <div className="relative h-[494px] w-[238px] rounded-[50px] bg-[linear-gradient(145deg,#a0a0a6_0%,#535359_11%,#232326_43%,#49494f_72%,#97979d_100%)] p-[3px] shadow-[0_42px_90px_-20px_rgba(0,0,0,0.85)] transition-transform duration-300 group-hover:scale-[1.035]">
      {/* Black bezel */}
      <div className="h-full w-full rounded-[47px] bg-black p-[7px]">
        {/* Display */}
        <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[40px] bg-[#f6f1ea] text-[#171310]">
          {/* Dynamic Island */}
          <div className="absolute left-1/2 top-[10px] z-30 h-[22px] w-[72px] -translate-x-1/2 rounded-full bg-black">
            <div className="absolute right-[7px] top-1/2 h-[11px] w-[11px] -translate-y-1/2 rounded-full bg-[#08080b]">
              <div className="absolute inset-[3px] rounded-full bg-[#1b2658]" />
              <div className="absolute left-[3px] top-[2px] h-[2px] w-[2px] rounded-full bg-[#94a6ff]/70" />
            </div>
          </div>

          {/* iOS status bar */}
          <div className="flex flex-none items-center justify-between px-[21px] pb-[5px] pt-[13px] text-[11px] font-semibold">
            <span className="w-[48px] tracking-tight">9:41</span>
            <StatusBarIcons />
          </div>

          {children}

          {/* Home indicator */}
          <div className="absolute bottom-[7px] left-1/2 z-30 h-[4px] w-[86px] -translate-x-1/2 rounded-full bg-[#171310]/85" />

          {/* Glass reflection */}
          <div className="pointer-events-none absolute inset-0 z-40 bg-[linear-gradient(120deg,rgba(255,255,255,.16)_0%,rgba(255,255,255,.05)_22%,transparent_43%)]" />
        </div>
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                               PHONE SCREENS                                */
/* -------------------------------------------------------------------------- */

const WelcomeScreen = () => (
  <>
    <div className="relative mx-2.5 mt-2.5 h-[150px] flex-none rounded-[18px] bg-[#171310] p-3.5 text-[#f6f1ea]">
      <div className="absolute right-2.5 top-2.5 rounded-[10px] bg-[#f6f1ea] px-2 py-1 text-[8px] font-semibold text-[#171310]">
        96% Match
      </div>

      <div className="mt-4 flex h-[52px] w-[52px] items-center justify-center rounded-full border-4 border-[#f6f1ea]/15 border-t-[#e87a45] text-[11px] font-bold">
        94%
      </div>

      <div className="absolute bottom-3.5 right-3.5 flex items-end gap-[3px]">
        <div className="h-2 w-[5px] rounded bg-[#e87a45] animate-pulse" />
        <div className="h-3.5 w-[5px] rounded bg-[#e87a45] animate-pulse [animation-delay:100ms]" />
        <div className="h-2.5 w-[5px] rounded bg-[#e87a45] animate-pulse [animation-delay:200ms]" />
        <div className="h-5 w-[5px] rounded bg-[#e87a45] animate-pulse [animation-delay:300ms]" />
        <div className="h-4 w-[5px] rounded bg-[#e87a45] animate-pulse [animation-delay:400ms]" />
      </div>
    </div>

    <div className="mt-5 px-4 text-center font-sora text-[15px] font-bold">
      Welcome to Sauti!
    </div>

    <div className="mt-2 px-6 text-center text-[9.5px] leading-relaxed text-[#171310]/60">
      Turn spoken testimony into structured, accurate legal statements.
    </div>

    <div className="mx-5 mt-4 rounded-full bg-[#171310] py-2.5 text-center text-[11px] font-semibold text-[#f6f1ea]">
      Record Intake
    </div>
  </>
);

const StatementsScreen = () => (
  <>
    <div className="px-4 pb-1 pt-2 font-sora text-base font-bold">
      Statements
    </div>

    <div className="flex gap-3 px-4 py-2 text-[9.5px] text-[#171310]/50">
      <span className="border-b-2 border-[#171310] pb-1 font-bold text-[#171310]">
        Draft
      </span>
      <span>In Review</span>
      <span>Finalized</span>
    </div>

    <div className="mx-3.5 my-2 rounded-[14px] border border-black/5 bg-white p-2.5 shadow-[0_6px_18px_rgba(0,0,0,.06)]">
      <div className="mb-1 text-[10.5px] font-bold">
        Amaka Okafor — Theft Report
      </div>
      <div className="mb-2 text-[8.5px] leading-tight text-[#171310]/60">
        Missing: location of incident. Awaiting officer confirmation.
      </div>
      <div className="flex items-center justify-between">
        <span className="rounded-[8px] bg-[#f3d9d6] px-2 py-0.5 text-[7.5px] font-bold text-[#8a3a2a]">
          Yoruba–English
        </span>
        <span className="text-[8px] opacity-50">Today</span>
      </div>
      <div className="mt-2 h-[3px] overflow-hidden rounded bg-[#eee]">
        <div className="h-full w-[60%] bg-[#c65a34]" />
      </div>
    </div>

    <div className="mx-3.5 my-1 rounded-[14px] border border-black/5 bg-white p-2.5 shadow-[0_6px_18px_rgba(0,0,0,.06)]">
      <div className="mb-1 text-[10.5px] font-bold">
        Tunde Bello — Assault Report
      </div>
      <div className="mb-2 text-[8.5px] leading-tight text-[#171310]/60">
        All required fields confirmed and signed.
      </div>
      <div className="flex items-center justify-between">
        <span className="rounded-[8px] bg-[#e4e9d8] px-2 py-0.5 text-[7.5px] font-bold text-[#4c5a2f]">
          Pidgin–English
        </span>
        <span className="text-[8px] opacity-50">Yesterday</span>
      </div>
      <div className="mt-2 h-[3px] overflow-hidden rounded bg-[#eee]">
        <div className="h-full w-full bg-[#c65a34]" />
      </div>
    </div>
  </>
);

const StatisticsScreen = () => (
  <>
    <div className="px-4 pb-2 pt-2.5 font-sora text-[15px] font-bold">
      Statistics
    </div>

    <div className="mb-2 flex gap-2 px-3.5">
      <div className="flex-1 rounded-xl bg-white p-2 shadow-[0_6px_16px_rgba(0,0,0,.05)]">
        <div className="font-sora text-[15px] font-bold">18</div>
        <div className="text-[7.5px] opacity-60">Statements this week</div>
      </div>

      <div className="flex-1 rounded-xl bg-[#f3d9d6] p-2 shadow-[0_6px_16px_rgba(0,0,0,.05)]">
        <div className="font-sora text-[15px] font-bold text-[#8a3a2a]">2</div>
        <div className="text-[7.5px] text-[#8a3a2a]/80">Needs review</div>
      </div>
    </div>

    <div className="mx-3.5 mb-2 rounded-xl bg-[#171310] p-3 text-[#f6f1ea]">
      <div className="font-sora text-[18px] font-bold">96.2%</div>
      <div className="mt-0.5 text-[8px] opacity-60">
        Avg. entity accuracy (Sahara)
      </div>

      <div className="mt-2 flex h-[34px] items-end gap-1.5">
        <div className="h-[40%] flex-1 rounded bg-[#e87a45]" />
        <div className="h-[70%] flex-1 rounded bg-[#e87a45]" />
        <div className="h-[55%] flex-1 rounded bg-[#e87a45]" />
        <div className="h-[90%] flex-1 rounded bg-[#e87a45]" />
        <div className="h-[65%] flex-1 rounded bg-[#e87a45]" />
      </div>
    </div>

    <div className="px-3.5">
      <div className="rounded-xl bg-white p-2 shadow-[0_6px_16px_rgba(0,0,0,.05)]">
        <div className="font-sora text-[15px] font-bold">1.4s</div>
        <div className="text-[7.5px] opacity-60">Avg. transcription time</div>
      </div>
    </div>
  </>
);

const PhoneComposition: React.FC<{
  onStartApp: LandingPageProps["onStartApp"];
}> = ({ onStartApp }) => (
  <div className="relative mx-auto hidden h-[390px] w-full max-w-[540px] md:block lg:mx-0 lg:h-[455px] xl:h-[550px] 2xl:h-[620px]">
    <div className="absolute left-1/2 top-0 h-[620px] w-[740px] origin-top -translate-x-1/2 scale-[0.62] sm:scale-[0.68] lg:left-0 lg:origin-top-left lg:translate-x-0 lg:scale-[0.72] xl:scale-[0.88] 2xl:scale-100">
      <IPhone
        onClick={() => onStartApp("record")}
        className="z-10"
        style={{
          left: 0,
          top: "70px",
          transform: "rotate(-9deg)",
        }}
      >
        <WelcomeScreen />
      </IPhone>

      <IPhone
        onClick={() => onStartApp("statements")}
        className="z-20"
        style={{
          left: "200px",
          top: 0,
          transform: "rotate(3deg)",
        }}
      >
        <StatementsScreen />
      </IPhone>

      <IPhone
        onClick={() => onStartApp("statistics")}
        className="z-0"
        style={{
          left: "396px",
          top: "110px",
          transform: "rotate(13deg)",
        }}
      >
        <StatisticsScreen />
      </IPhone>

      <div className="pointer-events-none absolute right-0 top-5 z-30 w-[195px] rounded-2xl border border-white/20 bg-white/[0.1] p-3.5 text-[11.5px] text-white shadow-[0_20px_50px_rgba(0,0,0,.3)] backdrop-blur-md">
        <div className="mb-2 text-xs font-semibold">Live Transcription</div>
        <div className="flex items-center gap-2 text-[11px] text-white/90">
          <div className="flex items-end gap-[2px]">
            <div className="h-2 w-[3px] rounded bg-[#e87a45]" />
            <div className="h-4 w-[3px] rounded bg-[#e87a45]" />
            <div className="h-2.5 w-[3px] rounded bg-[#e87a45]" />
            <div className="h-5 w-[3px] rounded bg-[#e87a45]" />
            <div className="h-3 w-[3px] rounded bg-[#e87a45]" />
          </div>
          <span>Detecting: Yoruba–English</span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-8 right-5 z-30 w-[195px] rounded-2xl border border-white/20 bg-white/[0.1] p-3.5 text-[11.5px] text-white shadow-[0_20px_50px_rgba(0,0,0,.3)] backdrop-blur-md">
        <div className="mb-2.5 text-xs font-semibold">Statement Check</div>
        <div className="mb-1.5 flex justify-between text-[11px]">
          <span className="text-white/80">Complainant name</span>
          <span className="font-bold text-[#8fd6a8]">✓</span>
        </div>
        <div className="mb-1.5 flex justify-between text-[11px]">
          <span className="text-white/80">Date & time</span>
          <span className="font-bold text-[#8fd6a8]">✓</span>
        </div>
        <div className="flex justify-between text-[11px]">
          <span className="text-white/80">Location</span>
          <span className="font-semibold text-[#e87a45]">Missing</span>
        </div>
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                          MAGIC BENTO FEATURE GRID                          */
/* -------------------------------------------------------------------------- */

const GLOW_COLOR_RGB = "232, 122, 69"; // Matches #e87a45
const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 400;

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const featuresData: FeatureItem[] = [
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: "Code-Switched ASR",
    text: "Powered by Intron Sahara, trained for authentic African accents, Nigerian Pidgin, and Yoruba-English code-switching.",
  },
  {
    icon: <Scale className="h-6 w-6" />,
    title: "First-Mile Legal Intake",
    text: 'Turns spoken testimony into structured statements and flags missing information such as "Location not mentioned — please verify."',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Ethics & Consent-First",
    text: "Process-and-discard audio by default, with a human review gate before any legal statement is finalized.",
  },
];

const createParticleElement = (x: number, y: number, color: string) => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 8px rgba(${color}, 0.8);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const updateCardGlowProperties = (
  card: HTMLElement,
  mouseX: number,
  mouseY: number,
  glow: number,
  radius: number,
) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;

  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};

const ParticleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  disableAnimations?: boolean;
}> = ({ children, className = "", style, disableAnimations = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLElement[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef<HTMLElement[]>([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef<gsap.core.Tween | null>(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: DEFAULT_PARTICLE_COUNT }, () =>
      createParticleElement(
        Math.random() * width,
        Math.random() * height,
        GLOW_COLOR_RGB,
      ),
    );
    particlesInitialized.current = true;
  }, []);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();

    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => {
          particle.parentNode?.removeChild(particle);
        },
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!particlesInitialized.current) initializeParticles();

    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;

        const clone = particle.cloneNode(true) as HTMLElement;
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" },
        );

        gsap.to(clone, {
          x: (Math.random() - 0.5) * 80,
          y: (Math.random() - 0.5) * 80,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });

        gsap.to(clone, {
          opacity: 0.4,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, index * 80);

      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const element = cardRef.current;

    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
      gsap.to(element, {
        rotateX: 4,
        rotateY: 4,
        duration: 0.3,
        ease: "power2.out",
        transformPerspective: 1000,
      });
    };

    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      gsap.to(element, { rotateX: 0, rotateY: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(element, { x: 0, y: 0, duration: 0.3, ease: "power2.out" });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      gsap.to(element, {
        rotateX,
        rotateY,
        duration: 0.1,
        ease: "power2.out",
        transformPerspective: 1000,
      });

      magnetismAnimationRef.current = gsap.to(element, {
        x: (x - centerX) * 0.04,
        y: (y - centerY) * 0.04,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleClick = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height),
      );

      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute;
        width: ${maxDistance * 2}px;
        height: ${maxDistance * 2}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(${GLOW_COLOR_RGB}, 0.25) 0%, rgba(${GLOW_COLOR_RGB}, 0.1) 40%, transparent 70%);
        left: ${x - maxDistance}px;
        top: ${y - maxDistance}px;
        pointer-events: none;
        z-index: 1000;
      `;

      element.appendChild(ripple);

      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        },
      );
    };

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);

    return () => {
      isHoveredRef.current = false;
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [animateParticles, clearAllParticles, disableAnimations]);

  return (
    <div
      ref={cardRef}
      className={`${className} relative overflow-hidden`}
      style={{ ...style, position: "relative", overflow: "hidden" }}
    >
      {children}
    </div>
  );
};

const GlobalSpotlight: React.FC<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  disableAnimations?: boolean;
}> = ({ gridRef, disableAnimations = false }) => {
  const spotlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (disableAnimations || !gridRef?.current) return;

    const spotlight = document.createElement("div");
    spotlight.className = "global-spotlight";
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${GLOW_COLOR_RGB}, 0.12) 0%,
        rgba(${GLOW_COLOR_RGB}, 0.06) 20%,
        rgba(${GLOW_COLOR_RGB}, 0.02) 40%,
        transparent 65%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e: MouseEvent) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current;
      const rect = section.getBoundingClientRect();
      const mouseInside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      const cards = gridRef.current.querySelectorAll(".bento-card");

      if (!mouseInside) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
        cards.forEach((card) => {
          (card as HTMLElement).style.setProperty("--glow-intensity", "0");
        });
        return;
      }

      const proximity = DEFAULT_SPOTLIGHT_RADIUS * 0.5;
      const fadeDistance = DEFAULT_SPOTLIGHT_RADIUS * 0.8;
      let minDistance = Infinity;

      cards.forEach((card) => {
        const cardElement = card as HTMLElement;
        const cardRect = cardElement.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);

        minDistance = Math.min(minDistance, effectiveDistance);

        let glowIntensity = 0;
        if (effectiveDistance <= proximity) {
          glowIntensity = 1;
        } else if (effectiveDistance <= fadeDistance) {
          glowIntensity = (fadeDistance - effectiveDistance) / (fadeDistance - proximity);
        }

        updateCardGlowProperties(
          cardElement,
          e.clientX,
          e.clientY,
          glowIntensity,
          DEFAULT_SPOTLIGHT_RADIUS,
        );
      });

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });

      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
          ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
          : 0;

      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gridRef.current?.querySelectorAll(".bento-card").forEach((card) => {
        (card as HTMLElement).style.setProperty("--glow-intensity", "0");
      });
      if (spotlightRef.current) {
        gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations]);

  return null;
};

const FeaturesBentoGrid: React.FC = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <>
      <style>
        {`
          .bento-card {
            --glow-x: 50%;
            --glow-y: 50%;
            --glow-intensity: 0;
            --glow-radius: 300px;
            --glow-color-rgb: ${GLOW_COLOR_RGB};
          }
          
          .bento-card::after {
            content: '';
            position: absolute;
            inset: 0;
            padding: 1px;
            background: radial-gradient(var(--glow-radius) circle at var(--glow-x) var(--glow-y),
                rgba(var(--glow-color-rgb), calc(var(--glow-intensity) * 0.8)) 0%,
                rgba(var(--glow-color-rgb), calc(var(--glow-intensity) * 0.3)) 30%,
                transparent 60%);
            border-radius: inherit;
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            pointer-events: none;
            opacity: 1;
            transition: opacity 0.3s ease;
            z-index: 1;
          }
          
          .bento-card:hover {
            box-shadow: 0 4px 25px rgba(232, 122, 69, 0.08), 0 0 30px rgba(var(--glow-color-rgb), 0.15);
            border-color: rgba(232, 122, 69, 0.3);
          }

          .particle::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: rgba(var(--glow-color-rgb), 0.3);
            border-radius: 50%;
            z-index: -1;
          }
        `}
      </style>

      <GlobalSpotlight gridRef={gridRef} disableAnimations={isMobile} />

      <div ref={gridRef} className="relative select-none z-10 w-full">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6 lg:gap-8">
          {featuresData.map((item, index) => {
            const baseClassName =
              "bento-card flex flex-col relative w-full p-6 sm:p-7 lg:p-8 rounded-2xl border border-white/10 bg-[#171310]/85 backdrop-blur-md transition-colors duration-300 ease-in-out cursor-default";

            return (
              <ParticleCard
                key={index}
                className={baseClassName}
                disableAnimations={isMobile}
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#c65a34]/40 bg-[#c65a34]/20 text-[#e87a45]">
                  {item.icon}
                </div>
                <div className="relative text-white">
                  <h3 className="mb-3 font-sora text-xl font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#f6f1ea]/70">
                    {item.text}
                  </p>
                </div>
              </ParticleCard>
            );
          })}
        </div>
      </div>
    </>
  );
};

/* -------------------------------------------------------------------------- */
/*                                MAIN PAGE                                   */
/* -------------------------------------------------------------------------- */

export const LandingPage: React.FC<LandingPageProps> = ({ onStartApp }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const modalContent = {
    "how-it-works": {
      title: "How Sauti Works",
      body: (
        <div className="space-y-4 text-sm leading-relaxed text-[#f6f1ea]/80">
          <p>
            <strong className="text-white">1. Speak naturally.</strong> A
            complainant can speak English, Pidgin, Yoruba-English, or
            code-switched language naturally.
          </p>
          <p>
            <strong className="text-white">2. Transcribe accurately.</strong>{" "}
            Sahara ASR captures dialects, local names, landmarks, and
            code-switched terms.
          </p>
          <p>
            <strong className="text-white">3. Structure the statement.</strong>{" "}
            Sauti organizes testimony and highlights missing legal details.
          </p>
          <p>
            <strong className="text-white">4. Officer review.</strong> A human
            officer verifies the record before final export.
          </p>
        </div>
      ),
    },
    institutions: {
      title: "For Police & Legal Aid Desks",
      body: (
        <div className="space-y-3 text-sm text-[#f6f1ea]/80">
          {[
            "Eliminates handwriting ambiguity and lost details",
            "Reduces intake drafting time",
            "Standardizes evidentiary records",
          ].map((item) => (
            <div key={item} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 flex-none text-[#8fd6a8]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      ),
    },
    privacy: {
      title: "Privacy & Ethics Policy",
      body: (
        <div className="space-y-3 text-sm leading-relaxed text-[#f6f1ea]/80">
          <p>
            <strong className="text-white">Process-and-discard audio:</strong>{" "}
            audio is processed for transcription and discarded unless explicit
            consent is provided.
          </p>
          <p>
            <strong className="text-white">Human oversight:</strong> AI does
            not sign, file, or finalize legal complaints.
          </p>
          <p>
            <strong className="text-white">Confidentiality:</strong> data is
            transmitted securely and handled under consent-first principles.
          </p>
        </div>
      ),
    },
  } as const;

  const currentModal = activeModal
    ? modalContent[activeModal as keyof typeof modalContent]
    : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0d0705] text-[#f6f1ea] selection:bg-[#c65a34] selection:text-white">
      {/* ------------------------------------------------------------------ */}
      {/* Global animated background                                         */}
      {/* ------------------------------------------------------------------ */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <AcidSquares
          color1="#3a1410"
          color2="#d1512e"
          color3="#f0703f"
          detail="medium"
          speed={0.7}
          waveDepth={5.6}
          zoom={1.4}
          density={13.0}
          glow={1.5}
          exposure={3200}
          spread={0.3}
          stepSize={0.002}
          colorShift={0}
          contrast={2.5}
          brightness={1.0}
          opacity={0.85}
          mouseInteraction={true}
          mouseStrength={0.5}
          mouseRadius={1.4}
          blur={0}
          grain={true}
          grainIntensity={0.015}
        />
        {/* dark tint + original radial gradients */}
        <div className="absolute inset-0 bg-[#0d0705]/30 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 90% 70% at 15% 15%, rgba(198,90,52,0.45), transparent 60%), radial-gradient(ellipse 80% 60% at 85% 85%, rgba(122,47,28,0.4), transparent 60%)`,
          }}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative z-10 px-5 pb-14 pt-5 sm:px-8 md:px-10 lg:px-12 lg:pb-16 lg:pt-7">
        <nav className="mx-auto mb-14 flex max-w-[1240px] items-center justify-between sm:mb-16 lg:mb-20">
          <button
            onClick={() => onStartApp("record")}
            className="flex items-center gap-2.5 font-sora text-xl font-bold tracking-tight"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
            <span>sauti</span>
          </button>

          <div className="hidden items-center gap-6 text-[14px] font-medium text-[#f6f1ea]/75 lg:flex xl:gap-8">
            <button
              onClick={() => setActiveModal("how-it-works")}
              className="transition-colors hover:text-white"
            >
              How it works
            </button>
            <button
              onClick={() => setActiveModal("institutions")}
              className="transition-colors hover:text-white"
            >
              For institutions
            </button>
            <button
              onClick={() => onStartApp("benchmark")}
              className="transition-colors hover:text-white"
            >
              Benchmark
            </button>
            <button
              onClick={() => setActiveModal("privacy")}
              className="transition-colors hover:text-white"
            >
              Privacy
            </button>
          </div>

          <button
            onClick={() => onStartApp("record")}
            className="rounded-full bg-[#f6f1ea] px-4 py-2 text-xs font-semibold text-[#171310] shadow-lg transition-all hover:scale-105 hover:bg-white sm:px-6 sm:py-2.5 sm:text-sm"
          >
            Start Free
          </button>
        </nav>

        <div className="mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(500px,1.1fr)] lg:gap-7 xl:grid-cols-[1fr_1.15fr] xl:gap-10">
          {/* Hero copy */}
          <div className="mx-auto w-full max-w-[620px] text-center lg:mx-0 lg:max-w-none lg:text-left">
            <div className="mb-5 text-[10px] font-semibold uppercase leading-relaxed tracking-[0.15em] text-[#f6f1ea]/65 sm:text-[11px] md:text-[12px] lg:max-w-[400px] lg:text-[12.5px]">
              The voice AI platform powering code-switched complaint intake,
              statement structuring, and civic access to justice
            </div>

            <h1 className="mb-7 font-sora text-[36px] font-bold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl md:text-[54px] lg:text-[46px] xl:text-[52px]">
              Every Spoken Complaint, Captured Exactly As It Was Said
            </h1>

            <div className="mb-8 flex flex-wrap justify-center gap-2 lg:justify-start">
              {["Code-Switch AI", "Statement Builder", "Consent-First"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-full border border-[#f6f1ea]/25 bg-[#f6f1ea]/[0.05] px-3 py-1.5 text-[12px] text-[#f6f1ea]/90 backdrop-blur-sm sm:px-4 sm:py-2 sm:text-[13.5px]"
                  >
                    {item}
                  </div>
                ),
              )}
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <button
                onClick={() => onStartApp("record")}
                className="flex items-center justify-center gap-2 rounded-full bg-[#e87a45] px-6 py-3 text-[14px] font-semibold text-white shadow-xl transition-colors hover:bg-[#c65a34] sm:px-7 sm:text-[15px]"
              >
                Launch Intake App
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onStartApp("statements")}
                className="rounded-full border border-[#f6f1ea]/30 px-6 py-3 text-[14px] font-medium text-[#f6f1ea] transition-colors hover:border-white/70 sm:text-sm"
              >
                View Statements (3)
              </button>
            </div>
          </div>

          {/* Responsive iPhone scene */}
          <PhoneComposition onStartApp={onStartApp} />
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Interactive Features Bento                                         */}
      {/* ------------------------------------------------------------------ */}
      <section className="relative z-10 mx-auto max-w-[1240px] px-5 py-14 sm:px-8 md:px-10 md:py-20 lg:px-12">
        <FeaturesBentoGrid />
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Modal                                                              */}
      {/* ------------------------------------------------------------------ */}
      {currentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/15 bg-[#171310] p-6 text-[#f6f1ea] shadow-2xl sm:p-8">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 rounded-lg p-1 text-[#f6f1ea]/60 transition hover:bg-white/10 hover:text-white sm:right-5 sm:top-5"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-4 pr-8 font-sora text-2xl font-bold text-white">
              {currentModal.title}
            </h2>

            {currentModal.body}

            <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
              <button
                onClick={() => {
                  setActiveModal(null);
                  onStartApp("record");
                }}
                className="rounded-full bg-[#e87a45] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#c65a34]"
              >
                Go to App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};