// Terminal-Musing/src/pages/HomePage/index.jsx
import React from 'react';
import PhilosophyHero from './PhilosophyHero/PhilosophyHero'; // Your first hero section
import HistoryHero from './HistoryHero/HistoryHero'; // Import the new History Hero section

const HomePage = () => {
  return (
    <div>
      {/* Your Philosophy Hero section */}
      <PhilosophyHero />

      {/* Your new History Hero section with scroll animation */}
      <HistoryHero />

      {/* You'll add other sections to your homepage here as you build them out */}
      {/* <section style={{ padding: '50px 5%', backgroundColor: '#f0f0f0', textAlign: 'center' }}>
        <h2>Latest Musings & Articles</h2>
        // You'll eventually have components here to display recent blog posts
      </section> */}
    </div>
  );
};

export default HomePage;