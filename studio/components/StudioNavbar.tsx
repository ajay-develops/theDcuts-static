import type {NavbarProps} from 'sanity'
import styled from 'styled-components'

const LIVE_WEBSITE_URL = 'https://the-dcuts-static.vercel.app/'

const NavbarShell = styled.div`
  display: flex;
  min-width: 0;
`

const DefaultNavbar = styled.div`
  flex: 1;
  min-width: 0;
`

const WebsiteLink = styled.a`
  align-items: center;
  border-left: 1px solid var(--card-border-color);
  color: inherit;
  display: inline-flex;
  flex: none;
  font-size: 0.8125rem;
  font-weight: 600;
  gap: 0.4rem;
  padding: 0 1rem;
  text-decoration: none;
  transition:
    background-color 150ms ease,
    color 150ms ease;
  white-space: nowrap;

  &:hover,
  &:focus-visible {
    background: var(--card-bg2-color);
  }

  &:focus-visible {
    outline: 2px solid var(--card-focus-ring-color);
    outline-offset: -3px;
  }

  @media (max-width: 600px) {
    padding: 0 0.75rem;
  }
`

export function StudioNavbar(props: NavbarProps) {
  return (
    <NavbarShell>
      <DefaultNavbar>{props.renderDefault(props)}</DefaultNavbar>
      <WebsiteLink
        aria-label="View the live portfolio website in a new tab"
        href={LIVE_WEBSITE_URL}
        rel="noreferrer"
        target="_blank"
      >
        View website <span aria-hidden="true">↗</span>
      </WebsiteLink>
    </NavbarShell>
  )
}
