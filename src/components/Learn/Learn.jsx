import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from 'flowbite-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Learn() {
    const [learns, setLearns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useSelector((state) => state.user);
    const token = currentUser?.token;
    const navigate = useNavigate();
    const location = useLocation();

    // Determine if we're in dashboard mode based on route
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
        // Placeholder for sign-out logic (adjust based on your Redux setup)
        navigate('/login');
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex flex-col fixed h-full">
                <div className="p-4 text-2xl font-bold border-b border-gray-700">
                    Dashboard
                </div>
                <nav className="flex-1 p-4">
                    <ul className="space-y-4">
                        <li>
                            <Link
                                to="/displaylearn"
                                className={`block p-2 rounded hover:bg-blue-700 ${
                                    isDashboard ? 'bg-blue-800' : ''
                                }`}
                            >
                                My Learning
                            </Link>
                        </li>
                       
                       
                        <li>
                            <Link
                                to="/displaycourse"
                                className={`block p-2 rounded hover:bg-blue-700 ${
                                    isDashboard ? 'bg-blue-800' : ''
                                }`}
                            >
                                My Courses
                            </Link>
                        </li>
                        
                        <li>
                            <Link
                                to="/learn"
                                className={`block p-2 rounded hover:bg-blue-700 ${
                                    !isDashboard ? 'bg-blue-800' : ''
                                }`}
                            >
                                Explore Learnings
                            </Link>
                        </li>
                    </ul>
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <button
                        className="w-full p-2 bg-red-600 rounded hover:bg-red-700"
                        onClick={handleSignOut}
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}
                <br></br>
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-800">Best Architecture Courses</h1>
                      <p className="mt-4 text-gray-600">
                      These free online architecture courses will teach you how to create a good design that will make people's lives more efficient. Architecture is the process and product of planning, designing, and constructing buildings and other structures. You will learn how to create homes and workplaces with good architecture that will help promote balance and productivity. 
                      </p>
                    </div>
                    
                  </div>
                  <br></br>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800">Most Popular Architecture Courses
                    </h1>
                    </div>
                </div>

                <div className="h-[380px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {learns.map((learn) => (
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
                            <h2 className="text-xl font-semibold mb-2 text-gray-800 truncate">
                                {learn.learnName}
                            </h2>
                            <p className="text-gray-600 text-sm mb-2">
                                Category: {learn.learnCategory || 'Uncategorized'}
                            </p>
                            <p className="text-gray-700 text-base line-clamp-2 mb-4">
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
    color="green"
    size="sm"
    className="flex-1"
    onClick={() => navigate('/course')}
>
    Start
</Button>
</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}