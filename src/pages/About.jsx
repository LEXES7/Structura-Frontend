import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'flowbite-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import homeImage from '../assets/home.jpg';
import postLogo from '../assets/postlogo.png';
import image1 from '../assets/s1.jpeg';
import image2 from '../assets/t.jpeg';
import image3 from '../assets/k.png';
import image4 from '../assets/n.jpeg';

const teamMembers = [
    { name: 'Sachintha Bhashitha', role: 'Lead Developer', image: image1, ITNo: 'IT222', description: 'Sachintha is the visionary behind Structura’s technical foundation. As the Lead Developer, he ensures seamless functionality and innovation in every feature. With a passion for coding and architecture, he aims to create tools that empower users to bring their architectural dreams to life.' },
    { name: 'Thiyaana Vidanaarachchi', role: 'UI/UX Designer', image: image2, ITNo: 'IT222', description: 'Thiyaana crafts the intuitive and visually stunning interfaces that define Structura’s user experience. Her expertise in UI/UX design brings elegance and accessibility to the platform, making it a joy for architecture enthusiasts to explore and collaborate.' },
    { name: 'Kaveesha Tharindi', role: 'Developer', image: image3, ITNo: 'IT222', description: 'Kaveesha is a dedicated developer who brings creativity and precision to Structura’s codebase. Her contributions to the platform’s features ensure that users can share and showcase their projects effortlessly, fostering a vibrant community of learners and creators.' },
    { name: 'Naveen Gunasekara', role: 'Developer', image: image4, ITNo: 'IT222', description: 'Naveen plays a key role in Structura’s development, focusing on building robust and scalable solutions. His enthusiasm for technology and architecture drives him to enhance the platform, making it a hub for innovation and collaboration in the architectural world.' },
];

export default function AboutUs() {
    const { scrollY } = useScroll();
    const backgroundY = useTransform(scrollY, [0, 500], [0, -100]);

    return (
        <div className="relative w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
            <motion.div
                className="relative w-full h-[50vh] overflow-hidden"
                style={{ y: backgroundY }}
            >
                <motion.img
                    src={homeImage}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-80"></div>
                <motion.div
                    className="relative z-10 flex flex-col items-center justify-center h-full text-center"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    <motion.h1
                        className="text-5xl md:text-6xl font-extrabold tracking-tight"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                    >
                        About Us.
                    </motion.h1>
                    <motion.p
                        className="mt-4 text-lg md:text-xl text-gray-300"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                    >
                        Learn more about Structura, our team, and our journey.
                    </motion.p>
                </motion.div>
            </motion.div>

            {/* Our Story Section */}
            <div className="container mx-auto px-4 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-gray-800 rounded-xl shadow-lg p-8 mb-12"
                    whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                >
                    <h2 className="text-4xl font-bold text-white mb-6">Our Story.</h2>
                    <motion.p
                        className="text-gray-300 text-lg leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Structura is a platform designed to empower architecture enthusiasts to learn, share, and grow. It was developed as a Project Assignment Framework (PAF) project by a group of 3rd-year students at the Sri Lanka Institute of Information Technology (SLIIT). Our mission is to bridge the gap between architectural education and community collaboration, providing tools for learning, sharing projects, and connecting with experts and peers. Through Structura, we aim to inspire creativity and innovation in the field of architecture.
                    </motion.p>
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
                                className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl"
                                whileHover={{ scale: 1.05 }}
                            >
                                <motion.img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-48 object-cover"
                                    whileHover={{ rotate: 5, transition: { duration: 0.3 } }}
                                />
                                <div className="p-6 text-center">
                                    <h3 className="text-xl font-semibold text-white mb-2">{member.name}</h3>
                                    <p className="text-gray-400 text-sm">{member.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Team Member Introductions */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mb-12"
                >
                    <h2 className="text-4xl font-bold text-white mb-8 text-center">Meet Our Members.</h2>
                    <div className="space-y-12">
                        {teamMembers.map((member, index) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                className="flex flex-col md:flex-row items-center bg-gray-800 rounded-xl shadow-lg p-6"
                                whileHover={{ scale: 1.03, y: -10, transition: { duration: 0.4 } }}
                            >
                                <motion.img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-32 h-32 rounded-full object-cover mb-4 md:mb-0 md:mr-6"
                                    whileHover={{ scale: 1.1, transition: { duration: 0.3 } }}
                                />
                                <motion.div
                                    className="text-center md:text-left"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
                                >
                                    <h3 className="text-2xl font-semibold text-white mb-2">{member.name}</h3>
                                    <p className="text-gray-400 text-sm mb-2">{member.role} | {member.ITNo}</p>
                                    <motion.p
                                        className="text-gray-300 text-lg leading-relaxed"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
                                    >
                                        {member.description}
                                    </motion.p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-center"
                    whileInView={{ scale: 1.05, transition: { duration: 0.5 } }}
                >
        
                </motion.div>
            </div>
        </div>
    );
}