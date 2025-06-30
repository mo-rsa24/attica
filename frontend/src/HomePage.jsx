import { useEffect, useState } from 'react'

function HomePage() {
  const [popular, setPopular] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetch('/vendors/api/popular-services/')
      .then(res => res.json())
      .then(setPopular)
      .catch(() => {})

    fetch('/vendors/api/categories-with-services/')
      .then(res => {
        console.log(res)
        return res.json()})
      .then(setCategories)
      .catch(() => {})
  }, [])

  return (
    <div className="container mt-4">
      <div className="bg-light p-4 rounded shadow-sm mt-4">
        <h2 className="mb-3">Welcome to Attica</h2>
        <form method="get" action="/vendors/">
          <div className="row g-2 align-items-end">
            <div className="col-md-3">
              <label className="form-label">Where</label>
              <input type="text" name="where" className="form-control" placeholder="Location" />
            </div>
            <div className="col-md-3">
              <label className="form-label">Event Date</label>
              <input type="date" name="event_date" className="form-control" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Time Slot Start</label>
              <input type="time" name="start_time" className="form-control" />
            </div>
            <div className="col-md-2">
              <label className="form-label">Time Slot End</label>
              <input type="time" name="end_time" className="form-control" />
            </div>
            <div className="col-md-2 d-grid">
              <button className="btn btn-primary" type="submit">🔍 Search</button>
            </div>
          </div>
        </form>
      </div>

      <section className="mt-5">
        <h3 className="mb-3">Popular Service Providers</h3>
        <div className="d-flex overflow-auto" style={{ gap: '1rem' }}>
          {popular.map(service => (
            <div className="card" style={{ minWidth: '250px' }} key={service.id}>
              <img src={service.image} className="card-img-top" alt={service.name} style={{ height: '160px', objectFit: 'cover' }} />
              <div className="card-body">
                <h5 className="card-title">{service.vendor_name}</h5>
                <p className="card-text small text-muted">{service.category_name} - {service.location_tags}</p>
                <div className="d-flex align-items-center">
                  <span className="me-1">⭐</span>{service.rating}
                </div>
                <p className="small mt-2">{service.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="container mt-5">
        {categories.map(cat => (
          <div className="mb-5" key={cat.id}>
            <h4 className="mb-3">{cat.name}</h4>
            <div className="d-flex overflow-auto" style={{ gap: '1rem' }}>
              {cat.services.map(service => (
                <div className="card" style={{ minWidth: '220px' }} key={service.id}>
                  <a href={`/vendors/services/${service.id}/`}>
                    <img src={service.image} className="card-img-top" style={{ height: '150px', objectFit: 'cover' }} alt={service.name} />
                  </a>
                  <div className="card-body">
                    <h6 className="card-title">{service.vendor_name}</h6>
                    <p className="card-text small text-muted">{service.location_tags}</p>
                    <div className="d-flex align-items-center">
                      <span className="me-1">⭐</span>{service.rating}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HomePage