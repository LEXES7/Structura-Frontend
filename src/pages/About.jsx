import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { motion } from 'framer-motion';
import homeImage from '../assets/home.jpg';
import postLogo from '../assets/postlogo.png';

const teamMembers = [
    { name: 'Team Member 1', role: 'Lead Developer', image: postLogo },
    { name: 'Team Member 2', role: 'UI/UX Designer', image: postLogo },
    { name: 'Team Member 3', role: 'Developer', image: postLogo },
    { name: 'Team Member 4', role: 'Developer', image: postLogo },
];

export default function AboutUs() {
    return (
        <div className="relative w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">

            <div className="relative w-full h-[50vh]">
                <img
                    src={homeImage}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-80"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                        About Us.
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-gray-300">
                        Learn more about Structura, our team, and our journey.
                    </p>
                </div>
            </div>

            {/* Our Story Section */}
            <div className="container mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-gray-800 rounded-xl shadow-lg p-8 mb-12"
                >
                    <h2 className="text-4xl font-bold text-white mb-6">Our Story.</h2>
                    <p className="text-gray-300 text-lg leading-relaxed">
                        Structura is a platform designed to empower architecture enthusiasts to learn, share, and grow. It was developed as a Project Assignment Framework (PAF) project by a group of 3rd-year students at the Sri Lanka Institute of Information Technology (SLIIT). Our mission is to bridge the gap between architectural education and community collaboration, providing tools for learning, sharing projects, and connecting with experts and peers. Through Structura, we aim to inspire creativity and innovation in the field of architecture.
                    </p>
                </motion.div>

                {/* Our Team Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-12"
                >
                    <h2 className="text-4xl font-bold text-white mb-8 text-center">Our Team.</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-105"
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                                    <p className="text-gray-400 text-sm">{member.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-center"
                >
                    <Link to="/signup">
                        <Button
                            gradientDuoTone="purpleToBlue"
                            className="rounded-full px-8 py-3 text-lg font-semibold shadow-lg"
                        >
                            Join Us
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
