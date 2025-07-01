import { useEffect, useState } from 'react'
import { Container, Typography, Box } from '@mui/material'
import ServiceCard from './ServiceCard.jsx'
import SearchForm from './SearchForm.jsx'

function HomePage() {
    const [popular, setPopular] = useState([])
    const [categories, setCategories] = useState([])

    useEffect(() => {
        fetch('/vendors/api/services/popular/')
            .then(res => res.json())
            .then(setPopular)
            .catch(() => {})

        fetch('/vendors/api/categories-with-services/')
            .then(res => res.json())
            .then(setCategories)
            .catch(() => {})
    }, [])

    return (
        <div className="max-w-screen-xl mx-auto mt-6 px-4">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Welcome to Attica</h2>
                <SearchForm/>
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-3">Popular Service Providers</h3>
                <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
                    {popular.map(service => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </div>

            <div className="mt-8">
                {categories.map(cat => (
                    <div key={cat.id} className="mb-8">
                        <h3 className="text-xl font-semibold mb-3">{cat.name}</h3>
                        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
                            {cat.services.map(service => (
                                <ServiceCard key={service.id} service={service}/>
                            ))}
                        </div>
                    </div>
                ))}

            </div>
        </div>
    )
}

export default HomePage