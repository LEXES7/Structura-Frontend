import React from 'react';
import { Route, Routes } from 'react-router';
import Home from './components/Home/Home';
import Addpost from './components/AddPost/Addpost';
import Displaypost from './components/DisplayPosts/DisplayPosts';
import Footer from './components/Footer';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import OAuthCallback from './components/OAuthCallback';

export default function App() {
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/addpost" element={<Addpost />} />
          <Route path="/displaypost" element={<Displaypost />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Profile />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
        <Footer />
      </React.Fragment>
    </div>
  );
}