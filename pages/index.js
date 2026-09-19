import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

const projects = [
  { id: "930753990", title: "The universe exists within us", category: "Narrative", duration: "00:18", image: "/img/dev/930753990.webp" },
  { id: "930782402", title: "DILLI", category: "Motion", duration: "00:49", image: "/img/dev/930782402.webp" },
  { id: "930759603", title: "What Are We?", category: "Narrative", duration: "00:56", image: "/img/dev/930759603.webp" },
  { id: "930762054", title: "ZERO", category: "Motion", duration: "00:36", image: "/img/dev/930762054.webp" },
  { id: "930767160", title: "Teleport Effect", category: "VFX", duration: "00:15", image: "/img/dev/930767160.webp" },
  { id: "930769396", title: "Citizen's Thoughts", category: "Motion", duration: "00:09", image: "/img/dev/930769396.webp" },
  { id: "931046018", title: "Delhi Under the Smog", category: "Documentary", duration: "04:47", image: "/img/dev/931046018.webp" },
  { id: "931463872", title: "Different Delhi", category: "Travel", duration: "00:44", image: "/img/dev/931463872.webp" },
  { id: "930775010", title: "D.B. Cooper: Where Are You?", category: "Narrative", duration: "00:57", image: "/img/dev/930775010.webp" },
  { id: "934436545", title: "Creators United 2.0", category: "Motion", duration: "00:30", image: "/img/dev/934436545.webp" },
];

const filters = ["All", "Narrative", "Motion", "Documentary", "Travel", "VFX"];

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
}

function PlayIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5V7Z" /></svg>;
}

export default function Home() {
  const [filter, setFilter] = useState("All");
  const [activeProject, setActiveProject] = useState(null);
  const visibleProjects = useMemo(
    () => filter === "All" ? projects : projects.filter((project) => project.category === filter),
    [filter]
  );

  useEffect(() => {
    if (!activeProject) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setActiveProject(null);
    };
    document.body.classList.add("modal-open");
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeProject]);

  return (
    <>
      <Head>
        <title>Devender Saroha — Video Editor</title>
        <meta name="description" content="Portfolio of Devender Saroha, a video editor crafting narrative films, motion graphics, documentaries, travel stories, and visual effects." />
        <meta name="theme-color" content="#080808" />
        <meta property="og:title" content="Devender Saroha — Video Editor" />
        <meta property="og:description" content="Editing stories frame by frame — selected work by Devender Saroha." />
        <meta property="og:image" content="/img/dev/930782402.webp" />
      </Head>

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Devender Saroha home">DEV<span>.</span></a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
        </nav>
        <a className="header-cta" href="mailto:davender350@gmail.com">Start a project</a>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="hero-kicker">Video editor · Punjab, India</p>
            <h1 id="hero-title">Stories cut<br />to <em>move.</em></h1>
            <p className="hero-intro">I&apos;m Devender Saroha. I shape raw footage into films with rhythm, clarity, and a visual pulse.</p>
            <div className="hero-actions">
              <a className="primary-button" href="#work">Watch selected work <ArrowIcon /></a>
              <a className="text-link" href="mailto:davender350@gmail.com">davender350@gmail.com</a>
            </div>
          </div>

          <div className="hero-portrait">
            <div className="portrait-frame"><img src="/img/dev/portrait-hd.webp" alt="Devender Saroha" /></div>
            <div className="vertical-word" aria-hidden="true">DEV</div>
            <div className="availability"><span /> Available for projects</div>
          </div>

          <a className="hero-reel" href="#featured">
            <span className="play-circle"><PlayIcon /></span>
            <span>Play featured film</span>
            <small>04:47</small>
          </a>
        </section>

        <section className="featured" id="featured" aria-label="Featured film">
          <button className="featured-image" onClick={() => setActiveProject(projects[6])} aria-label="Play Delhi Under the Smog">
            <img src="/img/dev/931046018.webp" alt="Still from Delhi Under the Smog" />
            <span className="featured-play"><PlayIcon /></span>
          </button>
          <div className="featured-copy">
            <p>Featured film</p>
            <h2>Delhi<br />Under the Smog</h2>
            <div className="featured-meta"><span>Documentary</span><span>04:47</span><span>2024</span></div>
            <p className="featured-description">A hard-edged visual story about a city struggling to breathe, built through atmosphere, pacing, and documentary detail.</p>
            <button className="watch-button" onClick={() => setActiveProject(projects[6])}>Watch film <ArrowIcon /></button>
          </div>
        </section>

        <section className="work-section" id="work">
          <div className="section-heading">
            <p>Selected work</p>
            <h2>Ten cuts.<br />One point of view.</h2>
          </div>

          <div className="filters" aria-label="Filter projects">
            {filters.map((item) => (
              <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>
            ))}
          </div>

          <div className="project-grid">
            {visibleProjects.map((project) => (
              <article className="project-card" key={project.id}>
                <button className="project-image" onClick={() => setActiveProject(project)} aria-label={`Play ${project.title}`}>
                  <img src={project.image} alt={`Still from ${project.title}`} />
                  <span className="project-play"><PlayIcon /></span>
                </button>
                <div className="project-info">
                  <div><p>{project.category}</p><h3>{project.title}</h3></div>
                  <span>{project.duration}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="about-index">ABOUT / DEV</div>
          <div className="about-copy">
            <h2>Every frame should earn its place.</h2>
            <p>I&apos;m a video editor focused on turning footage into clear, emotionally paced stories. My work moves between documentary, travel, narrative shorts, motion graphics, and visual effects.</p>
            <p>I bring a practical eye to every cut: find the idea, build the rhythm, and remove everything that gets in its way.</p>
          </div>
          <div className="about-facts">
            <div><strong>10</strong><span>Selected films</span></div>
            <div><strong>5</strong><span>Editing disciplines</span></div>
            <div><strong>2024</strong><span>Vimeo member since</span></div>
          </div>
        </section>

        <section className="services-section" id="services">
          <div className="section-heading compact"><p>What I do</p><h2>From first cut<br />to final frame.</h2></div>
          <div className="services-list">
            {[
              ["01", "Video editing", "Story structure, pacing, selects, and polished final cuts."],
              ["02", "Motion graphics", "Titles, logo animation, kinetic typography, and transitions."],
              ["03", "Colour & finish", "Colour balance, sound polish, exports, and delivery formats."],
              ["04", "Visual effects", "Compositing, screen work, clean-up, and stylised effects."],
            ].map(([number, title, description]) => (
              <div className="service-row" key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></div>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact">
          <p>Have footage. Need a story?</p>
          <h2>Let&apos;s make<br />the cut.</h2>
          <a href="mailto:davender350@gmail.com">Start a conversation <ArrowIcon /></a>
          <div className="contact-footer">
            <span>Devender Saroha · Video Editor</span>
            <a href="https://vimeo.com/user217694996" target="_blank" rel="noreferrer">Vimeo</a>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </section>
      </main>

      {activeProject && (
        <div className="video-modal" role="dialog" aria-modal="true" aria-label={activeProject.title}>
          <button className="modal-backdrop" onClick={() => setActiveProject(null)} aria-label="Close video" />
          <div className="modal-content">
            <div className="modal-topbar">
              <div><span>{activeProject.category}</span><strong>{activeProject.title}</strong></div>
              <button onClick={() => setActiveProject(null)} aria-label="Close video">Close</button>
            </div>
            <div className="video-frame">
              <iframe src={`https://player.vimeo.com/video/${activeProject.id}?autoplay=1&title=0&byline=0&portrait=0`} title={activeProject.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
