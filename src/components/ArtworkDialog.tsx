import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { artworks, type Artwork, type Discipline } from "../data";
import { Arrow, CloseIcon, PlusIcon, SearchIcon } from "./Icons";

export type DialogState =
  { kind: "work"; id: string } | { kind: "index" } | { kind: "credits" } | null;

type Props = {
  state: NonNullable<DialogState>;
  onClose: () => void;
  onChange: (state: NonNullable<DialogState>) => void;
};

export default function ArtworkDialog({ state, onClose, onChange }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const element = dialog.current!;
    const focused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      focused?.focus({ preventScroll: true });
    };
  }, []);

  const work =
    state.kind === "work"
      ? artworks.find((item) => item.id === state.id)
      : undefined;
  const viewKey = state.kind === "work" ? state.id : state.kind;
  useEffect(() => {
    dialog.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [viewKey]);

  return createPortal(
    <dialog
      ref={dialog}
      className={`atelier-dialog ${state.kind === "credits" ? "credits-dialog" : ""}`}
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        closeRef.current();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        className="dialog-panel"
        initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.35 }}
      >
        <div className="dialog-topbar">
          <button
            className="dialog-back text-link"
            onClick={() =>
              state.kind === "work" ? onChange({ kind: "index" }) : onClose()
            }
          >
            <Arrow direction="left" />
            {state.kind === "work" ? "The work index" : "Back to the atelier"}
          </button>
          <button
            className="icon-button close-button"
            onClick={onClose}
            aria-label="Close dialog"
            autoFocus
          >
            <CloseIcon />
          </button>
        </div>
        {state.kind === "index" && (
          <WorkIndex onSelect={(id) => onChange({ kind: "work", id })} />
        )}
        {state.kind === "work" && work && (
          <WorkViewer
            key={work.id}
            work={work}
            onSelect={(id) => onChange({ kind: "work", id })}
          />
        )}
        {state.kind === "credits" && <Credits />}
      </motion.div>
    </dialog>,
    document.body,
  );
}

function WorkIndex({ onSelect }: { onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Discipline | "All">("All");
  const disciplines: (Discipline | "All")[] = [
    "All",
    "Sculpture",
    "Painting",
    "Architecture",
    "Drawing",
  ];
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  const filtered = artworks.filter(
    (work) =>
      (filter === "All" || filter === work.discipline) &&
      normalize(
        `${work.title} ${work.material} ${work.discipline} ${work.location} ${work.date}`,
      ).includes(normalize(query)),
  );

  return (
    <div className="work-index">
      <span className="eyebrow">A lifetime of looking</span>
      <h2 id="dialog-title">
        The work index<span className="accent">.</span>
      </h2>
      <div className="index-toolbar">
        <div className="index-filters" aria-label="Filter works by discipline">
          {disciplines.map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="index-search">
          <SearchIcon />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a work..."
            aria-label="Search the work index"
          />
        </label>
      </div>
      <p className="index-count" aria-live="polite">
        {String(filtered.length).padStart(2, "0")} works & studies
      </p>
      <div className="index-results">
        {filtered.map((work) => (
          <button
            className="index-work"
            onClick={() => onSelect(work.id)}
            key={work.id}
          >
            <img src={work.image} alt="" loading="lazy" />
            <span className="index-work-info">
              <span className="eyebrow">{work.discipline}</span>
              <span className="index-work-title">{work.title}</span>
              <span className="index-work-date">{work.date}</span>
            </span>
            <Arrow direction="diagonal" />
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="empty-results">
          <h3>A little further into the stone.</h3>
          <p>No works match this search. Try a different word or discipline.</p>
          <button
            className="text-link"
            onClick={() => {
              setQuery("");
              setFilter("All");
            }}
          >
            Show all works <Arrow />
          </button>
        </div>
      )}
      <p className="index-footnote">
        Original masterpieces and imagined studies, brought together in a
        contemporary atelier.
      </p>
    </div>
  );
}

function WorkViewer({
  work,
  onSelect,
}: {
  work: Artwork;
  onSelect: (id: string) => void;
}) {
  const [detail, setDetail] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, originX: 50, originY: 50 });
  const index = artworks.findIndex((item) => item.id === work.id);

  function chooseDetail(next: number) {
    setDetail(next);
    setZoom(work.details[next].scale);
    setOrigin({ x: work.details[next].x, y: work.details[next].y });
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (zoom <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = {
      x: event.clientX,
      y: event.clientY,
      originX: origin.x,
      originY: origin.y,
    };
    setDragging(true);
  }

  function pan(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging || zoom <= 1) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setOrigin({
      x: Math.max(
        0,
        Math.min(
          100,
          dragStart.current.originX -
            ((event.clientX - dragStart.current.x) / bounds.width) * 100,
        ),
      ),
      y: Math.max(
        0,
        Math.min(
          100,
          dragStart.current.originY -
            ((event.clientY - dragStart.current.y) / bounds.height) * 100,
        ),
      ),
    });
  }

  return (
    <div className="work-viewer">
      <div className="viewer-visual">
        <div
          className={`viewer-image ${zoom > 1 ? "is-zoomed" : ""} ${dragging ? "is-dragging" : ""}`}
          role="group"
          aria-label="Artwork image viewer"
          aria-describedby="viewer-help"
          tabIndex={0}
          onPointerDown={startDrag}
          onPointerMove={pan}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onKeyDown={(event) => {
            if (event.key === "+" || event.key === "=") {
              event.preventDefault();
              setZoom((value) => Math.min(3, value + 0.4));
            } else if (event.key === "-") {
              event.preventDefault();
              setZoom((value) => Math.max(1, value - 0.4));
            } else if (
              zoom > 1 &&
              ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(
                event.key,
              )
            ) {
              event.preventDefault();
              setOrigin((value) => ({
                x: Math.max(
                  0,
                  Math.min(
                    100,
                    value.x +
                      (event.key === "ArrowRight"
                        ? 5
                        : event.key === "ArrowLeft"
                          ? -5
                          : 0),
                  ),
                ),
                y: Math.max(
                  0,
                  Math.min(
                    100,
                    value.y +
                      (event.key === "ArrowDown"
                        ? 5
                        : event.key === "ArrowUp"
                          ? -5
                          : 0),
                  ),
                ),
              }));
            }
          }}
        >
          <img
            draggable={false}
            src={work.image}
            alt={work.alt}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
          />
        </div>
        <div className="viewer-controls">
          <span className="viewer-instruction" id="viewer-help">
            {zoom > 1
              ? "Drag or use arrow keys to explore"
              : "A closer look changes everything"}
          </span>
          <div className="zoom-controls">
            <button
              className="icon-button"
              disabled={zoom <= 1}
              onClick={() => setZoom((value) => Math.max(1, value - 0.4))}
              aria-label="Zoom out"
            >
              <PlusIcon minus />
            </button>
            <button
              className="zoom-reset"
              onClick={() => {
                setZoom(1);
                setOrigin({ x: 50, y: 50 });
              }}
              aria-label="Reset zoom"
            >
              <span aria-live="polite">{Math.round(zoom * 100)}%</span>
            </button>
            <button
              className="icon-button"
              disabled={zoom >= 3}
              onClick={() => setZoom((value) => Math.min(3, value + 0.4))}
              aria-label="Zoom in"
            >
              <PlusIcon />
            </button>
          </div>
        </div>
        <div className="detail-tabs" aria-label="Explore artwork details">
          {work.details.map((item, i) => (
            <button
              key={item.label}
              className={detail === i ? "active" : ""}
              aria-pressed={detail === i}
              onClick={() => chooseDetail(i)}
            >
              <span>0{i + 1}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="viewer-copy">
        <span className="eyebrow">
          {work.discipline} / {work.date}
        </span>
        <h2 id="dialog-title">{work.title}</h2>
        <p className="work-description">{work.description}</p>
        <dl className="work-facts">
          <div>
            <dt>Material</dt>
            <dd>{work.material}</dd>
          </div>
          <div>
            <dt>Place</dt>
            <dd>{work.location}</dd>
          </div>
        </dl>
        <div className="detail-story" aria-live="polite">
          <span className="eyebrow">A closer look</span>
          <AnimatePresence mode="wait">
            <motion.p
              key={detail}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {work.details[detail].text}
            </motion.p>
          </AnimatePresence>
        </div>
        {work.note && <p className="work-note">{work.note}</p>}
        <div className="viewer-navigation">
          <button
            className="text-link"
            onClick={() =>
              onSelect(
                artworks[(index - 1 + artworks.length) % artworks.length].id,
              )
            }
          >
            <Arrow direction="left" />
            Previous
          </button>
          <span>
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(artworks.length).padStart(2, "0")}
          </span>
          <button
            className="text-link"
            onClick={() => onSelect(artworks[(index + 1) % artworks.length].id)}
          >
            Next work
            <Arrow />
          </button>
        </div>
      </div>
    </div>
  );
}

function Credits() {
  return (
    <div className="credits-copy">
      <span className="eyebrow">About this atelier</span>
      <h2 id="dialog-title">
        A workshop
        <br />
        without walls.
      </h2>
      <p>
        This is an independent creative interpretation of a question: what might
        Michelangelo's personal website feel like if he were working today?
      </p>
      <p>
        It is not an official museum, archive, or artist estate. Historical
        masterpieces sit beside imagined studies to make a space for looking,
        exploring, and understanding the act of making.
      </p>
      <h3>The images</h3>
      <p>
        The portrait of David, the anatomical and architectural studies, and the
        unfinished figure are AI-created atmospheric interpretations. They are
        not archival photographs or authenticated works.
      </p>
      <p>
        <a
          href="https://commons.wikimedia.org/wiki/File:Michelangelo%27s_Pieta_5450_cut_out_black.jpg"
          target="_blank"
          rel="noreferrer"
        >
          Piet&agrave; photography
        </a>{" "}
        by Stanislav Traykov, background edit by Niabot. Licensed under{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/3.0/"
          target="_blank"
          rel="noreferrer"
        >
          CC BY-SA 3.0
        </a>
        . Displayed with a crop and tonal treatment; the adapted photograph
        retains that license.
      </p>
      <p>
        <a
          href="https://commons.wikimedia.org/wiki/File:Creation_of_Adam_(Michelangelo)_Detail.jpg"
          target="_blank"
          rel="noreferrer"
        >
          The Creation of Adam detail
        </a>{" "}
        is a public-domain reproduction, via Wikimedia Commons.
      </p>
      <h3>Made for a slower kind of looking</h3>
      <p>
        Sound is optional and synthesized in your browser. No tracking, no
        account, no interruptions. Keyboard navigation and reduced-motion
        preferences are supported throughout.
      </p>
      <span className="credits-signature">Ancora imparo.</span>
    </div>
  );
}
