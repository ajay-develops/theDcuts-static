import Head from "next/head";
import Link from "next/link";
import {useEffect, useMemo, useState} from "react";
import {gmailComposeUrl} from "../src/contact";
import {sanityClient} from "../src/sanity/client";
import {urlFor} from "../src/sanity/image";
import {HOME_QUERY} from "../src/sanity/queries";

const DEFAULT_PROJECTS = [
  {id: "930753990", title: "The universe exists within us", category: "Narrative", duration: "00:18", year: 2024, image: "/img/dev/930753990.webp"},
  {id: "930782402", title: "DILLI", category: "Motion", duration: "00:49", year: 2024, image: "/img/dev/930782402.webp"},
  {id: "930759603", title: "What Are We?", category: "Narrative", duration: "00:56", year: 2024, image: "/img/dev/930759603.webp"},
  {id: "930762054", title: "ZERO", category: "Motion", duration: "00:36", year: 2024, image: "/img/dev/930762054.webp"},
  {id: "930767160", title: "Teleport Effect", category: "VFX", duration: "00:15", year: 2024, image: "/img/dev/930767160.webp"},
  {id: "930769396", title: "Citizen's Thoughts", category: "Motion", duration: "00:09", year: 2024, image: "/img/dev/930769396.webp"},
  {id: "931046018", title: "Delhi Under the Smog", displayTitle: "Delhi\nUnder the Smog", category: "Documentary", duration: "04:47", year: 2024, image: "/img/dev/931046018.webp", summary: "A hard-edged visual story about a city struggling to breathe, built through atmosphere, pacing, and documentary detail."},
  {id: "931463872", title: "Different Delhi", category: "Travel", duration: "00:44", year: 2024, image: "/img/dev/931463872.webp"},
  {id: "930775010", title: "D.B. Cooper: Where Are You?", category: "Narrative", duration: "00:57", year: 2024, image: "/img/dev/930775010.webp"},
  {id: "934436545", title: "Creators United 2.0", category: "Motion", duration: "00:30", year: 2024, image: "/img/dev/934436545.webp"},
];

const DEFAULT_SERVICES = [
  {id: "video-editing", title: "Video editing", description: "Story structure, pacing, selects, and polished final cuts."},
  {id: "motion-graphics", title: "Motion graphics", description: "Titles, logo animation, kinetic typography, and transitions."},
  {id: "colour-finish", title: "Colour & finish", description: "Colour balance, sound polish, exports, and delivery formats."},
  {id: "visual-effects", title: "Visual effects", description: "Compositing, screen work, clean-up, and stylised effects."},
];

const DEFAULT_SITE = {
  name: "Devender Saroha",
  role: "Video Editor",
  location: "Punjab, India",
  seoTitle: "Devender Saroha — Video Editor",
  seoDescription: "Portfolio of Devender Saroha, a video editor crafting narrative films, motion graphics, documentaries, travel stories, and visual effects.",
  heroEyebrow: "Video editor · Punjab, India",
  heroTitle: "Stories cut\nto",
  heroEmphasis: "move.",
  heroIntroduction: "I'm Devender Saroha. I shape raw footage into films with rhythm, clarity, and a visual pulse.",
  primaryCtaLabel: "Watch selected work",
  availability: "Available for projects",
  portraitUrl: "/img/dev/portrait-hd.webp",
  workEyebrow: "Selected work",
  workTitle: "Ten cuts.\nOne point of view.",
  aboutLabel: "ABOUT / DEV",
  aboutTitle: "Every frame should earn its place.",
  aboutParagraphs: [
    "I'm a video editor focused on turning footage into clear, emotionally paced stories. My work moves between documentary, travel, narrative shorts, motion graphics, and visual effects.",
    "I bring a practical eye to every cut: find the idea, build the rhythm, and remove everything that gets in its way.",
  ],
  facts: [
    {value: "10", label: "Selected films"},
    {value: "5", label: "Editing disciplines"},
    {value: "2024", label: "Vimeo member since"},
  ],
  servicesEyebrow: "What I do",
  servicesTitle: "From first cut\nto final frame.",
  contactEyebrow: "Have footage. Need a story?",
  contactTitle: "Let's make\nthe cut.",
  contactCtaLabel: "Start a conversation",
  email: "davender350@gmail.com",
  socialLinks: [{label: "Vimeo", url: "https://vimeo.com/user217694996"}],
};

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
}

function PlayIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5V7Z" /></svg>;
}

function LineBreaks({text}) {
  return String(text || "").split("\n").map((line, index, lines) => (
    <span key={`${line}-${index}`}>{line}{index < lines.length - 1 && <br />}</span>
  ));
}

function sanityImage(source, width, height) {
  if (!source?.asset) return null;
  return urlFor(source).width(width).height(height).fit("crop").auto("format").url();
}

function mapProject(project) {
  const id = project?.vimeoId || project?.id;
  return {
    ...project,
    id,
    image: sanityImage(project?.thumbnail, 1400, 875) || project?.image || `/img/dev/${id}.webp`,
    imageAlt: project?.thumbnail?.alt || `Still from ${project?.title || "project"}`,
  };
}

export default function Home({cmsData}) {
  const cmsSite = cmsData?.site || {};
  const site = {
    ...DEFAULT_SITE,
    ...cmsSite,
    aboutParagraphs: cmsSite.aboutParagraphs?.length ? cmsSite.aboutParagraphs : DEFAULT_SITE.aboutParagraphs,
    facts: cmsSite.facts?.length ? cmsSite.facts : DEFAULT_SITE.facts,
    socialLinks: cmsSite.socialLinks?.length ? cmsSite.socialLinks : DEFAULT_SITE.socialLinks,
    portraitUrl: sanityImage(cmsSite.portrait, 1100, 1450) || DEFAULT_SITE.portraitUrl,
    shareImageUrl: sanityImage(cmsSite.shareImage, 1200, 630) || "https://the-dcuts-static.vercel.app/img/dev/portrait-hd.webp",
  };
  const projects = cmsData?.projects?.length ? cmsData.projects.map(mapProject) : DEFAULT_PROJECTS;
  const services = cmsData?.services?.length ? cmsData.services : DEFAULT_SERVICES;
  const featuredProject = cmsSite.featuredProject ? mapProject(cmsSite.featuredProject) : projects.find((project) => project.id === "931046018") || projects[0];
  const filters = useMemo(() => ["All", ...new Set(projects.map((project) => project.category).filter(Boolean))], [projects]);
  const [filter, setFilter] = useState("All");
  const [activeProject, setActiveProject] = useState(null);
  const visibleProjects = useMemo(
    () => filter === "All" ? projects : projects.filter((project) => project.category === filter),
    [filter, projects]
  );

  useEffect(() => {
    if (!filters.includes(filter)) setFilter("All");
  }, [filter, filters]);

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
        <title>{site.seoTitle}</title>
        <meta name="description" content={site.seoDescription} />
        <meta name="theme-color" content="#080808" />
        <meta property="og:title" content={site.seoTitle} />
        <meta property="og:description" content={site.seoDescription} />
        <meta property="og:image" content={site.shareImageUrl} />
        <meta property="og:image:alt" content={`${site.name} profile portrait`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <header className="site-header">
        <a className="brand" href="#top" aria-label={`${site.name} home`}>DEV<span>.</span></a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
        </nav>
        <Link className="header-cta" href="/start-a-project">Start a project</Link>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="hero-kicker">{site.heroEyebrow}</p>
            <h1 id="hero-title"><LineBreaks text={site.heroTitle} /> <em>{site.heroEmphasis}</em></h1>
            <p className="hero-intro">{site.heroIntroduction}</p>
            <div className="hero-actions">
              <a className="primary-button" href="#work">{site.primaryCtaLabel} <ArrowIcon /></a>
              <a className="text-link" href={gmailComposeUrl()} target="_blank" rel="noreferrer">{site.email}</a>
            </div>
          </div>

          <div className="hero-portrait">
            <div className="portrait-frame"><img src={site.portraitUrl} alt={cmsSite.portrait?.alt || site.name} /></div>
            <div className="vertical-word" aria-hidden="true">DEV</div>
            <div className="availability"><span /> {site.availability}</div>
          </div>

          {featuredProject && <a className="hero-reel" href="#featured">
            <span className="play-circle"><PlayIcon /></span>
            <span>Play featured film</span>
            <small>{featuredProject.duration}</small>
          </a>}
        </section>

        {featuredProject && <section className="featured" id="featured" aria-label="Featured film">
          <button className="featured-image" onClick={() => setActiveProject(featuredProject)} aria-label={`Play ${featuredProject.title}`}>
            <img src={featuredProject.image} alt={featuredProject.imageAlt || `Still from ${featuredProject.title}`} />
            <span className="featured-play"><PlayIcon /></span>
          </button>
          <div className="featured-copy">
            <p>Featured film</p>
            <h2><LineBreaks text={featuredProject.displayTitle || featuredProject.title} /></h2>
            <div className="featured-meta"><span>{featuredProject.category}</span><span>{featuredProject.duration}</span>{featuredProject.year && <span>{featuredProject.year}</span>}</div>
            {featuredProject.summary && <p className="featured-description">{featuredProject.summary}</p>}
            <button className="watch-button" onClick={() => setActiveProject(featuredProject)}>Watch film <ArrowIcon /></button>
          </div>
        </section>}

        <section className="work-section" id="work">
          <div className="section-heading">
            <p>{site.workEyebrow}</p>
            <h2><LineBreaks text={site.workTitle} /></h2>
          </div>

          <div className="filters" aria-label="Filter projects">
            {filters.map((item) => (
              <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)} aria-pressed={filter === item}>{item}</button>
            ))}
          </div>

          <div className="project-grid">
            {visibleProjects.map((project) => (
              <article className="project-card" key={project._id || project.id}>
                <button className="project-image" onClick={() => setActiveProject(project)} aria-label={`Play ${project.title}`}>
                  <img src={project.image} alt={project.imageAlt || `Still from ${project.title}`} />
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
          <div className="about-index">{site.aboutLabel}</div>
          <div className="about-copy">
            <h2>{site.aboutTitle}</h2>
            {site.aboutParagraphs.map((paragraph, index) => <p key={`${paragraph}-${index}`}>{paragraph}</p>)}
          </div>
          <div className="about-facts">
            {site.facts.map((fact, index) => <div key={fact._key || `${fact.label}-${index}`}><strong>{fact.value}</strong><span>{fact.label}</span></div>)}
          </div>
        </section>

        <section className="services-section" id="services">
          <div className="section-heading compact"><p>{site.servicesEyebrow}</p><h2><LineBreaks text={site.servicesTitle} /></h2></div>
          <div className="services-list">
            {services.map((service, index) => (
              <div className="service-row" key={service._id || service.id || service.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{service.title}</h3><p>{service.description}</p></div>
            ))}
          </div>
        </section>

        <section className="contact-section" id="contact">
          <p>{site.contactEyebrow}</p>
          <h2><LineBreaks text={site.contactTitle} /></h2>
          <Link href="/start-a-project">{site.contactCtaLabel} <ArrowIcon /></Link>
          <div className="contact-footer">
            <span>{site.name} · {site.role}</span>
            <span className="contact-socials">{site.socialLinks.map((link) => <a key={link._key || link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>)}</span>
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

export async function getStaticProps() {
  try {
    const cmsData = await sanityClient.fetch(HOME_QUERY);
    return {props: {cmsData}, revalidate: 60};
  } catch (error) {
    console.error("Sanity content fetch failed; using local portfolio fallback.", error);
    return {props: {cmsData: null}, revalidate: 30};
  }
}
