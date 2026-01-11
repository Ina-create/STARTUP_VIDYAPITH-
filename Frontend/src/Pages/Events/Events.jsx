// src/Pages/Events.jsx
import React from 'react';
import Header from '../../Components/Header/Header.jsx';
//import './Events.css'; // Optional: for custom styling

export default function Events() {
  const events = [
    {
      title: "Startup Ideation Workshop",
      date: "January 15, 2026",
      location: "Banasthali Vidyapith Campus",
      description:
        "A hands-on workshop guiding students through brainstorming, validation, and pitching startup ideas.",
    },
    {
      title: "Tech Hackathon 2026",
      date: "February 10-12, 2026",
      location: "Innovation Lab, Startup_Vidyapith",
      description:
        "48-hour hackathon where teams build prototypes, solve real-world problems, and compete for prizes.",
    },
    {
      title: "Founder Networking Meet",
      date: "March 5, 2026",
      location: "Startup_Vidyapith Auditorium",
      description:
        "An exclusive networking event connecting student founders, mentors, and industry experts.",
    },
  ];

  return (
    <div className="events-page">
      <Header />
      <div
        className="events-content"
        style={{ 
          backgroundColor: "oklch(84.1% 0.238 128.85)",
          paddingTop: '80px' // Adds space below fixed header
        }}
      >
        {/* Page Header */}
        <div className="text-center mb-12 px-6">
          <h1 className="text-4xl font-bold text-gray-800">Upcoming Events</h1>
          <p className="mt-2 text-lg text-gray-700">
            Join us in shaping the future of student entrepreneurship.
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 px-6 pb-12">
          {events.map((event, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {event.title}
              </h2>
              <p className="text-sm text-gray-500 mb-1">{event.date}</p>
              <p className="text-sm text-gray-500 mb-4">{event.location}</p>
              <p className="text-gray-700 mb-4">{event.description}</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Register
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}