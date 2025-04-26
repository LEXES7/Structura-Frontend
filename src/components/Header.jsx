import {
    Avatar,
    Button,
    Dropdown,
    DropdownDivider,
    DropdownHeader,
    DropdownItem,
    Navbar,
    NavbarCollapse,
    NavbarToggle,
    TextInput,
  } from 'flowbite-react';
  import React from 'react';
  import { Link, useLocation } from 'react-router-dom';
  import { AiOutlineSearch } from 'react-icons/ai';
  import { useSelector, useDispatch } from 'react-redux';
  import { signoutSuccess } from '../redux/userSlice';
  
  export default function Header() {
    const path = useLocation().pathname;
    const dispatch = useDispatch();
    const { currentUser } = useSelector((state) => state.user) || {};
  
    const handleSignout = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/auth/signout', {
          method: 'POST',
        });
        const data = await res.json();
        if (!res.ok) {
          console.log(data.message);
        } else {
          dispatch(signoutSuccess());
        }
      } catch (error) {
        console.log(error.message);
      }
    };
  
    return (
      <Navbar className="bg-black shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/home" className="text-white text-2xl font-bold">
            Structura
          </Link>
          <div className="hidden lg:flex gap-6">
            <Link to="/" className="text-white hover:text-gray-300">
              Home
            </Link>
            <Link to="/displaypost" className="text-white hover:text-gray-300">
            Blogs
            </Link>
            <Link to="/learn" className="text-white hover:text-gray-300">
            Courses
            </Link>
            
            
            <Link to="/features" className="text-white hover:text-gray-300">
              Features
            </Link>
          </div>
          <form className="relative hidden lg:block w-1/3">
            <TextInput type="text" placeholder="Search..." className="pl-10" />
            <AiOutlineSearch className="absolute top-2.5 left-3 text-gray-500" />
          </form>
          <div className="flex items-center gap-4">
            {currentUser ? (
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <Avatar
                    alt="user"
                    img={
                      currentUser.profilePicture ||
                      'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
                    }
                    rounded
                  />
                }
              >
                <DropdownHeader>
                  <span className="block text-sm font-medium">@{currentUser.username}</span>
                  <span className="block text-sm text-gray-500 truncate">{currentUser.email}</span>
                </DropdownHeader>
                <Link to="/dashboard">
                  <DropdownItem>Profile</DropdownItem>
                </Link>
                <DropdownDivider />
                <DropdownItem onClick={handleSignout}>Sign out</DropdownItem>
              </Dropdown>
            ) : (
              <Link to="/signin">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
          <NavbarToggle />
        </div>
        <div className="lg:hidden">
          <NavbarCollapse>
            <Link to="/" className="block py-2 px-4 text-white hover:bg-gray-700">
              Home
            </Link>
            <Link to="/displaypost" className="block py-2 px-4 text-white hover:bg-gray-700">
              Blogs
            </Link>
            
            <Link to="/features" className="block py-2 px-4 text-white hover:bg-gray-700">
              Features
            </Link>
          </NavbarCollapse>
        </div>
      </Navbar>
    );
  }