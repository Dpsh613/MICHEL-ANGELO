import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  direction?: "right" | "left" | "up" | "down" | "diagonal";
};

export function Arrow({ direction = "right", ...props }: IconProps) {
  const rotation = { right: 0, left: 180, up: -90, down: 90, diagonal: -45 }[
    direction
  ];
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <g transform={`rotate(${rotation} 12 12)`}>
        <path
          d="M4 12h15M13 5l7 7-7 7"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </g>
    </svg>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="10.5"
        cy="10.5"
        r="6.5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="m16 16 5 5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function PlusIcon({ minus = false }: { minus?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={minus ? "M4 10h12" : "M4 10h12M10 4v12"}
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}
