import React from "react";

const mockListings = [
  {
    id: 1,
    title: "Cozy Loft",
    img: "https://via.placeholder.com/300x200",
    desc: "Comfortable studio in the city center",
    price: "$120/night",
  },
  {
    id: 2,
    title: "Beach House",
    img: "https://via.placeholder.com/300x200",
    desc: "Enjoy seaside views",
    price: "$200/night",
  },
  {
    id: 3,
    title: "Mountain Retreat",
    img: "https://via.placeholder.com/300x200",
    desc: "Escape to nature",
    price: "$150/night",
  },
  {
    id: 4,
    title: "Modern Apartment",
    img: "https://via.placeholder.com/300x200",
    desc: "Close to attractions",
    price: "$110/night",
  },
];

const ListingGrid = () => (
  <div className="container mx-auto px-4 py-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    {mockListings.map((list) => (
      <div key={list.id} className="border rounded-lg overflow-hidden">
        <img src={list.img} alt="" className="h-40 w-full object-cover" />
        <div className="p-4">
          <h3 className="font-semibold text-lg">{list.title}</h3>
          <p className="text-sm text-gray-500">{list.desc}</p>
          <div className="mt-2 font-bold">{list.price}</div>
        </div>
      </div>
    ))}
  </div>
);

export default ListingGrid;