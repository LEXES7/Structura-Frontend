import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'flowbite-react';
import homeImage from '../../assets/home.jpg';
import featureImage from '../../assets/img.jpg';
// Placeholder images for features (to be replaced by you)
import feature1Image from '../../assets/sketch.jpg';
import feature2Image from '../../assets/house1.jpg';
import feature3Image from '../../assets/sketch3.jpg';
import feature4Image from '../../assets/AI.jpg';
import feature5Image from '../../assets/sketch1.jpg';
import feature6Image from '../../assets/house2.jpg';

// Features data for Home Inventory Management System
const features = [
  {
      title: 'Architecture Tutorials',
      description: 'Access in-depth tutorials on architectural design, drafting, and 3D rendering.',
      image: feature1Image,
  },
  {
      title: 'Post Sharing',
      description: 'Share your architectural projects, designs, and ideas with the community.',
      image: feature2Image,
  },
  {
      title: 'Expert Feedback',
      description: 'Receive constructive feedback from industry experts on your posts.',
      image: feature3Image,
  },
  {
      title: 'AI Assistant',
      description: 'Explore AI-driven tools for design suggestions and project management.',
      image: feature4Image,
  },
  {
      title: 'Community Forums',
      description: 'Engage with a global community of architects and learners through forums.',
      image: feature5Image,
  },
  {
      title: 'Project Showcase',
      description: 'Highlight your best architectural projects in a personalized portfolio.',
      image: feature6Image,
  },
];

export default function Home() {
    const scrollRef = useRef(null);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const scrollWidth = scrollContainer.scrollWidth / 2; 
        let scrollPosition = 0;

        const scroll = () => {
            scrollPosition += 4; // scroll speed 
            if (scrollPosition >= scrollWidth) {
                scrollPosition = 0; 
                scrollContainer.scrollLeft = 0;
            } else {
                scrollContainer.scrollLeft = scrollPosition;
            }
        };

        const interval = setInterval(scroll, 20); // interval for scrolling
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full">
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
                    <Link to="/signup">
                        <button className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90">
                            Get Started
                        </button>
                    </Link>
                </div>
            </div>

            <div className="relative w-full bg-black h-48 flex flex-col items-center justify-center text-white px-6">
                <div className="p-4 rounded-md max-w-5xl text-left">
                    <p className="text-lg md:text-xl Quicksand">
                        "Structura is an invaluable resource! The tutorials are not only clear, but linked to live projects or famous examples, making them much more engaging & interesting compared to others. The downloads have also been useful, helping me to create my own graphic standards & detailed drawings.”
                    </p>
                    <p className="mt-4 text-right">- Developer Team, SLIIT</p>
                </div>
            </div>

            {/* Features Section */}
            <div className="relative w-full bg-gray-900 py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-5xl font-extrabold tracking-tight text-white mb-10">
                        Features.
                    </h2>
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory scroll-smooth scrollbar-hide"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {[...features, ...features].map((feature, index) => (
                            <div
                                key={`${feature.title}-${index}`}
                                className={`flex-none w-72 bg-gray-800 rounded-xl shadow-lg overflow-hidden snap-center transform transition-all duration-300 
                                }`}
                            >
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="w-full h-48 object-cover rounded-t-xl"
                                />
                                <div className="p-4">
                                    <h3 className="text-xl font-bold text-white mb-2">{feature.title.toUpperCase()}.</h3>
                                    <Badge
                                        color="gray"
                                        className="mb-3 bg-gray-600 text-gray-200 px-3 py-1 rounded-full inline-block"
                                    >
                                        Home Inventory Feature
                                    </Badge>
                                    <p className="text-gray-300 text-sm">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
        </div>
    );
}