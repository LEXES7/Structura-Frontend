import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  // Placeholder image URLs for the slider
  const images = [
    'https://via.placeholder.com/800x400?text=Inventory+Image+1',
    'https://via.placeholder.com/800x400?text=Inventory+Image+2',
    'https://via.placeholder.com/800x400?text=Inventory+Image+3',
  ];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Image slider effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change image every 3 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  // State and ref for the Popular Features section
  const [featureIndex, setFeatureIndex] = useState(0);
  const scrollRef = useRef(null);

  // Sample data for the features
  const features = [
    {
      title: 'Inventory Tracking',
      category: 'Category: Core',
      skillLevel: 'Beginner',
      duration: '5 lessons / 2hrs',
      image: 'https://via.placeholder.com/300x200?text=Feature+1',
    },
    {
      title: 'Tool Management',
      category: 'Category: Core',
      skillLevel: 'Intermediate',
      duration: '8 lessons / 4hrs',
      image: 'https://via.placeholder.com/300x200?text=Feature+2',
    },
    {
      title: 'Supply Monitoring',
      category: 'Category: Advanced',
      skillLevel: 'Advanced',
      duration: '10 lessons / 6hrs',
      image: 'https://via.placeholder.com/300x200?text=Feature+3',
    },
    {
      title: 'Equipment Reports',
      category: 'Category: Reporting',
      skillLevel: 'Beginner',
      duration: '6 lessons / 3hrs',
      image: 'https://via.placeholder.com/300x200?text=Feature+4',
    },
    {
      title: 'Stock Alerts',
      category: 'Category: Automation',
      skillLevel: 'Intermediate',
      duration: '7 lessons / 5hrs',
      image: 'https://via.placeholder.com/300x200?text=Feature+5',
    },
    {
      title: 'Data Insights',
      category: 'Category: Analytics',
      skillLevel: 'Advanced',
      duration: '12 lessons / 8hrs',
      image: 'https://via.placeholder.com/300x200?text=Feature+6',
    },
  ];

  // Scroll left and right functions
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
      setFeatureIndex((prev) => Math.max(prev - 1, 0));
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
      setFeatureIndex((prev) => Math.min(prev + 1, features.length - 3));
    }
  };

  // Update featureIndex based on scroll position
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollPosition = scrollRef.current.scrollLeft;
      const cardWidth = 300;
      const newIndex = Math.round(scrollPosition / cardWidth);
      setFeatureIndex(newIndex);
    }
  };

  // State for pricing tab
  const [pricingPlan, setPricingPlan] = useState('yearly');

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Hero Section */}
      <header className="w-full bg-gray-900 text-white flex flex-col items-center justify-center py-16 sm:py-24">
        <div className="max-w-5xl mx-auto text-center px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight leading-tight">
            Next level learning for Architects & Students.
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mt-4 max-w-3xl mx-auto">
            For small businesses, startups, and teams. Manage your supplies, tools, and equipment with confidence. Your one-stop solution for inventory tracking.
          </p>
          <div className="mt-8">
            <Link to="/signup">
              <button className="bg-gray-700 text-white font-medium py-3 px-8 rounded-full hover:bg-gray-600 transition duration-300">
                Why Structura?
              </button>
            </Link>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <p className="text-sm text-gray-400">Trusted by 3000+ businesses</p>
            <div className="flex space-x-6">
              <span className="text-gray-300 text-sm font-semibold">RIBA</span>
              <span className="text-gray-300 text-sm font-semibold flex items-center">
                Trustpilot
                <div className="ml-2 flex">
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
              </span>
              <span className="text-gray-300 text-sm font-semibold">ARB</span>
            </div>
          </div>
        </div>
      </header>

      {/* Testimonial Section */}
      <section className="w-full bg-gray-900 py-12 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-xl sm:text-2xl md:text-3xl font-light italic leading-relaxed">
            “Structura is an invaluable resource! The tools are not only intuitive, but linked to real-world use cases, making them much more practical and useful compared to others. The features have also been helpful, helping me to manage my inventory with ease.”
          </p>
          <p className="mt-6 text-gray-400 text-sm sm:text-base">
            - John Doe, Small Business Owner
          </p>
        </div>
      </section>

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

      {/* Explore Section */}
      <section className="w-full bg-gray-200 py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <img
              src="https://via.placeholder.com/600x400?text=Inventory+Management"
              alt="Inventory Management"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div className="md:w-1/2 md:pl-8 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Explore Efficient Inventory with Practical Tools
            </h2>
            <p className="text-gray-600 text-base sm:text-lg mb-6">
              Our platform blends real-time inventory tracking with practical tools. Monitor your supplies, tools, and equipment through intuitive dashboards and reports, and enhance your workflow with seamless integrations.
            </p>
            <Link to="/signup">
              <button className="bg-gray-800 text-white font-medium py-3 px-8 rounded-full hover:bg-gray-700 transition duration-300">
                Join Us
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tailored Learning Section */}
      <section className="w-full bg-gray-900 py-12 text-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-8 text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Tailored Features to Streamline Your Workflow
            </h2>
            <p className="text-gray-300 text-base sm:text-lg mb-6">
              Explore an extensive suite of tools tailored specifically for inventory management. Skip the generic solutions and dive into targeted features for tracking, reporting, automation, and analytics. Equip your business with the essential tools to stay ahead.
            </p>
            <Link to="/features">
              <button className="bg-gray-700 text-white font-medium py-3 px-8 rounded-full hover:bg-gray-600 transition duration-300">
                Browse Features
              </button>
            </Link>
          </div>
          <div className="md:w-1/2">
            <img
              src="https://via.placeholder.com/600x400?text=Workflow+Tools"
              alt="Workflow Tools"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>
      {/* What Our Members Say Section (New Section) */}
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
      {/* Left Arrow */}
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
      {/* Testimonial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Testimonial 1 */}
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
        {/* Testimonial 2 */}
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
        {/* Testimonial 3 */}
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
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <p className="text-gray-300 text-sm">
            If you’re an Architect or an Aspiring Architect, the ArchAdemia community is something that you want to be a part of. They offer in-depth courses about anything you need to learn about the field of Architecture. They’re based on their experiences in the real world and not the usual things we learn in Architecture school.
          </p>
        </div>
      </div>
      {/* Right Arrow */}
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

      
      {/* Features Section */}
      <section className="w-full max-w-4xl mx-auto py-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Why Choose Structura?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-medium text-gray-800">Track Inventory</h3>
            <p className="text-gray-600 mt-2">
              Keep tabs on supplies and materials easily.
            </p>
          </div>
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-medium text-gray-800">Manage Tools</h3>
            <p className="text-gray-600 mt-2">
              Organize your equipment in one place.
            </p>
          </div>
          <div className="p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-medium text-gray-800">Simple to Use</h3>
            <p className="text-gray-600 mt-2">
              Intuitive design for quick setup.
            </p>
          </div>
        </div>
      </section>

     

      {/* Call-to-Action Section */}
      <section className="w-full bg-blue-600 py-8 text-center text-white">
        <h2 className="text-2xl font-semibold mb-4">
          Get Started with Structura Today
        </h2>
        <p className="text-lg mb-6">
          Sign up now to streamline your inventory management.
        </p>
        <Link to="/signup">
          <button className="bg-white text-blue-600 font-medium py-2 px-6 rounded-md hover:bg-gray-200 transition duration-300">
            Join Now
          </button>
        </Link>
      </section>

      {/* Pricing Section (New Section) */}
      <section className="w-full bg-gray-900 py-12 text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Get ahead of the game
          </h2>
          <p className="text-gray-300 text-base sm:text-lg mb-8">
            Join Structura today and accelerate your business with <span className="uppercase">unlimited</span> access to inventory management tools, analytics, and support. Choose between annual and monthly plans, to suit you.
          </p>
          {/* Tabs */}
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
          {/* Pricing */}
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
          {/* Sign Up Button */}
          <Link to="/signup">
            <button className="bg-blue-600 text-white font-medium py-3 px-8 rounded-full hover:bg-blue-500 transition duration-300">
              Sign Up
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}