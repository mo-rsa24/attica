import { useEffect, useState } from 'react'

function NavBar() {

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">Attica</a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <a className="nav-link">🛒 Cart <span className="badge bg-secondary">1</span></a>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item me-3">
              <a href="/vendors/profile/update/" className="nav-link">Become a Vendor</a>
            </li>
            <li className="nav-item me-3">
              <img src="/static/default_profile.jpg" className="rounded-circle" style={{width:'40px',height:'40px',objectFit:'cover'}} alt="Profile" />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default NavBar