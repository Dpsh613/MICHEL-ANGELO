import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { artworks, processSteps } from "./data";
import { Arrow } from "./components/Icons";
import type { DialogState } from "./components/ArtworkDialog";
import { useAmbience } from "./hooks/useAmbience";

const ArtworkDialog = lazy(() => import("./components/ArtworkDialog"));
const preloadDialog = () => {
  void import("./components/ArtworkDialog");
};

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduced ? 0 : 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: reduced ? 0 : 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({
  number,
  children,
}: {
  number: string;
  children: ReactNode;
}) {
  return (
    <div className="section-label">
      <span>{number}</span>
      <i aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export default function App() {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("atelier");
  const [processStep, setProcessStep] = useState(0);
  const hero = useRef<HTMLElement>(null);
  const lightStage = useRef<HTMLElement>(null);
  const lightInput = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();
  const { playing, unavailable, toggle } = useAmbience();
  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 130]);
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.75],
    [1, reduced ? 1 : 0],
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -55% 0px" },
    );
    document
      .querySelectorAll<HTMLElement>("main > section[id]")
      .forEach((section) => observer.observe(section));
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    const trigger = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() =>
      document.querySelector<HTMLElement>("#mobile-navigation a")?.focus(),
    );
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
      if (event.key !== "Tab") return;
      const controls = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".site-header a, .site-header button, #mobile-navigation a",
        ),
      ).filter((element) => element.offsetParent !== null);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth > 600) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      trigger?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  function openWork(id: string) {
    setDialog({ kind: "work", id });
  }
  function changeLight(value: number, y = window.innerWidth <= 600 ? 65 : 50) {
    const x = Math.max(5, Math.min(95, value));
    // Direct style updates keep pointer motion out of React's render cycle.
    lightStage.current?.style.setProperty("--light-x", `${x}%`);
    lightStage.current?.style.setProperty("--light-y", `${y}%`);
    if (lightInput.current) lightInput.current.value = String(Math.round(x));
  }

  const links = [
    { href: "atelier", title: "The atelier" },
    { href: "works", title: "Selected works" },
    { href: "process", title: "Inside the mind" },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#works">
        Skip to the works
      </a>
      <header
        className={`site-header ${scrolled ? "is-scrolled" : ""} ${menuOpen ? "menu-is-open" : ""}`}
      >
        <div className="header-inner">
          <a
            className="brand"
            href="#atelier"
            aria-label="Michelangelo Buonarroti, back to the atelier"
            onClick={() => setMenuOpen(false)}
          >
            <span className="brand-mark">
              mb<span>.</span>
            </span>
            <span className="brand-name">
              MICHELANGELO
              <br />
              BUONARROTI
            </span>
          </a>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map((link) => (
              <a
                key={link.href}
                className={activeSection === link.href ? "active" : ""}
                aria-current={
                  activeSection === link.href ? "location" : undefined
                }
                href={`#${link.href}`}
              >
                {link.title}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <button
              className={`sound-toggle ${playing ? "is-playing" : ""}`}
              onClick={() => void toggle()}
              aria-pressed={playing}
              aria-label={
                playing ? "Turn ambient sound off" : "Turn ambient sound on"
              }
            >
              <span className="sound-bars" aria-hidden="true">
                {[0, 1, 2, 3, 4].map((index) => (
                  <i key={index} style={{ "--bar": index } as CSSProperties} />
                ))}
              </span>
              <span>
                {unavailable
                  ? "Sound unavailable"
                  : `Sound ${playing ? "on" : "off"}`}
              </span>
            </button>
            <button
              className={`menu-toggle ${menuOpen ? "is-open" : ""}`}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            id="mobile-navigation"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {links.map((link, index) => (
              <motion.a
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                key={link.href}
                href={`#${link.href}`}
                onClick={() => setMenuOpen(false)}
              >
                <span>0{index + 1}</span>
                {link.title}
                <Arrow direction="diagonal" />
              </motion.a>
            ))}
            <p>Stone. Thought. The space between.</p>
          </motion.nav>
        )}
      </AnimatePresence>

      <main inert={menuOpen}>
        <section
          className="hero"
          id="atelier"
          ref={hero}
          aria-label="The atelier of Michelangelo"
        >
          <motion.div className="hero-image-plane" style={{ y: heroY }}>
            <motion.img
              src="./images/atelier-hero.webp"
              alt="A monumental marble portrait of David emerging from the dark of the atelier"
              fetchPriority="high"
              initial={{ scale: reduced ? 1 : 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.4, ease: [0.2, 0.6, 0.3, 1] }}
            />
          </motion.div>
          <div className="hero-shade" />
          <motion.div className="hero-content" style={{ opacity: heroOpacity }}>
            <motion.p
              className="hero-eyebrow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.15 }}
            >
              <span />
              Sculptor. Painter. Architect.
            </motion.p>
            <h1 aria-label="Michelangelo">
              <span className="title-line">
                <motion.span
                  initial={{ y: reduced ? 0 : "105%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 1.25,
                    delay: 0.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  MICHEL
                </motion.span>
              </span>
              <span className="title-line">
                <motion.span
                  initial={{ y: reduced ? 0 : "105%" }}
                  animate={{ y: 0 }}
                  transition={{
                    duration: 1.25,
                    delay: 0.28,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  ANGELO<span className="title-period">.</span>
                </motion.span>
              </span>
            </h1>
            <motion.div
              initial={{ opacity: 0, y: reduced ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.65 }}
            >
              <p className="hero-thought">
                The soul is in the stone.
                <br />I only set it free.
              </p>
              <a className="hero-cta" href="#works">
                <span>Enter the atelier</span>
                <span className="circle-arrow">
                  <Arrow />
                </span>
              </a>
            </motion.div>
          </motion.div>
          <motion.a
            className="scroll-cue"
            href="#works"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
          >
            <span className="scroll-line" />
            <span>Scroll to discover</span>
            <Arrow direction="down" />
          </motion.a>
          <div className="hero-grain" aria-hidden="true" />
        </section>

        <section className="works-section section-space" id="works">
          <div className="page-width">
            <Reveal>
              <SectionLabel number="01">Selected works</SectionLabel>
            </Reveal>
            <div className="section-heading-row">
              <Reveal>
                <h2>
                  A life in pursuit
                  <br />
                  of the <em>impossible.</em>
                </h2>
              </Reveal>
              <Reveal className="works-intro" delay={0.1}>
                <p>
                  Not objects to be admired.
                  <br />
                  Worlds to be entered.
                </p>
                <button
                  className="text-link"
                  onClick={() => setDialog({ kind: "index" })}
                  onPointerEnter={preloadDialog}
                >
                  Open the work index
                  <Arrow direction="diagonal" />
                </button>
              </Reveal>
            </div>
            <div className="work-grid">
              {artworks.slice(0, 3).map((work, index) => (
                <Reveal
                  className={`work-tile tile-${index + 1}`}
                  key={work.id}
                  delay={index * 0.1}
                >
                  <button
                    className="artwork-button"
                    onClick={() => openWork(work.id)}
                    onPointerEnter={preloadDialog}
                    aria-label={`Explore ${work.title}`}
                  >
                    <figure>
                      <div className="artwork-image">
                        <img
                          src={work.image}
                          alt={work.alt}
                          loading="lazy"
                          width="720"
                          height="850"
                        />
                        <span className="image-open">
                          <Arrow direction="diagonal" />
                        </span>
                        <span className="image-caption">Look closer</span>
                      </div>
                      <figcaption>
                        <span className="work-category">
                          {work.discipline}
                          <span>{work.date}</span>
                        </span>
                        <span className="work-title">
                          {work.title}
                          <Arrow direction="diagonal" />
                        </span>
                        <span className="work-material">{work.material}</span>
                      </figcaption>
                    </figure>
                  </button>
                </Reveal>
              ))}
            </div>
            <Reveal className="works-endnote">
              <span>Every mark, a decision. Every work, a world.</span>
              <span className="little-star" aria-hidden="true">
                *
              </span>
            </Reveal>
          </div>
        </section>

        <section className="process-section section-space" id="process">
          <div className="page-width process-layout">
            <div className="process-copy">
              <Reveal>
                <SectionLabel number="02">Inside the mind</SectionLabel>
                <h2>
                  The mind
                  <br />
                  before <em>the hand.</em>
                </h2>
                <p className="process-intro">
                  Nothing begins with the chisel.
                  <br />
                  Everything begins with a way of seeing.
                </p>
              </Reveal>
              <div
                className="process-steps"
                role="tablist"
                aria-label="Discover the creative process"
                aria-orientation="vertical"
              >
                {processSteps.map((step, index) => (
                  <div
                    className={`process-step ${processStep === index ? "is-active" : ""}`}
                    key={step.number}
                  >
                    <button
                      role="tab"
                      aria-selected={processStep === index}
                      aria-controls="process-panel"
                      id={`process-tab-${index}`}
                      tabIndex={processStep === index ? 0 : -1}
                      onClick={() => setProcessStep(index)}
                      onKeyDown={(event) => {
                        let next = index;
                        if (event.key === "ArrowDown") next = (index + 1) % 3;
                        else if (event.key === "ArrowUp")
                          next = (index + 2) % 3;
                        else if (event.key === "Home") next = 0;
                        else if (event.key === "End") next = 2;
                        else return;
                        event.preventDefault();
                        setProcessStep(next);
                        document.getElementById(`process-tab-${next}`)?.focus();
                      }}
                    >
                      <span className="step-number">{step.number}.</span>
                      <span>{step.title}</span>
                      <Arrow
                        direction={processStep === index ? "diagonal" : "right"}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {processStep === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35 }}
                          className="step-description"
                        >
                          <p>{step.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
            <Reveal className="process-visual">
              <div
                id="process-panel"
                role="tabpanel"
                aria-labelledby={`process-tab-${processStep}`}
                className={`process-media ${processStep === 2 ? "is-stone" : ""}`}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={processStep}
                    src={processSteps[processStep].image}
                    alt={
                      artworks.find(
                        (work) => work.id === processSteps[processStep].workId,
                      )!.alt
                    }
                    loading="lazy"
                    initial={{ opacity: 0, scale: reduced ? 1 : 1.025 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45 }}
                  />
                </AnimatePresence>
              </div>
              <div className="study-caption">
                <span>
                  <span className="study-number">
                    {processSteps[processStep].number}.
                  </span>
                  {processSteps[processStep].caption}
                </span>
                <button
                  className="text-link"
                  onClick={() => openWork(processSteps[processStep].workId)}
                >
                  Open the study
                  <Arrow direction="diagonal" />
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          className="stone-room"
          id="stone"
          ref={lightStage}
          onPointerMove={(event) => {
            if (event.pointerType === "touch") return;
            const bounds = event.currentTarget.getBoundingClientRect();
            changeLight(
              ((event.clientX - bounds.left) / bounds.width) * 100,
              ((event.clientY - bounds.top) / bounds.height) * 100,
            );
          }}
        >
          <div className="stone-image-plane" aria-hidden="true">
            <img
              className="stone-base"
              src="./images/non-finito.webp"
              alt=""
              loading="lazy"
            />
            <div className="stone-light">
              <img src="./images/non-finito.webp" alt="" loading="lazy" />
            </div>
          </div>
          <div className="stone-shade" />
          <div className="page-width stone-content">
            <Reveal>
              <SectionLabel number="03">The unfinished</SectionLabel>
            </Reveal>
            <Reveal className="stone-copy">
              <h2>
                Becoming.
                <br />
                Never <em>finished.</em>
              </h2>
              <p>
                Between the rough stone and the living form, there is a place
                where the work still breathes.
              </p>
              <p>Stay here a moment.</p>
              <button
                className="text-link"
                onClick={() => openWork("unfinished")}
              >
                Discover non-finito
                <Arrow direction="diagonal" />
              </button>
            </Reveal>
          </div>
          <div
            className="light-control"
            onPointerMove={(event) => event.stopPropagation()}
          >
            <label htmlFor="light-position">
              <span className="light-icon" aria-hidden="true" />
              <span>Move the light. Find the form.</span>
            </label>
            <input
              ref={lightInput}
              id="light-position"
              type="range"
              min="5"
              max="95"
              defaultValue="68"
              onChange={(event) => changeLight(Number(event.target.value))}
              aria-label="Move the light across the marble"
            />
            <span className="light-control-hint">
              An invitation to look a little longer
            </span>
          </div>
        </section>
      </main>

      <footer className="site-footer" inert={menuOpen}>
        <div className="page-width">
          <Reveal className="closing-thought">
            <span className="eyebrow">The work is never over</span>
            <p>
              Ancora imparo<span>.</span>
            </p>
            <span className="closing-translation">Still, I am learning.</span>
          </Reveal>
          <div className="footer-bottom">
            <a className="footer-brand" href="#atelier">
              Michelangelo Buonarroti<span>A contemporary atelier</span>
            </a>
            <button
              className="footer-about"
              onClick={() => setDialog({ kind: "credits" })}
            >
              About this experience
              <Arrow direction="diagonal" />
            </button>
            <a className="back-top" href="#atelier">
              Back to the beginning
              <Arrow direction="up" />
            </a>
          </div>
          <div className="footer-fineprint">
            <span>An imagined atelier. An enduring spirit.</span>
            <span>Made for the art of looking.</span>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        {dialog && (
          <ArtworkDialog
            state={dialog}
            onClose={() => setDialog(null)}
            onChange={setDialog}
          />
        )}
      </Suspense>
    </MotionConfig>
  );
}
