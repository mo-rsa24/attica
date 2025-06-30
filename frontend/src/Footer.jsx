function Footer() {
  return (
    <footer className="bg-light mt-5 pt-4">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h6>Support</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-decoration-none">Help Center</a></li>
              <li><a href="#" className="text-decoration-none">Safety</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6>Hosting</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-decoration-none">Become a Host</a></li>
              <li><a href="#" className="text-decoration-none">Resources</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6>Attica</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-decoration-none">About</a></li>
              <li><a href="#" className="text-decoration-none">Careers</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="bg-secondary text-white text-center py-2 mt-4">
        <small>&copy; {new Date().getFullYear()} Attica</small>
        <div className="ms-2 d-inline">
          <a href="#" className="text-white me-2">Facebook</a>
          <a href="#" className="text-white me-2">Twitter</a>
          <a href="#" className="text-white">Instagram</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer