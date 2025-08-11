"use client";

import Image from "next/image";
import { useState } from "react";

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All" },
    { id: "web", name: "Web Development" },
    { id: "mobile", name: "Mobile Apps" },
    { id: "design", name: "UI/UX Design" },
  ];

  const galleryItems = [
    {
      id: 1,
      title: "E-Commerce Dashboard",
      category: "web",
      image: "/api/placeholder/400/300",
      description: "Admin dashboard for e-commerce management",
    },
    {
      id: 2,
      title: "Mobile Banking App",
      category: "mobile",
      image: "/api/placeholder/400/300",
      description: "Secure mobile banking application",
    },
    {
      id: 3,
      title: "Portfolio Website Design",
      category: "design",
      image: "/api/placeholder/400/300",
      description: "Modern portfolio website design",
    },
    {
      id: 4,
      title: "Task Management System",
      category: "web",
      image: "/api/placeholder/400/300",
      description: "Collaborative task management platform",
    },
    {
      id: 5,
      title: "Fitness Tracking App",
      category: "mobile",
      image: "/api/placeholder/400/300",
      description: "Personal fitness and workout tracker",
    },
    {
      id: 6,
      title: "Restaurant Menu Design",
      category: "design",
      image: "/api/placeholder/400/300",
      description: "Digital menu design for restaurants",
    },
    {
      id: 7,
      title: "Real Estate Platform",
      category: "web",
      image: "/api/placeholder/400/300",
      description: "Property listing and management system",
    },
    {
      id: 8,
      title: "Social Media App",
      category: "mobile",
      image: "/api/placeholder/400/300",
      description: "Social networking mobile application",
    },
  ];

  const filteredItems = selectedCategory === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  return (
    <section id="gallery" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Project Gallery
          </h2>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-colors duration-200 ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-600 dark:to-gray-700 overflow-hidden">
                  {/* Placeholder for image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-gray-500 dark:text-gray-400 text-center">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Project Image</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium shadow-lg">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Instructions */}
          <div className="mt-16 bg-blue-50 dark:bg-blue-900/20 p-8 rounded-xl text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add Your Project Images
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              To showcase your actual projects, add your images to the <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-sm">public</code> folder 
              and update the image paths in the gallery data.
            </p>
            <div className="text-sm text-gray-500 dark:text-gray-500">
              <p>• Use high-quality screenshots (1200x800px recommended)</p>
              <p>• Optimize images for web (WebP or compressed JPG/PNG)</p>
              <p>• Include mockups and live application screenshots</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}