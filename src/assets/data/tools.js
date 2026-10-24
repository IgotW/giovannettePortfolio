// The tools used across different kinds of projects. Each entry's `usedFor`
// lists the project categories (matching the gallery filters) it supports.
// `icon` maps to a Tabler icon in App.jsx.
const tools = [
  {
    name: "Adobe Photoshop",
    icon: "photoshop",
    color: "#31a8ff",
    description:
      "Photo editing, compositing, and print-ready mockups that give finished artwork a polished, professional feel.",
    usedFor: ["Print & Social", "Signage", "Commission"],
  },
  {
    name: "Adobe Illustrator",
    icon: "illustrator",
    color: "#ff9a00",
    description:
      "Vector logos, custom lettering, and production files built to stay crisp at any size, from patches to billboards.",
    usedFor: ["Logo", "Apparel", "Recognition", "Signage"],
  },
  {
    name: "Freepik",
    icon: "freepik",
    color: "#1273eb",
    description:
      "Curated mockups, textures, and reference visuals that add depth, context, and speed to early concepts.",
    usedFor: ["Print & Social", "Commission"],
  },
  {
    name: "Canva",
    icon: "canva",
    color: "#00a8b5",
    description:
      "Fast, flexible layouts for social posts, certificates, and everyday event collateral that needs to ship quickly.",
    usedFor: ["Print & Social", "Recognition"],
  },
  {
    name: "Figma",
    icon: "figma",
    color: "#f24e1e",
    description:
      "Interface design, responsive layouts, and clickable prototypes for web and mobile experiences.",
    usedFor: ["Web & Mobile"],
  },
];

export default tools;
