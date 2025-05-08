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
import Admindash from './pages/Admindash';
import OAuthCallback from './components/OAuthCallback';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute'; 
import AdminRoute from './components/AdminRoute';
import PostPage from './pages/PostPage';
import AboutUs from './pages/About';
import AdminProfile from './pages/AdminProfile';








import EventCalendar from './components/DisplayEvents/EventCalendar'

export default function App() {
  return (
    <div>
      <Header />
      <React.Fragment>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/reviews" element={<ReviewsHomePage />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/course" element={<Course />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/post/:postId" element={<PostPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/displaypost" element={<Displaypost />} /> {/* Moved from private routes */}





          <Route path="eventc" element={<EventCalendar />} />
          
          {/* Private routes for all authenticated users */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/addpost" element={<Addpost />} />
            <Route path="/displaylearn" element={<Displaylearn />} />
            <Route path="/displaycourse" element={<DisplayCourse />} />
          </Route>
          
          {/* Admin-only routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin-dashboard" element={<Admindash />} />
            <Route path="/admin-profile" element={<AdminProfile />} />
            <Route path="/addlearn" element={<Addlearn />} />
            <Route path="/addcourse" element={<AddCourse />} />
            <Route path="/editlearn/:learnId" element={<Addlearn />} />
          </Route>
          
          {/* 404 route */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
        <Footer />
      </React.Fragment>
    </div>
  );
}