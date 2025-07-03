import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function RequestToBook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [payment, setPayment] = useState("full");

  useEffect(() => {
    fetch(`/api/vendors/services/${id}/`)
      .then((res) => res.json())
      .then((data) => setService(data))
      .catch(() => {});
  }, [id]);

  const submit = (e) => {
    e.preventDefault();
    fetch("/api/vendors/booking-requests/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service: id, payment_option: payment }),
    }).then((res) => {
      if (res.ok) navigate("/");
    });
  };

  if (!service) return <div className="text-center py-20">Loading…</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <div className="flex items-center space-x-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
            ←
          </button>
          <h1 className="text-2xl font-semibold">
            <span className="text-blue-600">Request</span> to book
          </h1>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-6">
            <h2 className="text-lg font-bold">1. Choose when to pay</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span>Pay {service.price} ZAR now</span>
                <input
                  type="radio"
                  name="payment"
                  value="full"
                  checked={payment === "full"}
                  onChange={() => setPayment("full")}
                  className="form-radio h-5 w-5 text-black"
                />
              </label>
              <label className="flex items-start justify-between">
                <div className="space-y-1">
                  <span>Pay part now, part later</span>
                  <p className="text-sm text-gray-500">No extra fees.</p>
                </div>
                <input
                  type="radio"
                  name="payment"
                  value="partial"
                  checked={payment === "partial"}
                  onChange={() => setPayment("partial")}
                  className="form-radio h-5 w-5 text-black"
                />
              </label>
            </div>
            <button type="submit" className="mt-4 bg-black text-white py-2 px-6 rounded-lg hover:bg-gray-800">
              Next
            </button>
          </div>
          <div className="border border-gray-200 rounded-2xl p-6 text-gray-500">2. Add a payment method</div>
          <div className="border border-gray-200 rounded-2xl p-6 text-gray-500">3. Review your request</div>
        </form>
      </div>
      <div>
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-5 sticky top-24">
          <img src={service.image} className="w-full h-40 object-cover rounded-lg mb-4" />
          <h3 className="text-lg font-semibold">{service.name}</h3>
          <div className="flex items-center text-sm text-gray-600">
            <span className="text-yellow-400">★</span>
            <span className="ml-1">
              {service.rating} ({service.reviews.length})
            </span>
            <span className="ml-3">· Guest favorite</span>
          </div>
          <p className="text-sm font-medium">Free cancellation</p>
          <p className="text-sm text-gray-500">Cancel before arrival for a full refund.</p>
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Trip details</span>
            </div>
            <p className="text-sm text-gray-700">Dates TBD<br/>1 guest</p>
            <div className="flex justify-between text-sm">
              <span>{service.price} ZAR x 1 night</span>
              <span>{service.price} ZAR</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total ZAR</span>
              <span>{service.price} ZAR</span>
            </div>
          </div>
          <div className="flex items-center mt-6 space-x-3">
            <span className="text-pink-500">♦</span>
            <div>
              <p className="text-sm font-medium">This is a rare find.</p>
              <p className="text-sm text-gray-600">{service.vendor.name}'s place is usually booked.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}