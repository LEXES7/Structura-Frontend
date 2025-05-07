import React from 'react';
import { Sidebar, SidebarItem, SidebarItemGroup, SidebarItems } from 'flowbite-react';
import { 
  HiArrowSmRight, 
  HiUser, 
  HiOutlineUsers, 
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlineDocumentText,
  HiOutlineChartPie,
  HiOutlineCog,
  HiOutlineHome,
  HiOutlinePencil
} from 'react-icons/hi';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signoutSuccess } from '../redux/userSlice';

export default function DashSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.user);
  const isAdmin = currentUser?.isAdmin;

  // Helper to check if the current route matches
  const isActive = (path) => {
    if (path.includes('?tab=')) {
      const [basePath, tabParam] = path.split('?tab=');
      return location.pathname === basePath && location.search === `?tab=${tabParam}`;
    }
    return location.pathname === path;
  };

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
        navigate('/signin');
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-full min-h-screen bg-gray-800 text-white">
      <Sidebar className="h-full">
        <SidebarItems>
          {/* User Profile Area */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3 mb-2">
              <img 
                src={currentUser.profilePicture || 'https://cdn.pixabay.com/photo/2019/08/11/18/59/icon-4399701_640.png'} 
                alt="Profile" 
                className="rounded-full h-10 w-10 object-cover"
              />
              <div>
                <p className="text-sm font-medium text-white truncate">{currentUser.username}</p>
                <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
              </div>
            </div>
            <div>
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                isAdmin ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isAdmin ? 'Administrator' : 'User'}
              </span>
            </div>
          </div>

          <SidebarItemGroup>
            {/* Common Sidebar Items */}
            <SidebarItem 
              icon={HiOutlineHome} 
              as={Link} 
              to="/"
              active={isActive('/')}
            >
              Home
            </SidebarItem>

            <SidebarItem 
              icon={HiUser} 
              as={Link} 
              to="/profile"
              active={isActive('/profile')}
            >
              Profile
            </SidebarItem>

            {/* User Specific Items */}
{!isAdmin && (
  <>
    <SidebarItem 
      icon={HiOutlineCalendar} 
      as={Link} 
      to="/dashboard?tab=displaypost"  // Changed from /displaypost to /dashboard?tab=displaypost
      active={isActive('/dashboard?tab=displaypost')}
    >
      My Posts
    </SidebarItem>
    <SidebarItem 
      icon={HiOutlinePencil} 
      as={Link} 
      to="/addpost"
      active={isActive('/addpost')}
    >
      Create Post
    </SidebarItem>
  </>
)}
             
            {/* Admin Specific Items */}
            {isAdmin && (
              <>
                <div className="pt-4 pb-2 px-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    ADMIN
                  </p>
                </div>
                
                <SidebarItem 
                  icon={HiOutlineChartPie} 
                  as={Link} 
                  to="/admin-dashboard"
                  active={isActive('/admin-dashboard') && !location.search}
                >
                  Dashboard
                </SidebarItem>
                
                <SidebarItem 
                  icon={HiOutlineUsers} 
                  as={Link} 
                  to="/admin-dashboard"
                  active={location.pathname === '/admin-dashboard' && location.state?.activeTab === 'users'}
                  onClick={() => navigate('/admin-dashboard', { state: { activeTab: 'users' } })}
                >
                  Manage Users
                </SidebarItem>
                
                <SidebarItem 
                  icon={HiOutlineAcademicCap} 
                  as={Link} 
                  to="/admin-dashboard"
                  active={location.pathname === '/admin-dashboard' && location.state?.activeTab === 'courses'}
                  onClick={() => navigate('/admin-dashboard', { state: { activeTab: 'courses' } })}
                >
                  Manage Courses
                </SidebarItem>
                
                <SidebarItem 
                  icon={HiOutlineDocumentText} 
                  as={Link} 
                  to="/admin-dashboard"
                  active={location.pathname === '/admin-dashboard' && location.state?.activeTab === 'posts'}
                  onClick={() => navigate('/admin-dashboard', { state: { activeTab: 'posts' } })}
                >
                  Manage Posts
                </SidebarItem>
                
                <SidebarItem 
                  icon={HiOutlineCog} 
                  as={Link} 
                  to="/profile"
                  active={isActive('/profile')}
                >
                  Settings
                </SidebarItem>
              </>
            )}

            {/* Sign Out */}
            <SidebarItem
              icon={HiArrowSmRight}
              className="cursor-pointer text-red-400 hover:text-red-300 mt-4"
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