import React from "react";

const categories = ["Stays", "Experiences", "Online Experiences"];

const CategoryTabs = () => (
  <div className="container mx-auto px-4 py-6">
    <ul className="flex flex-wrap gap-2 justify-center">
      {categories.map((cat) => (
        <li
          key={cat}
          className="px-4 py-2 rounded-full bg-gray-200 cursor-pointer text-sm"
        >
          {cat}
        </li>
      ))}
    </ul>
  </div>
);

export default CategoryTabs;