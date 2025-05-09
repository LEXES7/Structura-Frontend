import React, { useState } from "react";
import { ChevronUp } from "lucide-react";

const faqData = [
    {
        id: "one",
        question: "How do I join the Structura community?",
        answer:
            "Joining Structura is simple! Click the 'Sign Up' button on our homepage, fill in your details, and create your account. Once registered, you can set up your profile, explore tutorials, join forums, and start sharing your architectural projects with our community.",
    },
    {
        id: "two",
        question: "What types of tutorials are available on Structura?",
        answer:
            "Structura offers a wide range of architectural tutorials, including 3D modeling, drafting techniques, rendering, sustainable design principles, and analyses of iconic buildings. Our content is created by industry professionals and educators, with both free and premium options available for different skill levels.",
    },
    {
        id: "three",
        question: "How can I share my architectural projects?",
        answer:
            "After logging in, navigate to the 'Posts' section and click 'Create New Post'. You can upload images of your work, add detailed descriptions, specify categories, and tag relevant architectural styles or techniques. Your projects will be visible to the community who can provide feedback and appreciation.",
    },
    {
        id: "four",
        question: "Is Structura suitable for beginners in architecture?",
        answer:
            "Absolutely! Structura welcomes architects at all stages of their journey. We have dedicated learning paths for beginners, with introductory tutorials on fundamental concepts, software basics, and design principles. Our supportive community is also eager to help newcomers grow their skills.",
    },
    {
        id: "five",
        question: "How does the expert feedback feature work?",
        answer:
            "When you share a project, you can opt-in to request expert feedback. Our verified industry professionals and educators can then provide constructive critiques, suggestions, and insights on your work. This feature helps you receive high-quality guidance to improve your architectural skills and projects.",
    },
    {
        id: "six",
        question: "Can I use Structura's resources for my professional work?",
        answer:
            "Yes, many of our resources are available for professional use. Free tutorials and community-shared content can be used as reference and inspiration. Premium resources may have specific licensing terms outlined on their download page. Always check the specific licensing information for each resource you wish to use commercially.",
    },
    {
        id: "seven",
        question: "What are the benefits of a premium membership?",
        answer:
            "Premium members enjoy access to our complete library of in-depth tutorials, downloadable project files, advanced AI tools for design assistance, priority expert feedback, and exclusive webinars with renowned architects. Premium membership helps support our platform while accelerating your architectural learning and career development.",
    },
    {
        id: "eight",
        question: "How can I contribute content to Structura?",
        answer:
            "Experienced architects and educators can apply to become content contributors through the 'Become a Creator' page. After a review of your portfolio and credentials, approved contributors can upload tutorials, case studies, and educational content. Contributors receive recognition within the community and may be eligible for revenue sharing from premium content.",
    },
];

export default function Faq() {
    const [openItem, setOpenItem] = useState("one");

    const toggleAccordion = (itemId) => {
        setOpenItem(openItem === itemId ? "" : itemId);
    };

    return (
        <>
            <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
                <div className="max-w-2xl mx-auto text-center mb-10 lg:mb-14 relative z-10 p-6 rounded-xl">
                    <h2 className="text-2xl font-bold md:text-4xl md:leading-tight">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-1 text-gray-600">
                        Everything you need to know about the Structura platform.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto relative z-10">
                    <div>
                        {faqData.map((item) => (
                            <div
                                key={item.id}
                                className={`rounded-xl p-6 mb-4 border border-gray-200 transition-all duration-300 ${
                                    openItem === item.id ? "bg-gray-50" : ""
                                }`}
                            >
                                <button
                                    className="group pb-3 inline-flex items-center justify-between gap-x-3 w-full md:text-lg font-semibold text-start text-gray-800 rounded-lg transition hover:text-blue-600 focus:outline-none"
                                    onClick={() => toggleAccordion(item.id)}
                                    aria-expanded={openItem === item.id}
                                >
                                    {item.question}
                                    <ChevronUp 
                                        className={`flex-shrink-0 size-5 text-gray-600 group-hover:text-blue-600 transition-transform duration-300 ${
                                            openItem === item.id ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                <div
                                    className={`w-full overflow-hidden transition-all duration-300 ${
                                        openItem === item.id ? "block mt-3" : "hidden"
                                    }`}
                                >
                                    <p className="text-gray-600">{item.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="max-w-3xl mx-auto mt-12 text-center">
                    <p className="text-gray-600">
                        Still have questions? Contact our support team for assistance.
                    </p>
                    <a 
                        href="/contact" 
                        className="mt-4 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        </>
    );
}