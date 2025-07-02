import { useEffect, useState } from 'react'
import ServiceCardSkeleton from './ServiceCardSkeleton.jsx'
import ServiceCard from './ServiceCard.jsx'
import SearchForm from './SearchForm.jsx'

function HomePage() {
    const [popular, setPopular] = useState([])
    const [categories, setCategories] = useState([])

    useEffect(() => {
        fetch('/api/vendors/services/popular/')
            .then(res => res.json())
            .then(setPopular)
            .catch(() => {})

        fetch('/api/vendors/categories-with-services/')
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

            <div className="mt-10">
                <h3 className="text-xl font-semibold mb-4">Popular Service Providers</h3>
                <div className="overflow-x-auto flex snap-x snap-mandatory pb-4">
                    {(popular.length ? popular : Array.from({length: 8}))
                        .reduce((groups, item, idx) => {
                            if (idx % 8 === 0) groups.push([])
                            groups[groups.length - 1].push(item)
                            return groups
                        }, [])
                        .map((group, i) => (
                            <div key={i}
                                 className="grid grid-cols-2 sm:grid-cols-4 grid-rows-2 gap-6 flex-shrink-0 w-full snap-start">
                                {group.map((service, idx) => (
                                    service ? <ServiceCard key={service.id} service={service}/> :
                                        <ServiceCardSkeleton key={idx}/>
                                ))}
                            </div>
                        ))}
                </div>
            </div>

            <hr className="my-10 mx-auto w-1/2 border-t border-dashed"/>
            
            <div className="mt-10">
                {categories.map(cat => (
                    <div key={cat.id} className="mb-10">
                        <h3 className="text-xl font-semibold mb-4">{cat.name}</h3>
                        <div
                            className="flex sm:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-x-auto sm:overflow-visible pb-4 snap-x snap-mandatory sm:snap-none">
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