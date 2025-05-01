import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store'; 
import Home from './components/Home/Home';
import Addpost from './components/AddPost/Addpost';
import Displaypost from './components/DisplayPosts/DisplayPosts';
import Footer from './components/Footer';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import OAuthCallback from './components/OAuthCallback';
import Header from './components/Header';
import HomeDemo from './components/Home/Homedemo';





import AddEventForm from './components/Addevents/AddEventForm';
import DisplayEvent from './components/DisplayEvents/EventCalendar' 

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div>
          <Header />
          <React.Fragment>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/addpost" element={<Addpost />} />
              <Route path="/displaypost" element={<Displaypost />} />
              <Route path="/signin" element={<Signin />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Profile />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route path="/home" element={<Home />} />
              <Route path="/homedemo" element={<HomeDemo />} />
              <Route path="*" element={<div>Page Not Found</div>} />









              <Route path="/av" element={<AddEventForm />} />
              <Route path="/displayevent" element ={<DisplayEvent/>} />
            </Routes>
            <Footer />
          </React.Fragment>
        </div>
      </PersistGate>
    </Provider>
  );
}