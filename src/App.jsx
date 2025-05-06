import React from 'react';
import { Route, Routes } from 'react-router';
import Home from './components/Home/Home';
import Addpost from './components/AddPost/Addpost';
import Learn from './components/Learn/Learn';
import Displaypost from './components/DisplayPosts/DisplayPosts';
import FeaturesPage from './pages/FeaturesPage';
import ReviewsHomePage from './components/ReviewsHomePage';












import Addlearn from './components/AddLearn/Addlearn';
import AddCourse from './components/AddCourse/AddCourse';
import Course from './components/Course/Course';
import Displaylearn from './components/DisplayLearns/DisplayLearns';
import DisplayCourse from './components/DisplayCourses/DisplayCourses';
import Footer from './components/Footer';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import OAuthCallback from './components/OAuthCallback';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute'; // Updated PrivateRoute
import PostPage from './pages/PostPage';
import AboutUs from './pages/About';

export default function App() {
  return (
    <div>
      <Header />
      <React.Fragment>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/addpost" element={<Addpost />} />
          <Route path="/course" element={<Course />} />
          <Route path="/displaypost" element={<Displaypost />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutUs />} />
















          <Route path="/reviews" element={<ReviewsHomePage />} />
          <Route path="/displaylearn" element={<Displaylearn />} />
          <Route path="/displaycourse" element={<DisplayCourse />} />
          <Route path="/addlearn" element={<Addlearn />} />
          <Route path="/addcourse" element={<AddCourse />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          {/* Private routes for users and admins */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} /> {/* User dashboard */}
          </Route>
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/home" element={<Home />} />
          <Route path="*" element={<div>Page Not Found</div>} />
          <Route path="/post/:postId" element={<PostPage />} />
        </Routes>
        <Footer />
      </React.Fragment>
    </div>
  );
}