import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'flowbite-react';
import homeImage from '../../assets/home.jpg';
import featureImage from '../../assets/img.jpg';
import axios from 'axios';
import ReviewCard from '../ReviewCard';

import featureImageh1 from '../../assets/homepic1.jpeg';
import featureImageh2 from '../../assets/homepic2.jpeg';

import feature1Image from '../../assets/sketch.jpg';
import feature2Image from '../../assets/house1.jpg';
import feature3Image from '../../assets/sketch3.jpg';
import feature4Image from '../../assets/AI.jpg';
import feature5Image from '../../assets/sketch1.jpg';
import feature6Image from '../../assets/house2.jpg';

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
    const [topReviews, setTopReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [reviewError, setReviewError] = useState(null);

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

    // Fetch top reviews
    useEffect(() => {
        const fetchTopReviews = async () => {
            try {
                setLoadingReviews(true);
                const response = await axios.get('http://localhost:8080/api/reviews/top-rated');
                // Get only the top 3 reviews
                setTopReviews(response.data.slice(0, 3));
                setReviewError(null);
            } catch (err) {
                console.error('Error fetching top reviews:', err);
                setReviewError('Failed to load reviews');
            } finally {
                setLoadingReviews(false);
            }
        };

        fetchTopReviews();
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
                        "Structura is an invaluable resource! The tutorials are not only clear, but linked to live projects or famous examples, making them much more engaging & interesting compared to others. The downloads have also been useful, helping me to create my own graphic standards & detailed drawings."
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

            <div className="relative w-full bg-gray-700 h-auto flex flex-col items-center justify-center text-white px-6 py-10">
                <div className="flex flex-col md:flex-row items-center max-w-6xl w-full gap-10">
                    <div className="w-full md:w-1/2 text-left gap-4 md:pr-10 order-2 md:order-1">
                        <h2 className="text-3xl font-bold mb-4">Innovative Urban Architecture</h2>
                        <p className="text-lg mb-6">
                            Modern skyscraper with sleek glass facades and integrated green terraces, symbolizing sustainable design and architectural innovation. The building's unique structural features, such as its vertical gardens and expansive windows, reflect cutting-edge techniques in urban development. Ideal for inspiring learners and professionals at Structura to explore advanced 3D rendering and eco-friendly architectural practices.
                        </p>
                        <button className="px-6 py-3 border border-white text-white font-semibold rounded-full hover:bg-black hover:text-white transition">
                            Join Us
                        </button>
                    </div>
                    <div className="w-full md:w-1/2 relative -mr-10 order-1 md:order-2">
                        <img
                            src={featureImageh2}
                            alt="Feature"
                            className="rounded-2xl shadow-lg w-full"
                        />
                    </div>
                </div>
            </div>

            <div className="relative w-full bg-white h-auto flex flex-col items-center justify-center text-black px-6 py-10">
                <div className="flex flex-col md:flex-row items-center max-w-6xl w-full gap-10">
                    <div className="w-full md:w-1/2 relative -ml-10">
                        <img
                            src={featureImageh1}
                            alt="Feature"
                            className="rounded-2xl shadow-lg w-full"
                        />
                    </div>
                    <div className="w-full md:w-1/2 text-left gap-4 md:pl-10">
                        <h2 className="text-3xl font-bold mb-4">Timeless Architectural Heritage</h2>
                        <p className="text-lg mb-6">
                            A classic historical building adorned with ornate facades, detailed columns, and intricate sculptures, representing the rich legacy of architectural artistry. Perfect for Structura's community to study and appreciate iconic structures, this image invites users to deepen their expertise through drawing courses and historical analysis of industry giants.
                        </p>
                        <button className="px-6 py-3 border border-black text-black font-semibold rounded-full hover:bg-black hover:text-white transition">
                            Join Us
                        </button>
                    </div>
                </div>
            </div>

            {/* Top Reviews */}
            <div className="relative w-full bg-gray-100 h-auto py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-10">What Our Users Say</h2>
                    
                    {loadingReviews ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : reviewError ? (
                        <div className="text-center text-red-500">
                            {reviewError}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {topReviews.length > 0 ? (
                                topReviews.map(review => (
                                    <ReviewCard key={review._id || review.id} review={review} />
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-10">
                                    <p className="text-gray-500">No reviews available yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="text-center mt-12">
                        <Link to="/reviews" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                            See All Reviews
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}