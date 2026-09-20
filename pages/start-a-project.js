import Head from 'next/head'
import Link from 'next/link'
import {useState} from 'react'
import {DEV_EMAIL, gmailComposeUrl} from '../src/contact'

const formId = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID
const formEndpoint = formId ? `https://formspree.io/f/${formId}` : ''
const gmailUrl = gmailComposeUrl({
  subject: 'Project inquiry for Devender Saroha',
  body: 'Hi Devender,\n\nI would like to discuss a video project.\n\nProject overview:\nTimeline:\nBudget range:\n\nThanks,',
})

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
}

export default function StartAProject() {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget

    if (!formEndpoint) {
      setStatus('error')
      setMessage('The form is being connected. Please use the Gmail option for now.')
      return
    }

    setStatus('sending')
    setMessage('')

    try {
      const response = await fetch(formEndpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: {Accept: 'application/json'},
      })

      if (!response.ok) throw new Error('Submission failed')

      form.reset()
      setStatus('success')
      setMessage('Thanks. Your project brief has been sent to Devender.')
    } catch {
      setStatus('error')
      setMessage('The form could not be sent. Please try again or open Gmail below.')
    }
  }

  return (
    <>
      <Head>
        <title>Start a project — Devender Saroha</title>
        <meta name="description" content="Tell video editor Devender Saroha about your film, campaign, motion graphics, or visual-effects project." />
        <meta property="og:title" content="Start a project — Devender Saroha" />
        <meta property="og:description" content="Share your project brief with video editor Devender Saroha." />
        <meta property="og:image" content="https://the-dcuts-static.vercel.app/img/dev/portrait-hd.webp" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <header className="site-header inquiry-header">
        <Link className="brand" href="/" aria-label="Devender Saroha home">DEV<span>.</span></Link>
        <nav aria-label="Primary navigation">
          <Link href="/#work">Work</Link>
          <Link href="/#about">About</Link>
          <Link href="/#services">Services</Link>
        </nav>
        <Link className="header-cta" href="/">Back to portfolio</Link>
      </header>

      <main className="inquiry-page">
        <section className="inquiry-intro" aria-labelledby="inquiry-title">
          <p>Start a project</p>
          <h1 id="inquiry-title">Tell me about<br />the <em>cut.</em></h1>
          <p className="inquiry-lede">Share the footage, goal, timeline, and budget you have in mind. A clear brief helps Devender reply with the right questions and next steps.</p>
        </section>

        <section className="inquiry-layout" aria-label="Project enquiry">
          <aside className="inquiry-aside">
            <p className="inquiry-label">Prefer email?</p>
            <h2>Open a ready-to-write message in Gmail.</h2>
            <a className="gmail-button" href={gmailUrl} target="_blank" rel="noreferrer">Compose in Gmail <ArrowIcon /></a>
            <p className="email-fallback">Not using Gmail? Copy <span>{DEV_EMAIL}</span> into your email app.</p>
            <div className="inquiry-expectation">
              <span>Useful details</span>
              <ul>
                <li>What you are making</li>
                <li>What footage already exists</li>
                <li>Target length and deadline</li>
                <li>Budget range and deliverables</li>
              </ul>
            </div>
          </aside>

          <form className="project-form" action={formEndpoint || undefined} method="POST" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                <span>Your name</span>
                <input type="text" name="name" autoComplete="name" required placeholder="Name" />
              </label>
              <label>
                <span>Email</span>
                <input type="email" name="email" autoComplete="email" required placeholder="you@company.com" />
              </label>
            </div>

            <div className="form-row">
              <label>
                <span>Company or brand <small>Optional</small></span>
                <input type="text" name="company" autoComplete="organization" placeholder="Company name" />
              </label>
              <label>
                <span>Project type</span>
                <select name="projectType" required defaultValue="">
                  <option value="" disabled>Select one</option>
                  <option>Video editing</option>
                  <option>Motion graphics</option>
                  <option>Colour and finish</option>
                  <option>Visual effects</option>
                  <option>Something else</option>
                </select>
              </label>
            </div>

            <div className="form-row">
              <label>
                <span>Timeline</span>
                <select name="timeline" required defaultValue="">
                  <option value="" disabled>Select one</option>
                  <option>Within 2 weeks</option>
                  <option>Within 1 month</option>
                  <option>1–3 months</option>
                  <option>Flexible</option>
                </select>
              </label>
              <label>
                <span>Budget range</span>
                <select name="budget" required defaultValue="">
                  <option value="" disabled>Select one</option>
                  <option>Under ₹25,000</option>
                  <option>₹25,000–₹50,000</option>
                  <option>₹50,000–₹1,00,000</option>
                  <option>₹1,00,000+</option>
                  <option>Let’s discuss</option>
                </select>
              </label>
            </div>

            <label>
              <span>Project brief</span>
              <textarea name="message" rows="7" required minLength="30" placeholder="Tell Devender about the story, footage, deliverables, references, and deadline." />
            </label>

            <label className="consent-field">
              <input type="checkbox" name="consent" value="yes" required />
              <span>I agree that Devender may use these details to reply to this project enquiry.</span>
            </label>

            <button className="form-submit" type="submit" disabled={status === 'sending' || !formEndpoint}>
              {status === 'sending' ? 'Sending…' : formEndpoint ? 'Send project brief' : 'Connect Formspree to enable'} <ArrowIcon />
            </button>

            {!formEndpoint && <p className="form-setup-note">Formspree connection pending. Gmail is available now.</p>}
            {message && <p className={`form-status ${status}`} role="status">{message}</p>}
          </form>
        </section>
      </main>
    </>
  )
}
