export type Discipline = "Sculpture" | "Painting" | "Architecture" | "Drawing";

export type Artwork = {
  id: string;
  title: string;
  date: string;
  discipline: Discipline;
  material: string;
  location: string;
  image: string;
  alt: string;
  description: string;
  note?: string;
  details: {
    label: string;
    text: string;
    x: number;
    y: number;
    scale: number;
  }[];
};

export const artworks: Artwork[] = [
  {
    id: "david",
    title: "David",
    date: "1501 - 1504",
    discipline: "Sculpture",
    material: "Carrara marble",
    location: "Galleria dell'Accademia, Florence",
    image: "./images/david-detail.webp",
    alt: "A dramatically lit detail of David's marble face and curling hair",
    description:
      "Not the victory, but the moment before it. A single block of marble becomes a study in suspended action: the body still, the mind already moving.",
    note: "Atmospheric interpretation of the original sculpture, shown in detail.",
    details: [
      {
        label: "The portrait",
        text: "At more than five metres tall, David turns the human figure into an architectural presence. This portrait brings that monumental scale within reach.",
        x: 50,
        y: 50,
        scale: 1,
      },
      {
        label: "The gaze",
        text: "The knitted brow and watchful eyes hold the whole story. Michelangelo chooses anticipation over triumph, making thought itself visible.",
        x: 43,
        y: 35,
        scale: 2.1,
      },
      {
        label: "The surface",
        text: "Deeply cut curls catch the light against the calm planes of the face. Stone alternates between shadow, texture, and the illusion of living skin.",
        x: 61,
        y: 14,
        scale: 2.4,
      },
    ],
  },
  {
    id: "pieta",
    title: "Piet\u00e0",
    date: "1498 - 1499",
    discipline: "Sculpture",
    material: "Carrara marble",
    location: "St. Peter's Basilica, Vatican City",
    image: "./images/pieta.webp",
    alt: "The Pieta, Mary holding the body of Christ, in luminous white marble",
    description:
      "Grief, without a cry. The weight of a body rests within a mountain of folds, while the marble is worked to a softness that seems to deny its own nature.",
    details: [
      {
        label: "The whole",
        text: "The figures form a quiet pyramid. Its broad base gives stability to an encounter of extraordinary emotional tenderness.",
        x: 50,
        y: 50,
        scale: 1,
      },
      {
        label: "The gesture",
        text: "Mary's open left hand asks a question without insisting on an answer. It is a small gesture that opens the sculpture toward the viewer.",
        x: 76,
        y: 44,
        scale: 2.3,
      },
      {
        label: "The drapery",
        text: "The folds of the robe are more than decoration. They support the body, conceal the scale of the seated figure, and carry light deep into the stone.",
        x: 47,
        y: 74,
        scale: 2,
      },
    ],
  },
  {
    id: "creation",
    title: "The Creation of Adam",
    date: "c. 1512",
    discipline: "Painting",
    material: "Fresco on plaster",
    location: "Sistine Chapel, Vatican City",
    image: "./images/creation.webp",
    alt: "Detail of two outstretched hands almost touching in The Creation of Adam",
    description:
      "Everything happens in the space between. Two hands, a breath of plaster, and an interval that has held the world in suspense for five centuries.",
    details: [
      {
        label: "The encounter",
        text: "The reaching arms turn an immense theological idea into something immediate and human. This is a detail from the Sistine Chapel ceiling.",
        x: 50,
        y: 50,
        scale: 1,
      },
      {
        label: "The interval",
        text: "The fingers do not meet. That small distance is the composition's greatest force: the entire image seems to wait for it to disappear.",
        x: 51,
        y: 43,
        scale: 2.6,
      },
      {
        label: "The hand",
        text: "Adam's relaxed wrist contrasts with the purposeful reach of the other hand. Life is expressed not through spectacle, but through the smallest shift of tension.",
        x: 27,
        y: 51,
        scale: 2,
      },
    ],
  },
  {
    id: "architecture",
    title: "A dome for the sky",
    date: "1546 - 1564",
    discipline: "Architecture",
    material: "Architectural study",
    location: "St. Peter's Basilica, Vatican City",
    image: "./images/architecture.webp",
    alt: "An ink and graphite interpretation of the dome and plan of St. Peter's Basilica",
    description:
      "A building, like a body, must carry its weight with grace. The dome draws mass upward, gathering a complex structure into one clear and monumental gesture.",
    note: "An imagined study inspired by Michelangelo's design for St. Peter's, not an archival drawing.",
    details: [
      {
        label: "The design",
        text: "Michelangelo took charge of St. Peter's in 1546. He simplified the plan and gave its central dome an extraordinary sculptural unity.",
        x: 50,
        y: 50,
        scale: 1,
      },
      {
        label: "The dome",
        text: "The double-shell construction balances structural purpose with silhouette. The dome was completed after Michelangelo's death, with alterations to its profile.",
        x: 66,
        y: 33,
        scale: 2.1,
      },
      {
        label: "The geometry",
        text: "Circle, axis, proportion. Architectural drawing makes a conversation between a human hand and a space too large for any one person to hold.",
        x: 25,
        y: 73,
        scale: 2.1,
      },
    ],
  },
  {
    id: "study",
    title: "The intelligence of the hand",
    date: "An imagined study",
    discipline: "Drawing",
    material: "Sanguine on paper",
    location: "The drawing table",
    image: "./images/studies.webp",
    alt: "Renaissance-inspired sanguine studies of hands and muscular forearms on ivory parchment",
    description:
      "Before the first cut, a thousand acts of looking. A line follows the pull of a tendon, a joint, the delicate architecture of the hand.",
    note: "A contemporary interpretation of Michelangelo's drawing practice, not an archival drawing.",
    details: [
      {
        label: "The sheet",
        text: "Disegno means both drawing and design. It is the place where observation becomes an idea, and an idea begins to acquire a body.",
        x: 50,
        y: 50,
        scale: 1,
      },
      {
        label: "The anatomy",
        text: "Muscle and tendon are studied as systems of movement. The goal is not simply to copy an outline, but to understand the forces beneath it.",
        x: 60,
        y: 42,
        scale: 2.1,
      },
      {
        label: "The line",
        text: "Repeated contours leave thought visible on the page. A drawing can hold several possibilities at once, long before marble demands a decision.",
        x: 32,
        y: 64,
        scale: 2,
      },
    ],
  },
  {
    id: "unfinished",
    title: "Between stone and life",
    date: "A study in non-finito",
    discipline: "Sculpture",
    material: "Unfinished marble",
    location: "The stone room",
    image: "./images/non-finito.webp",
    alt: "An unfinished muscular figure emerging from a roughly chiseled block of marble",
    description:
      "Some figures never fully leave the stone. In the unfinished, the act of making remains alive: raw matter and emerging form exist together, without resolution.",
    note: "An imagined sculpture inspired by Michelangelo's unfinished Prisoners, not an original work.",
    details: [
      {
        label: "The becoming",
        text: "Non-finito means unfinished. Whether a work was abandoned or deliberately left unresolved, its visible making offers an unusually intimate encounter with the artist.",
        x: 50,
        y: 50,
        scale: 1,
      },
      {
        label: "The figure",
        text: "Polished anatomy emerges directly from the block. The contrast makes the body feel less like something added to the stone than something discovered within it.",
        x: 46,
        y: 44,
        scale: 2,
      },
      {
        label: "The chisel",
        text: "Every rough mark is a record of a decision. These surfaces preserve a rhythm of labor that a perfectly finished sculpture would erase.",
        x: 70,
        y: 67,
        scale: 2.3,
      },
    ],
  },
];

export const processSteps = [
  {
    number: "I",
    title: "Understand the body",
    description:
      "To draw a hand is to understand a world. Every tendon, every weight, every possible movement. First, learn to see.",
    caption: "The body as architecture",
    workId: "study",
    image: "./images/studies.webp",
  },
  {
    number: "II",
    title: "Think beyond the figure",
    description:
      "The same laws govern a shoulder and a dome. Proportion gives the idea its structure. Imagination gives it a reason to exist.",
    caption: "A geometry of the extraordinary",
    workId: "architecture",
    image: "./images/architecture.webp",
  },
  {
    number: "III",
    title: "Listen to the material",
    description:
      "The block is not empty. Follow its resistance. Remove only what is necessary, and know when to leave a question unanswered.",
    caption: "The eloquence of the unfinished",
    workId: "unfinished",
    image: "./images/non-finito.webp",
  },
];
