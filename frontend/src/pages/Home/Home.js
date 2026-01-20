import React from 'react';
import Hero from '../../components/Hero/Hero';
import Services from '../../components/Services/Services';
import About from '../../components/About/About';
import Footer from '../../components/Footer/Footer';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <Hero />
      <Services />
      <About />
      <Footer />
    </div>
  );
};

export default Home;
