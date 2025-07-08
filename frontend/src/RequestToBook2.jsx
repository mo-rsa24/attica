import React, { useState } from 'react';

export default function RequestToBookModal({ isOpen, onClose, serviceId }) {
    const [message, setMessage] = useState('');

    const handleSubmit = () => {
        fetch(`/api/services/${serviceId}/request-book/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', /* Add Auth headers */ },
            body: JSON.stringify({ message /*, other details */ })
        })
        .then(res => {
            if(res.ok) {
                alert('Request sent!');
                onClose();
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Message the Provider</h2>
                <p className="text-sm text-gray-600 mb-4">Ask about special arrangements or confirm details before booking.</p>
                <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    className="w-full border rounded-md p-2 h-32"
                    placeholder="Type your message here..."
                ></textarea>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-md">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-gray-900 text-white rounded-md">Send Request</button>
                </div>
            </div>
        </div>
    );
}