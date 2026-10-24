import { useEffect, useMemo, useState } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./App.css";
import profileImage from "./assets/profile.jpeg";
import descriptions from "./assets/data/description.js";
import clients from "./assets/data/clients.js";

const imageModules = import.meta.glob("./assets/images/**/*.{png,jpg,jpeg}", {
  eager: true,
  query: "?url",
  import: "default",
});
const thumbnailModules = import.meta.glob("./assets/thumbnails/**/*.jpg", {
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
  const thumbnailPath = path
    .replace("./assets/images/", "./assets/thumbnails/")
    .replace(/\.(png|jpe?g)$/i, ".jpg");
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

function ProjectCard({ project, index, onClick }) {
  return (
    <button
      className="project-card"
      onClick={onClick}
      aria-label={`View ${project.title}`}
    >
      <div className="project-image">
        <img src={project.thumbnail} alt="" loading="lazy" decoding="async" />
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

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.1,
      wheelMultiplier: 0.9,
      anchors: { duration: 1.1 },
    });

    return () => lenis.destroy();
  }, []);

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

  return (
    <main>
      <nav className="nav shell" aria-label="Primary navigation">
        <a className="wordmark" href="#home">
          G<span>V</span>
        </a>
        <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a className="nav-contact" href="#contact">
            Let’s talk <ArrowUpRight />
          </a>
        </div>
      </nav>

      <section className="hero shell" id="home">
        <p className="eyebrow">
          <span></span> Available for creative work
        </p>
        <div className="hero-grid">
          <div>
            <h1>
              Design that gives
              <br />
              <em>ideas a presence.</em>
            </h1>
            <p className="intro">
              I’m Giovannette Valle, a graphic designer creating thoughtful
              visuals for brands, events, and communities.
            </p>
            <a href="#work" className="button button-dark">
              Explore selected work <ArrowUpRight />
            </a>
          </div>
          <div className="hero-portrait-wrap">
            <div className="shape shape-one"></div>
            <div className="shape shape-two"></div>
            <img
              className="hero-portrait"
              src={profileImage}
              alt="Giovannette Valle"
            />
            <p className="portrait-note">
              Graphic
              <br />
              Designer
            </p>
          </div>
        </div>
        <div className="scroll-note">
          Scroll to discover <span>↓</span>
        </div>
      </section>

      <section className="work-section" id="work">
        <div className="shell section-heading">
          <div>
            <p className="eyebrow">Selected projects</p>
            <h2>
              A selection of
              <br />
              recent <em>work.</em>
            </h2>
          </div>
          <p className="section-copy">
            From bold event collateral to apparel and social campaigns, each
            project is designed to connect, communicate, and stand out.
          </p>
        </div>
        <div
          className="shell filters"
          role="tablist"
          aria-label="Project categories"
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
                onClick={() => setSelectedClient(item.group)}
                aria-label={`View ${item.group.name} projects`}
              >
                <div className="project-image">
                  <img
                    src={item.group.projects[0].thumbnail}
                    alt=""
                    loading="lazy"
                    decoding="async"
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

      <section className="about shell" id="about">
        <div className="about-label">
          <p className="eyebrow">About & experience</p>
        </div>
        <div className="about-content">
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
        <div className="shell footer-content">
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

      {selectedProject && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="project-modal"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label={selectedProject.title}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-modal"
              onClick={() => setSelectedProject(null)}
              aria-label="Close project"
            >
              ×
            </button>
            <img src={selectedProject.image} alt={selectedProject.title} />
            <div>
              <p>{selectedProject.label}</p>
              <h3>{selectedProject.title}</h3>
            </div>
          </div>
        </div>
      )}

      {selectedClient && (
        <div
          className="modal-backdrop"
          role="presentation"
          onClick={() => setSelectedClient(null)}
        >
          <div
            className="client-modal"
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label={selectedClient.name}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-modal"
              onClick={() => setSelectedClient(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className="client-modal-header">
              <p className="eyebrow">Client</p>
              <h3>{selectedClient.name}</h3>
            </div>
            <div className="gallery client-modal-gallery">
              {selectedClient.projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onClick={() => {
                    setSelectedProject(project);
                    setSelectedClient(null);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
export default App;
