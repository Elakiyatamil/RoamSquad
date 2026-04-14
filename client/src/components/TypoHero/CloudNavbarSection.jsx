import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './CloudNavbarSection.css'

export default function CloudNavbarSection() {
  const location = useLocation()
  const nav = [
    { to: '/', label: 'Discover' },
    { to: '/planner', label: 'Planner' },
    { to: '/packages', label: 'Packages' },
    { to: '/events', label: 'Events' },
    { to: '/wishlist', label: 'Wishlist' },
    { to: '/my-trips', label: 'My Trips' },
  ]

  return (
    <section className="cloud-nav" aria-label="RoamSquad cloud navigation">
      <div className="cloud-wrapper">
        <div className="cloud-transition">
          <svg className="cloud-layer cloud-layer-1" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true">
            <g fill="#0a1628">
              <circle cx="88" cy="178" r="92" className="cloud-soft" />
              <circle cx="248" cy="152" r="108" />
              <circle cx="404" cy="186" r="76" />
              <circle cx="598" cy="160" r="116" className="cloud-soft" />
              <circle cx="762" cy="192" r="82" />
              <circle cx="962" cy="154" r="118" />
              <circle cx="1128" cy="190" r="74" className="cloud-soft" />
              <circle cx="1326" cy="166" r="104" />
              <circle cx="520" cy="138" r="30" />
              <circle cx="1016" cy="138" r="24" />
              <circle cx="1240" cy="146" r="28" />
              <rect x="0" y="190" width="1440" height="140" />
            </g>
          </svg>
          <svg className="cloud-layer cloud-layer-2" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true">
            <g fill="#0f2d55">
              <circle cx="62" cy="170" r="84" className="cloud-soft" />
              <circle cx="214" cy="146" r="102" />
              <circle cx="352" cy="184" r="72" />
              <circle cx="546" cy="156" r="114" className="cloud-soft" />
              <circle cx="724" cy="186" r="78" />
              <circle cx="902" cy="150" r="110" />
              <circle cx="1078" cy="188" r="84" />
              <circle cx="1238" cy="154" r="112" className="cloud-soft" />
              <circle cx="1412" cy="182" r="88" />
              <circle cx="438" cy="140" r="26" />
              <circle cx="812" cy="138" r="32" />
              <circle cx="1286" cy="140" r="22" />
              <rect x="0" y="188" width="1440" height="140" />
            </g>
          </svg>
          <svg className="cloud-layer cloud-layer-3" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true">
            <g fill="#153d72">
              <circle cx="82" cy="164" r="78" className="cloud-soft" />
              <circle cx="192" cy="134" r="100" />
              <circle cx="348" cy="170" r="68" />
              <circle cx="492" cy="142" r="108" />
              <circle cx="676" cy="174" r="82" className="cloud-soft" />
              <circle cx="842" cy="140" r="104" />
              <circle cx="1014" cy="176" r="76" />
              <circle cx="1180" cy="146" r="110" />
              <circle cx="1334" cy="172" r="84" className="cloud-soft" />
              <circle cx="286" cy="150" r="28" />
              <circle cx="942" cy="148" r="22" />
              <rect x="0" y="186" width="1440" height="140" />
            </g>
          </svg>
          <svg className="cloud-layer cloud-layer-4" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true">
            <g fill="#1a4f91">
              <circle cx="72" cy="160" r="74" />
              <circle cx="206" cy="128" r="98" className="cloud-soft" />
              <circle cx="332" cy="166" r="70" />
              <circle cx="488" cy="136" r="106" />
              <circle cx="652" cy="168" r="80" />
              <circle cx="826" cy="132" r="110" className="cloud-soft" />
              <circle cx="980" cy="170" r="78" />
              <circle cx="1136" cy="138" r="104" />
              <circle cx="1292" cy="172" r="86" />
              <circle cx="1418" cy="142" r="96" className="cloud-soft" />
              <circle cx="562" cy="146" r="30" />
              <circle cx="1238" cy="148" r="24" />
              <rect x="0" y="186" width="1440" height="140" />
            </g>
          </svg>
          <svg className="cloud-layer cloud-layer-5" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true">
            <g fill="#2060b0">
              <circle cx="66" cy="154" r="78" className="cloud-soft" />
              <circle cx="204" cy="124" r="106" />
              <circle cx="354" cy="164" r="74" />
              <circle cx="524" cy="130" r="112" />
              <circle cx="704" cy="168" r="82" className="cloud-soft" />
              <circle cx="888" cy="126" r="116" />
              <circle cx="1064" cy="172" r="78" />
              <circle cx="1238" cy="132" r="112" />
              <circle cx="1406" cy="172" r="88" className="cloud-soft" />
              <circle cx="454" cy="142" r="26" />
              <circle cx="1132" cy="146" r="32" />
              <rect x="0" y="188" width="1440" height="140" />
            </g>
          </svg>
          <svg className="cloud-layer cloud-layer-6" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true">
            <g fill="#2d7dd2">
              <circle cx="78" cy="150" r="74" />
              <circle cx="212" cy="118" r="100" className="cloud-soft" />
              <circle cx="356" cy="158" r="72" />
              <circle cx="516" cy="124" r="108" />
              <circle cx="690" cy="162" r="80" />
              <circle cx="862" cy="122" r="112" className="cloud-soft" />
              <circle cx="1032" cy="166" r="76" />
              <circle cx="1188" cy="126" r="104" />
              <circle cx="1338" cy="162" r="84" />
              <circle cx="1428" cy="136" r="96" className="cloud-soft" />
              <circle cx="604" cy="138" r="28" />
              <circle cx="1248" cy="140" r="22" />
              <rect x="0" y="188" width="1440" height="140" />
            </g>
          </svg>
          <svg className="cloud-layer cloud-layer-7" viewBox="0 0 1440 300" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="cloud-bed-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4a90e2" />
                <stop offset="100%" stopColor="#6ab0f5" />
              </linearGradient>
            </defs>
            <g fill="url(#cloud-bed-grad)">
              <circle cx="60" cy="150" r="70" />
              <circle cx="170" cy="118" r="94" />
              <circle cx="300" cy="156" r="72" />
              <circle cx="440" cy="122" r="102" />
              <circle cx="600" cy="160" r="76" />
              <circle cx="760" cy="126" r="104" />
              <circle cx="920" cy="162" r="74" />
              <circle cx="1080" cy="128" r="98" />
              <circle cx="1240" cy="162" r="80" />
              <circle cx="1390" cy="138" r="96" />
              <rect x="0" y="186" width="1440" height="140" />
            </g>
          </svg>
        </div>

        <div className="cloud-nav-content">
        <Link to="/" className="cloud-brand" aria-label="RoamSquad home">
          RoamSquad
        </Link>
        <nav className="cloud-links" aria-label="Primary">
          {nav.map((n, idx) => {
            const active = location.pathname === n.to
            return (
              <React.Fragment key={n.to}>
                <Link to={n.to} className={`cloud-link ${active ? 'is-active' : ''}`}>
                  {n.label}
                </Link>
                {idx !== nav.length - 1 && <span className="cloud-sep">·</span>}
              </React.Fragment>
            )
          })}
        </nav>
      </div>
      </div>
    </section>
  )
}

