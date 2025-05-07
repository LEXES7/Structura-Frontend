import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, TextInput } from 'flowbite-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Learn() {
    const [learns, setLearns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { currentUser } = useSelector((state) => state.user);
    const token = currentUser?.token;
    const navigate = useNavigate();
    const location = useLocation();

    const isDashboard = location.pathname === '/displaylearn';

    useEffect(() => {
        const fetchLearns = async () => {
            try {
                const url = isDashboard ? '/api/learns/user' : '/api/learns';
                const config = isDashboard && token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const response = await axios.get(url, config);
                setLearns(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching learns:', err);
                setError('Failed to load learns.');
                setLoading(false);
            }
        };
        fetchLearns();
    }, [isDashboard, token]);

    const handleAddLearn = () => {
        navigate('/addlearn');
    };

    const handleSignOut = () => {
        navigate('/login');
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredLearns = selectedCategory || searchQuery
        ? learns.filter(learn =>
              (!selectedCategory || learn.learnCategory === selectedCategory) &&
              (!searchQuery || learn.learnName.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : learns;

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      
      

            {/* Main Content */}
            <div className="flex-1 p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                <br />
                <div className="flex-1 p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-5xl font-bold text-gray-900">Best Architecture Courses</h1>
                            <p className="mt-4 text-gray-500">
                                These free online architecture courses will teach you how to create a good design that will make people's lives more efficient. Architecture is the process and product of planning, designing, and constructing buildings and other structures. You will learn how to create homes and workplaces with good architecture that will help promote balance and productivity.
                            </p>
                        </div>
                    </div>
                    <br />
                    {/* New Card */}
                    <Card className="bg-gradient-to-r from-red-100 via-yellow-100 to-gray-100 rounded-lg p-6 mb-6 flex flex-row items-center gap-6 h-[300px] overflow-hidden">
                        {/* White Part */}
                        <div className="flex flex-col md:flex-row items-center max-w-6xl w-full gap-10">
                            {/* Image */}
                            <div className="w-[400px] md:w-1/2 relative -ml-10 h-[220px]">
                                <img
                                    src="https://placehold.co/150x150"
                                    alt="Feature"
                                    className="rounded-2xl shadow-lg w-full h-full object-cover"
                                />
                            </div>
                            <div className="w-full md:w-1/2 text-left gap-4 md:pl-10">
                                <h2 className="text-3xl font-bold mb-4">Explore Iconic Architecture with Practical Skill Development</h2>
                                <p className="text-lg mb-6 line-clamp-2">
                                    Our educational approach blends architectural appreciation with hands-on skill-building. Explore iconic structures through 3D rendering and drawing courses, and deepen your expertise by studying architectural marvels and industry giants.
                                </p>
                                <button className="px-6 py-3 border border-black text-black font-semibold rounded-full hover:bg-gradient-to-r from-purple-500 to-pink-500   hover:text-white transition">
                                    Join for Free
                                </button>
                            </div>
                        </div>
                    </Card>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Most Popular Architecture Courses</h1>
                    </div>
                    {/* Search Bar and Category Cards */}
                    <div className="flex flex-row justify-end gap-4 mt-4">
                        <TextInput
                            type="text"
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-1/3 h-10 rounded-lg text-base border-gray-300"
                        />
                    </div>
                    <br></br>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <Card
                            className={`cursor-pointer transition-all duration-300 shadow-md rounded-xl h-10 flex items-center justify-center ${
                                selectedCategory === null
                                    ? 'bg-black'
                                    : 'bg-black hover:bg-black'
                            }`}
                            onClick={() => handleCategoryClick(null)}
                        >
                            <h3
                                className={`text-sm font-semibold text-center text-white`}
                            >
                                All
                            </h3>
                        </Card>
                        <Card
                            className={`cursor-pointer transition-all duration-300 shadow-md rounded-lg h-10 flex items-center justify-center ${
                                selectedCategory === 'Beginner'
                                    ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600 hover:bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600'
                                    : 'bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600 hover:bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600'
                            }`}
                            onClick={() => handleCategoryClick('Beginner')}
                        >
                            <h3
                                className={`text-lg font-semibold text-center ${
                                    selectedCategory === 'Beginner' ? 'text-white' : 'text-white'
                                }`}
                            >
                                Beginner Level
                            </h3>
                        </Card>
                        <Card
                            className={`cursor-pointer transition-all duration-300 shadow-md rounded-lg h-10 flex items-center justify-center ${
                                selectedCategory === 'Intermediate'
                                    ? 'bg-white hover:bg-white'
                                    : 'bg-white hover:bg-white'
                            }`}
                            onClick={() => handleCategoryClick('Intermediate')}
                        >
                            <h3
                                className={`text-lg font-semibold text-center ${
                                    selectedCategory === 'Intermediate' ? 'text-black' : 'text-black'
                                }`}
                            >
                                Intermediate Level
                            </h3>
                        </Card>
                        <Card
                            className={`cursor-pointer transition-all duration-300 shadow-md rounded-lg h-10 flex items-center justify-center ${
                                selectedCategory === 'Advanced'
                                    ? 'bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600 hover:bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600'
                                    : 'bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600 hover:bg-gradient-to-r from-red-500 via-yellow-500 to-gray-600'
                            }`}
                            onClick={() => handleCategoryClick('Advanced')}
                        >
                            <h3
                                className={`text-lg font-semibold text-center ${
                                    selectedCategory === 'Advanced' ? 'text-white' : 'text-white'
                                }`}
                            >
                                Advanced Level
                            </h3>
                        </Card>
                    </div>
                </div>

                <div className="h-[400px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredLearns.map((learn) => (
                        <div key={learn.id} className="bg-white rounded-lg shadow-md p-4">
                            {learn.learnImg && learn.learnImg !== 'default.png' ? (
                                <img
                                    className="w-full h-48 object-cover mb-4 rounded"
                                    src={`http://localhost:8080${learn.learnImg}`}
                                    alt={learn.learnName}
                                    onError={(e) => (e.target.src = 'https://placehold.co/150x150')}
                                />
                            ) : (
                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center mb-4 rounded">
                                    <span className="text-gray-500">No Image</span>
                                </div>
                            )}
                            <h2 className="text-xl font-bold mb-2 text-gray-800 truncate">
                                {learn.learnName}
                            </h2>
                            <p className="text-gray-600  font-semibold text-sm mb-2">
                                 {learn.learnCategory || 'Uncategorized'} 
                            </p>
                            <p className="text-gray-400 text-base line-clamp-2 mb-4">
                                {learn.learnDescription || 'No description'}
                            </p>
                            <div className="flex space-x-2">
                                <Button
                                    size="sm"
                                    className="flex-1 bg-white text-black border border-black hover:bg-gray-100"
                                >
                                    More Info
                                </Button>
                                <Button
                                    color="blue"
                                    size="sm"
                                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold"
                                    onClick={() => navigate('/course')}
                                >
                                    Start
                                </Button>
                            </div>
                            {/* Star Review Section */}
                            <div className="mt-2 flex items-center">
                                {Array(5)
                                    .fill()
                                    .map((_, index) => {
                                        const rating = learn.learnCategory === 'Beginner' ? 3 : learn.learnCategory === 'Intermediate' ? 4 : learn.learnCategory === 'Advanced' ? 5 : 0;
                                        return (
                                            <svg
                                                key={index}
                                                className={`w-5 h-5 ${
                                                    index < rating ? 'text-yellow-400' : 'text-gray-300'
                                                }`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        );
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}