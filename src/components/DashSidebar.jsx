import React from 'react';
import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from 'flowbite-react';
import { HiArrowSmRight, HiUser, HiOutlineUsers, HiOutlineCalendar } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signoutSuccess } from '../redux/userSlice';

export default function UnifiedSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const isAdmin = currentUser?.isAdmin;

  const handleSignout = async () => {
    try {
      const res = await fetch('/api/user/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
        navigate('/signin'); // Redirect to signin after logout
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  if (!currentUser) {
    return null; // Do not render the sidebar if the user is not logged in
  }

  return (
    <div className="h-full min-h-screen bg-gray-800 text-white">
      <Sidebar className="h-full">
        <SidebarItems>
          <SidebarItemGroup>
            {/* Common Sidebar Items */}
            <SidebarItem icon={HiUser} as={Link} to="/dashboard?tab=profile">
              Profile
            </SidebarItem>

            {/* User Specific Items */}
            {!isAdmin && (
              <>
                <SidebarItem icon={HiOutlineCalendar} as={Link} to="/dashboard?tab=displaypost">
                  My Posts
                </SidebarItem>
              </>
            )}
             
             

            {/* Admin Specific Items */}
            {isAdmin && (
              <SidebarItem icon={HiOutlineUsers} as={Link} to="/admin-dashboard">
                Manage Users
              </SidebarItem>
            )}

            {/* Sign Out */}
            <SidebarItem
              icon={HiArrowSmRight}
              className="cursor-pointer"
              onClick={handleSignout}
            >
              Sign Out
            </SidebarItem>
          </SidebarItemGroup>
        </SidebarItems>
      </Sidebar>
    </div>
  );
}