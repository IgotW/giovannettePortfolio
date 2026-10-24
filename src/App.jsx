import { useEffect, useMemo, useRef, useState } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  IconBrandAdobeIllustrator,
  IconBrandAdobePhotoshop,
  IconBrandFigma,
  IconPalette,
  IconPhotoSpark,
} from "@tabler/icons-react";
import "./App.css";
import profileImage from "./assets/profile.jpeg";
import descriptions from "./assets/data/description.js";
import clients from "./assets/data/clients.js";
import tools from "./assets/data/tools.js";

const imageModules = import.meta.glob("./assets/optimized/**/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
const thumbnailModules = import.meta.glob("./assets/thumbnails/**/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
});
const categoryMeta = {
  poster: { label: "Print & Social" },
  apparel: { label: "Apparel" },
  plaques: { label: "Recognition" },
  signage: { label: "Store Signage" },
  logo: { label: "Logo" },
  uiux: { label: "Web & Mobile" },
  commission: { label: "Commission" },
};
const makeTitle = (file) =>
  file
    .replace(/\.[^.]+$/, "")
    .replace(/ copy/gi, "")
    .replace(/\s*\(\d+\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
const projects = Object.entries(imageModules).map(([path, image], index) => {
  const parts = path.split("/");
  const category = parts.at(-2);
  const thumbnailPath = path.replace(
    "./assets/optimized/",
    "./assets/thumbnails/",
  );
  return {
    id: index,
    image,
    thumbnail: thumbnailModules[thumbnailPath] ?? image,
    category,
    title: makeTitle(parts.at(-1)),
    ...categoryMeta[category],
    description:
      descriptions[makeTitle(parts.at(-1))] || "Project description goes here.",
  };
});

const toolIcons = {
  photoshop: IconBrandAdobePhotoshop,
  illustrator: IconBrandAdobeIllustrator,
  freepik: IconPhotoSpark,
  canva: IconPalette,
  figma: IconBrandFigma,
};

function buildGalleryItems(projectList, clientNames) {
  // Figure out which projects belong to which client
  const groupsByClient = clientNames
    .map((name) => ({
      name,
      projects: projectList.filter((project) =>
        project.title.toLowerCase().includes(name.toLowerCase()),
      ),
    }))
    .filter((group) => group.projects.length > 1); // only real "multi" clients

  const groupedProjectIds = new Set(
    groupsByClient.flatMap((group) => group.projects.map((p) => p.id)),
  );

  const addedClientNames = new Set();
  const items = [];

  for (const project of projectList) {
    if (groupedProjectIds.has(project.id)) {
      const group = groupsByClient.find((g) =>
        g.projects.some((p) => p.id === project.id),
      );
      if (!addedClientNames.has(group.name)) {
        addedClientNames.add(group.name);
        items.push({ type: "client", key: `client-${group.name}`, group });
      }
      // skip pushing this project individually — it's inside the client card
    } else {
      items.push({ type: "project", key: `project-${project.id}`, project });
    }
  }

  return items;
}

function useScrollReveal(revision) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const elements = document.querySelectorAll(
      "[data-reveal]:not(.is-revealed)",
    );
    if (!elements.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [revision]);
}

function ProjectCard({ project, index, onClick }) {
  return (
    <button
      className="project-card"
      data-reveal
      style={{ "--reveal-delay": `${(index % 3) * 70}ms` }}
      onClick={onClick}
      aria-label={`View ${project.title}`}
    >
      <div className="project-image">
        <img
          src={project.thumbnail}
          alt=""
          loading="lazy"
          decoding="async"
          width="720"
          height="720"
        />
        <span className="view-project">
          <ArrowUpRight />
        </span>
      </div>
      <div className="project-info">
        <div>
          <p>{project.label}</p>
          <h3>{project.title}</h3>
          <p className="project-description">{project.description}</p>
        </div>
        <span className="project-number">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
    </button>
  );
}

function ToolCard({ tool, index }) {
  const Icon = toolIcons[tool.icon] ?? IconPalette;

  return (
    <article
      className="tool-card"
      data-reveal
      style={{
        "--tool-color": tool.color,
        "--reveal-delay": `${(index % 5) * 60}ms`,
      }}
    >
      <div className="tool-top">
        <span className="tool-mark" aria-hidden="true">
          <Icon size={26} stroke={1.5} />
        </span>
        <span className="tool-index">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div>
        <h3>{tool.name}</h3>
        <p>{tool.description}</p>
      </div>
      <ul className="tool-tags" aria-label={`Used for ${tool.usedFor.join(", ")}`}>
        {tool.usedFor.map((category) => (
          <li key={category}>{category}</li>
        ))}
      </ul>
    </article>
  );
}

function ProjectModal({ project, client, onClose, onBackToClient }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="modal-backdrop project-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="project-modal"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="close-modal"
          onClick={onClose}
          aria-label={client ? `Back to ${client.name}` : "Close project"}
          autoFocus
        >
          ×
        </button>

        <div className="project-modal-media">
          <img
            className={`modal-placeholder${imageLoaded ? " is-hidden" : ""}`}
            src={project.thumbnail}
            alt=""
            aria-hidden="true"
          />
          <img
            className={`modal-image${imageLoaded ? " is-loaded" : ""}`}
            src={project.image}
            alt={project.title}
            decoding="async"
            fetchPriority="high"
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        <div className="project-modal-detail">
          {client && <p className="project-modal-client">{client.name}</p>}
          <p className="eyebrow">{project.label}</p>
          <h3 id="project-modal-title">{project.title}</h3>
          <p className="project-modal-description">{project.description}</p>

          <div className="project-modal-meta">
            <div>
              <span>Category</span>
              <p>{project.label}</p>
            </div>
            {client && (
              <div>
                <span>Client</span>
                <p>{client.name}</p>
              </div>
            )}
          </div>

          {client && (
            <button className="modal-back-link" onClick={onBackToClient}>
              <span aria-hidden="true">←</span> Back to {client.name}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ClientModal({ client, onClose, onOpenProject }) {
  useScrollReveal(client.name);

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="client-modal"
        data-lenis-prevent
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="close-modal"
          onClick={onClose}
          aria-label={`Close ${client.name} projects`}
          autoFocus
        >
          ×
        </button>
        <div className="client-modal-header">
          <p className="eyebrow">Client collection</p>
          <h3 id="client-modal-title">{client.name}</h3>
          <p>
            {client.projects.length} selected project
            {client.projects.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="gallery client-modal-gallery">
          {client.projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              onClick={() => onOpenProject(project)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ArrowUpRight() {
  return (
    <span aria-hidden="true" className="arrow">
      ↗
    </span>
  );
}

function App() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const lenisRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    document.documentElement.classList.add("reveal-ready");

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.09,
      wheelMultiplier: 0.9,
      smoothWheel: true,
      anchors: { duration: 1.15 },
    });
    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove("reveal-ready");
    };
  }, []);

  const isModalOpen = Boolean(selectedProject || selectedClient);

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    lenisRef.current?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }
      if (selectedProject) {
        setSelectedProject(null);
      } else if (selectedClient) {
        setSelectedClient(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      lenisRef.current?.start();
    };
  }, [isModalOpen, selectedProject, selectedClient]);

  const visibleProjects = useMemo(
    () =>
      activeFilter === "all"
        ? projects
        : projects.filter((project) => project.category === activeFilter),
    [activeFilter],
  );

  const galleryItems = useMemo(
    () => buildGalleryItems(visibleProjects, clients),
    [visibleProjects],
  );

  useScrollReveal(galleryItems);

  const closeProject = () => setSelectedProject(null);

  return (
    <main>
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="wordmark" href="#home">
          G<span>V</span>
        </a>
        <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#tools">Tools</a>
          <a href="#about">About</a>
          <a className="nav-contact" href="#contact">
            Let’s talk <ArrowUpRight />
          </a>
        </div>
      </nav>

      <section className="hero shell" id="home">
        <p className="eyebrow" data-reveal>
          <span></span> Available for creative work
        </p>
        <div className="hero-grid">
          <div>
            <h1 data-reveal style={{ "--reveal-delay": "60ms" }}>
              Design that gives
              <br />
              <em>ideas a presence.</em>
            </h1>
            <p
              className="intro"
              data-reveal
              style={{ "--reveal-delay": "120ms" }}
            >
              I’m Giovannette Valle, a graphic designer creating thoughtful
              visuals for brands, events, and communities.
            </p>
            <a
              href="#work"
              className="button button-dark"
              data-reveal
              style={{ "--reveal-delay": "180ms" }}
            >
              Explore selected work <ArrowUpRight />
            </a>
          </div>
          <div className="hero-portrait-wrap" data-reveal>
            <div className="shape shape-one"></div>
            <div className="shape shape-two"></div>
            <img
              className="hero-portrait"
              src={profileImage}
              alt="Giovannette Valle"
              width="290"
              height="344"
              fetchPriority="high"
            />
            <p className="portrait-note">
              Graphic
              <br />
              Designer
            </p>
          </div>
        </div>
        <div className="scroll-note" data-reveal>
          Scroll to discover <span>↓</span>
        </div>
      </section>

      <section className="work-section" id="work">
        <div className="shell section-heading">
          <div data-reveal>
            <p className="eyebrow">Selected projects</p>
            <h2>
              A selection of
              <br />
              recent <em>work.</em>
            </h2>
          </div>
          <p className="section-copy" data-reveal>
            From bold event collateral to apparel and social campaigns, each
            project is designed to connect, communicate, and stand out.
          </p>
        </div>
        <div
          className="shell filters"
          role="tablist"
          aria-label="Project categories"
          data-reveal
        >
          {[
            ["all", "All work"],
            ["poster", "Print & Social"],
            ["apparel", "Apparel"],
            ["plaques", "Recognition"],
            ["logo", "Logo"],
            ["uiux", "Web & Mobile"],
            ["commission", "Commission"],
            ["signage", "Store Signage"],
          ].map(([value, label]) => (
            <button
              key={value}
              className={activeFilter === value ? "active" : ""}
              onClick={() => setActiveFilter(value)}
              role="tab"
              aria-selected={activeFilter === value}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="gallery shell">
          {galleryItems.map((item, index) =>
            item.type === "client" ? (
              <button
                key={item.key}
                className="project-card client-card-inline"
                data-reveal
                style={{ "--reveal-delay": `${(index % 3) * 70}ms` }}
                onClick={() => setSelectedClient(item.group)}
                aria-label={`View ${item.group.name} projects`}
              >
                <div className="project-image">
                  <img
                    src={item.group.projects[0].thumbnail}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width="720"
                    height="720"
                  />
                  <span className="client-count-badge">
                    {item.group.projects.length} projects
                  </span>
                  <span className="view-project">
                    <ArrowUpRight />
                  </span>
                </div>
                <div className="project-info">
                  <div>
                    <p>Client</p>
                    <h3>{item.group.name}</h3>
                    <p className="project-description">
                      View all {item.group.projects.length} projects for{" "}
                      {item.group.name}.
                    </p>
                  </div>
                  <span className="project-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
              </button>
            ) : (
              <ProjectCard
                key={item.key}
                project={item.project}
                index={index}
                onClick={() => setSelectedProject(item.project)}
              />
            ),
          )}
        </div>
      </section>

      <section className="tools-section" id="tools">
        <div className="shell">
          <div className="tools-heading">
            <div data-reveal>
              <p className="eyebrow">Tools & process</p>
              <h2>
                The toolkit behind
                <br />
                every <em>project.</em>
              </h2>
            </div>
            <p className="section-copy" data-reveal>
              Every brief calls for a different approach. These are the tools I
              reach for to take an idea from first sketch to finished artwork.
            </p>
          </div>
          <div className="tools-grid">
            {tools.map((tool, index) => (
              <ToolCard key={tool.name} tool={tool} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="about shell" id="about">
        <div className="about-label" data-reveal>
          <p className="eyebrow">About & experience</p>
        </div>
        <div className="about-content" data-reveal>
          <h2>
            Making meaningful design
            <br />
            feel <em>effortless.</em>
          </h2>
          <p>
            I bring a clear visual point of view and a practical, collaborative
            approach to every brief. My work is shaped by detail, purpose, and a
            love for strong ideas.
          </p>
          <div className="experience">
            <p className="experience-label">Experience</p>
            <div className="experience-row">
              <span>Jul 2025 — May 2026</span>
              <div>
                <h3>Graphic Designer Intern</h3>
                <p>Kulas Design</p>
              </div>
            </div>
            <div className="experience-row">
              <span>Jun 2026 — Present</span>
              <div>
                <h3>Graphic Designer</h3>
                <p>Kulas Design · Continued after internship</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer id="contact">
        <div className="shell footer-content" data-reveal>
          <p className="eyebrow light">Have a project in mind?</p>
          <h2>
            Let’s make something
            <br />
            <em>memorable.</em>
          </h2>
          <a className="email-link" href="mailto:Giovannettevalle311@gmail.com">
            Giovannettevalle311@gmail.com <ArrowUpRight />
          </a>
          <div className="footer-bottom">
            <span>© 2026 Giovannette Valle</span>
            <a href="#home">Back to top ↑</a>
          </div>
        </div>
      </footer>

      {selectedClient && (
        <ClientModal
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          onOpenProject={(project) => setSelectedProject(project)}
        />
      )}

      {selectedProject && (
        <ProjectModal
          key={selectedProject.id}
          project={selectedProject}
          client={selectedClient}
          onClose={closeProject}
          onBackToClient={closeProject}
        />
      )}
    </main>
  );
}
export default App;
