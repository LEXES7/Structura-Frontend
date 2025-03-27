import React from 'react'
import { Route, Routes } from 'react-router'
import Home from './components/Home/Home'
import Addpost from './components/AddPost/Addpost'
import Displaypost from './components/DisplayPosts/DisplayPosts'
import Footer from './components/Footer'

export default function App() {
  return (
    <div>
      <React.Fragment>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/addpost' element={<Addpost />} />
          <Route path='/displaypost' element={<Displaypost />} />

        </Routes>
        <Footer /> 
      </React.Fragment> 
    </div>
  )
}
