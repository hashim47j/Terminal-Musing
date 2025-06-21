// Terminal-Musing/src/pages/HomePage/index.jsx
import React from 'react';
import PhilosophyHero from './PhilosophyHero/PhilosophyHero'; // Import your Philosophy Hero section

const HomePage = () => {
  return (
    <div>
      {/* This is where your Philosophy Hero section will be displayed */}
      <PhilosophyHero />

      {/* You'll add other sections to your homepage here as you build them out */}
      {/* <section style={{ padding: '50px 5%', backgroundColor: '#f0f0f0', textAlign: 'center' }}>
        <h2>Latest Musings & Articles</h2>
        // You'll eventually have components here to display recent blog posts
      </section>

      <section style={{ padding: '50px 5%', textAlign: 'center' }}>
        <h2>Explore Topics</h2>
        // Components to list out Law, Social Issues, etc.
      </section> */}
    </div>
  );
};

export default HomePage;