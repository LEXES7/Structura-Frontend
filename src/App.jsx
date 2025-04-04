import React from 'react';
import { Route, Routes } from 'react-router';
import Home from './components/Home/Home';
import Addpost from './components/AddPost/Addpost';
import Displaypost from './components/DisplayPosts/DisplayPosts';
import Footer from './components/Footer';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import OAuthCallback from './components/OAuthCallback';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute'; // Updated PrivateRoute

export default function App() {
  return (
    <div>
      <Header />
      <React.Fragment>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/addpost" element={<Addpost />} />
          <Route path="/displaypost" element={<Displaypost />} />
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
        </Routes>
        <Footer />
      </React.Fragment>
    </div>
  );
}