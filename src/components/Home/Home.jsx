import React from 'react';
import homeImage from '../../assets/home.jpg';
import featureImage from '../../assets/img.jpg'; 
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative w-full">
      {/* Background Image */}
      <div className="relative w-full h-[80vh]">
        <img
          src={homeImage}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold">Welcome to Structura</h1>
          <p className="mt-4 text-lg md:text-xl">
            Build your dreams with us. Explore our features and services.
          </p>
          <Link to="/signup">
          <button className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90">
            Get Started
          </button>
          </Link>
        </div>
      </div>

      {/* Black Part*/}
      <div className="relative w-full bg-black h-48 flex flex-col items-center justify-center text-white px-6">
        <div className="p-4 rounded-md max-w-5xl text-left">
          <p className="text-lg md:text-xl Quicksand">
            "Structura is an invaluable resource! The tutorials are not only clear, but linked to live projects or famous examples, making them much more engaging & interesting compared to others. The downloads have also been useful, helping me to create my own graphic standards & detailed drawings.”
          </p>
          <p className="mt-4 text-right ">- Developer Team, SLIIT</p>
        </div>
      </div>

      {/* White Part */}
      <div className="relative w-full bg-white h-auto flex flex-col items-center justify-center text-black px-6 py-10">
        <div className="flex flex-col md:flex-row items-center max-w-6xl w-full gap-10">
          {/* Image  */}
          <div className="w-full md:w-1/2 relative -ml-10"> 
            <img
              src={featureImage}
              alt="Feature"
              className="rounded-2xl shadow-lg w-full"
            />
          </div>

      
          <div className="w-full md:w-1/2 text-left gap-4 md:pl-10">
            <h2 className="text-3xl font-bold mb-4">Explore Iconic Architecture with Practical Skill Development</h2>
            <p className="text-lg mb-6">
              Our educational approach blends architectural appreciation with hands-on skill-building. Explore iconic structures through 3D rendering and drawing courses, and deepen your expertise by studying architectural marvels and industry giants.
            </p>
            <button className="px-6 py-3 border border-black text-black font-semibold rounded-full hover:bg-black hover:text-white transition">
              Join Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
