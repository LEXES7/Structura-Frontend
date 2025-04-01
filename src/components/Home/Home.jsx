import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import homeImage from '../../assets/home.jpg';
import featureImage from '../../assets/home.jpg'; // Replace with your image path

export default function Home() {
  const [pricingPlan, setPricingPlan] = useState('yearly'); // State for pricing toggle
  const [featureIndex, setFeatureIndex] = useState(0); // State for feature carousel
  const scrollRef = useRef(null); // Ref for scrolling features

  // Sample features data (replace with your actual data)
  const features = [
    {
      title: '3D Rendering',
      category: 'Design',
      skillLevel: 'Intermediate',
      duration: '4 weeks',
      image: 'https://via.placeholder.com/256x160?text=3D+Rendering',
    },
    {
      title: 'Architectural Drawing',
      category: 'Drafting',
      skillLevel: 'Beginner',
      duration: '2 weeks',
      image: 'https://via.placeholder.com/256x160?text=Drawing',
    },
    {
      title: 'Structural Analysis',
      category: 'Engineering',
      skillLevel: 'Advanced',
      duration: '6 weeks',
      image: 'https://via.placeholder.com/256x160?text=Analysis',
    },
    {
      title: 'Interior Design',
      category: 'Design',
      skillLevel: 'Intermediate',
      duration: '3 weeks',
      image: 'https://via.placeholder.com/256x160?text=Interior',
    },
  ];

  // Scroll functions for features
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left_editor: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const newIndex = Math.round(scrollPosition / 300);
      setFeatureIndex(newIndex);
    }
  };

  return (
    <div className="relative w-full">
      {/* Background Image */}
      <div className="relative w-full h-[80vh]">
        <img
          src={homeImage}
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold">Welcome to Structura</h1>
          <p className="mt-4 text-lg md:text-xl">
            Build your dreams with us. Explore our features and services.
          </p>
          <button className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90">
            Get Started
          </button>
        </div>
      </div>

      {/* Black Rectangle Box */}
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

      {/* Popular Features Section */}
      <section className="w-full bg-gray-900 py-12 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8">
            Popular Features.
          </h2>
          <div className="relative">
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide"
              style={{ scrollSnapType: 'x mandatory' }}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex-none w-64 bg-gray-800 rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-bold uppercase">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-2">
                      {feature.category}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Skill level: {feature.skillLevel} | Duration: {feature.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div className="flex justify-center space-x-2 mt-4">
            {features.slice(0, features.length - 2).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setFeatureIndex(index);
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({
                      left: index * 300,
                      behavior: 'smooth',
                    });
                  }
                }}
                className={`w-3 h-3 rounded-full ${
                  index === featureIndex ? 'bg-white' : 'bg-gray-500'
                }`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="w-full bg-gray-900 py-12 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Get ahead of the game
          </h2>
          <p className="text-gray-300 text-base sm:text-lg mb-8">
            Join Structura today and accelerate your business with <span className="uppercase">unlimited</span> access to inventory management tools, analytics, and support. Choose between annual and monthly plans, to suit you.
          </p>
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setPricingPlan('yearly')}
              className={`py-2 px-6 rounded-full font-medium transition duration-300 ${
                pricingPlan === 'yearly'
                  ? 'bg-white text-gray-900'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Yearly
            </button>
            <button
              onClick={() => setPricingPlan('monthly')}
              className={`py-2 px-6 rounded-full font-medium transition duration-300 ${
                pricingPlan === 'monthly'
                  ? 'bg-white text-gray-900'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Monthly
            </button>
          </div>
          <div className="mb-8">
            <p className="text-4xl font-bold text-blue-400">
              {pricingPlan === 'yearly' ? '$11.50' : '$15.00'} per month
            </p>
            {pricingPlan === 'yearly' && (
              <p className="text-gray-400 text-sm mt-2">
                $139 billed yearly / cancel anytime
              </p>
            )}
            {pricingPlan === 'monthly' && (
              <p className="text-gray-400 text-sm mt-2">
                Billed monthly / cancel anytime
              </p>
            )}
          </div>
          <Link to="/signup">
            <button className="bg-blue-600 text-white font-medium py-3 px-8 rounded-full hover:bg-blue-500 transition duration-300">
              Sign Up
            </button>
          </Link>
        </div>
      </section>

      {/* What Our Members Say Section */}
      <section className="w-full bg-gray-900 py-12 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            What our members say.
          </h2>
          <div className="flex justify-center items-center mb-8">
            <span className="text-gray-300 text-base sm:text-lg mr-2">
              With 1500+ active members, we must be doing something right!
            </span>
            <div className="flex items-center">
              <span className="text-gray-300 text-sm font-semibold mr-2">Trustpilot</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
          <div className="relative">
            <button className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 z-10">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <img
                    src="https://via.placeholder.com/40?text=User"
                    alt="User"
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">Faye Doyle</h3>
                    <p className="text-gray-400 text-sm">Practice Owner</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  I recently started my own practice and wanted to get some inspiration for how my fee letters and other documents should be set up. I got the Architects Tool Kit, and it was the purchase process was quick & easy, and I had my products immediately via email.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <img
                    src="https://via.placeholder.com/40?text=User"
                    alt="User"
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">Mike Donaghey</h3>
                    <p className="text-gray-400 text-sm">Architecture Student</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  As an architecture student, I struggled getting grasp of some software such as Revit and Photoshop. I started using ArchAdemia for their extensive and cohesive courses and my final work excelled to levels I did not think I could achieve.
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <img
                    src="https://via.placeholder.com/40?text=User"
                    alt="User"
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">Christopher Gatus</h3>
                    <p className="text-gray-400 text-sm">Freelance Architect</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm">
                  If you’re an Architect or an Aspiring Architect, the ArchAdemia community is something that you want to be a part of. They offer in-depth courses about anything you need to learn about the field of Architecture. They’re based on their experiences in the real world and not the usual things we learn in Architecture school.
                </p>
              </div>
            </div>
            <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 z-10">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}