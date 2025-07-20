import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaStar, FaTimes, FaPlus, FaMinus, FaStickyNote } from 'react-icons/fa';
import {useEventCreation} from "../context/reactContext.jsx";

// --- API Helper ---
const api = {
    fetchServices: () => fetch('/api/vendors/services/').then(res => res.json()),
    fetchCategories: () => fetch('/api/vendors/categories/').then(res => res.json()),
};

// --- Reusable Components ---

const ServiceCard = ({ service, onAdd, onOpenNotes, isSelected }) => (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
        <img src={service.image || 'https://placehold.co/400x300/e2e8f0/4a5568?text=Service'} alt={service.name} className="h-40 w-full object-cover" />
        <div className="p-4 flex-grow flex flex-col">
            <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
            <p className="text-sm text-gray-500">{service.category_name}</p>
            <div className="flex-grow"></div>
            <div className="flex items-center justify-between mt-4">
                <span className="font-bold text-yellow-500 flex items-center"><FaStar className="mr-1" /> {service.rating}</span>
                <span className="text-lg font-bold text-pink-600">R{parseFloat(service.price).toLocaleString()}</span>
            </div>
            <div className="mt-4 border-t pt-4 flex gap-2">
                <button onClick={() => onOpenNotes(service)} className="w-full text-sm text-center text-gray-800 font-bold py-2 rounded-md border border-gray-300 hover:bg-gray-100">Add Notes</button>
                <button onClick={() => onAdd(service)} className={`w-full text-sm font-bold px-4 py-2 rounded-md transition-colors ${isSelected ? 'bg-gray-200 text-gray-600' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                    {isSelected ? 'Added' : 'Add'}
                </button>
            </div>
        </div>
    </div>
);

const SelectedServicesSidebar = ({ selected, onUpdate, onRemove, totalCost }) => {
    const groupedServices = useMemo(() => {
        return selected.reduce((acc, service) => {
            (acc[service.category_name] = acc[service.category_name] || []).push(service);
            return acc;
        }, {});
    }, [selected]);

    return (
        <div className="sticky top-24">
            <div className="bg-white p-6 rounded-xl shadow-lg max-h-[calc(100vh-8rem)] overflow-y-auto">
                <h3 className="text-2xl font-bold text-gray-900">Your Services</h3>
                <div className="mt-6 space-y-6">
                    {Object.keys(groupedServices).length > 0 ? Object.entries(groupedServices).map(([category, services]) => (
                        <div key={category}>
                            <h4 className="font-bold text-gray-500 uppercase text-sm">{category}</h4>
                            <div className="mt-2 space-y-3">
                                {services.map(service => (
                                    <div key={service.id} className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold">{service.name}</p>
                                                <p className="text-sm text-gray-600">R{parseFloat(service.price).toLocaleString()}</p>
                                            </div>
                                            <button onClick={() => onRemove(service.id)} className="text-gray-400 hover:text-red-500"><FaTimes /></button>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <button onClick={() => onUpdate(service.id, 'quantity', Math.max(1, service.quantity - 1))} className="w-7 h-7 bg-gray-200 rounded-full"><FaMinus /></button>
                                            <span className="font-bold w-8 text-center">{service.quantity}</span>
                                            <button onClick={() => onUpdate(service.id, 'quantity', service.quantity + 1)} className="w-7 h-7 bg-gray-200 rounded-full"><FaPlus /></button>
                                        </div>
                                        {service.notes && <p className="text-xs text-gray-500 mt-1 italic flex items-center gap-1"><FaStickyNote /> {service.notes}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )) : <p className="text-gray-500">Add services from the list.</p>}
                </div>
                <div className="border-t border-gray-200 mt-6 pt-6">
                    <p className="text-gray-600 font-semibold">Total Estimated Cost:</p>
                    <p className="text-4xl font-extrabold text-pink-600 mt-2">R {totalCost.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

const AddNotesModal = ({ service, onClose, onSave }) => {
    const [notes, setNotes] = useState(service?.notes || '');
    if (!service) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-8">
                    <h2 className="text-2xl font-bold">Custom Notes for {service.name}</h2>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full h-32 mt-4 p-2 border rounded-lg" placeholder="e.g., 'Need a gluten-free option', 'Stage must be 10x15 meters'..." />
                    <button onClick={() => { onSave(service.id, notes); onClose(); }} className="mt-6 w-full bg-green-600 text-white font-bold py-3 rounded-lg">Save Notes</button>
                </div>
            </div>
        </div>
    );
};

// --- Main Selection Page ---
export default function SelectVendors() {
    const navigate = useNavigate();
    const { selectedVendors, setSelectedVendors } = useEventCreation();
    const [allServices, setAllServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [modalService, setModalService] = useState(null);

    useEffect(() => {
        Promise.all([api.fetchServices(), api.fetchCategories()])
            .then(([serviceData, categoryData]) => {
                setAllServices(serviceData.results || serviceData || []);
                setCategories(['All', ...categoryData.map(c => c.name)]);
            })
            .catch(error => console.error("Failed to fetch vendor data:", error));
    }, []);

    const handleAddService = (service) => {
        if (selectedVendors.find(s => s.id === service.id)) return;
        setSelectedVendors([...selectedVendors, { ...service, quantity: 1, notes: '' }]);
    };

    const handleRemoveService = (serviceId) => {
        setSelectedVendors(selectedVendors.filter(s => s.id !== serviceId));
    };

    const handleUpdateService = (serviceId, field, value) => {
        setSelectedVendors(selectedVendors.map(s => s.id === serviceId ? { ...s, [field]: value } : s));
    };

    const totalCost = useMemo(() => {
        return selectedVendors.reduce((sum, s) => sum + (s.price * s.quantity), 0);
    }, [selectedVendors]);

    const handleDone = () => {
        navigate('/listing/step3');
    };

    const filteredServices = useMemo(() => {
        if (activeCategory === 'All') {
            return allServices;
        }
        return allServices.filter(s => s.category_name === activeCategory);
    }, [allServices, activeCategory]);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white sticky top-0 z-30 shadow-sm">
                <div className="p-4 max-w-screen-2xl mx-auto">
                    <h1 className="text-2xl font-bold">Select Service Providers</h1>
                    <p className="text-sm text-gray-500">Home → Events → Step 3 → Services</p>
                </div>
                <div className="p-4 border-t border-gray-200 flex flex-wrap gap-3 items-center">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${activeCategory === cat ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </header>

            <main className="max-w-screen-2xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredServices.map(service => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                    onAdd={handleAddService}
                                    onOpenNotes={setModalService}
                                    isSelected={selectedVendors.some(s => s.id === service.id)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-4 xl:col-span-3">
                        <SelectedServicesSidebar selected={selectedVendors} onUpdate={handleUpdateService} onRemove={handleRemoveService} totalCost={totalCost} />
                    </div>
                </div>
            </main>

            <AddNotesModal service={modalService} onClose={() => setModalService(null)} onSave={(id, notes) => handleUpdateService(id, 'notes', notes)} />

            <footer className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={handleDone}
                    className="px-8 py-4 bg-pink-600 text-white font-bold rounded-full shadow-2xl hover:bg-pink-700 disabled:bg-gray-400 transform hover:scale-105 transition-transform"
                >
                    Done
                </button>
            </footer>
        </div>
    );
}
