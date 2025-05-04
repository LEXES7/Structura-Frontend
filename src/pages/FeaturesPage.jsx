import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from 'flowbite-react';
import { motion } from 'framer-motion';


import feature1Image from '../assets/sketch.jpg';
import feature2Image from '../assets/house1.jpg';
import feature3Image from '../assets/sketch3.jpg';
import feature4Image from '../assets/AI.jpg';
import feature5Image from '../assets/sketch1.jpg';
import feature6Image from '../assets/house2.jpg';

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

export default function FeaturesPage() {
    return (
        <div className="relative w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
            {/* Hero Section */}
            <div className="relative w-full h-[50vh]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-80"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                        Explore Our Features.
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-gray-300">
                        Discover the tools and community features that make Structura the ultimate platform for architecture enthusiasts.
                    </p>
                </div>
            </div>

            {/* Features Grid */}
            <div className="container mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.2 }}
                            className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-105"
                        >
                            <img
                                src={feature.image}
                                alt={feature.title}
                                className="w-full h-56 object-cover rounded-t-xl"
                                onError={(e) => (e.target.src = postLogo)}
                            />
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}.</h3>
                                <Badge
                                    color="gray"
                                    className="mb-4 bg-gray-600 text-gray-200 px-3 py-1 rounded-full inline-block"
                                >
                                    Architecture Platform Feature
                                </Badge>
                                <p className="text-gray-300 text-base leading-relaxed">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>



                <div className="text-center mt-12">
                    <Link to="/signup">
                        <Button
                            gradientDuoTone="purpleToBlue"
                            className="rounded-full px-8 py-3 text-lg font-semibold shadow-lg"
                        >
                            Join Now
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}