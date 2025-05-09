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
  HiOutlinePencil,
  HiOutlineUserCircle,
  HiOutlineStar,
  HiOutlineBookOpen,
  HiCalendar,
  HiOutlinePlusCircle
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

  // Helper to check if admin tab is active
  const isAdminTabActive = (tabName) => {
    if (location.pathname === '/admin-dashboard') {
      if (location.search) {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        return tab === tabName;
      } else {
        return location.state?.activeTab === tabName;
      }
    }
    return false;
  };

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
        navigate('/signin');
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Navigate to admin dashboard with specific tab
  const navigateToAdminTab = (tabName) => {
    navigate(`/admin-dashboard?tab=${tabName}`, { state: { activeTab: tabName } });
  };

  // Navigate to user dashboard with specific tab
  const navigateToUserTab = (tabName) => {
    navigate(`/dashboard?tab=${tabName}`, { replace: true });
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="h-full min-h-screen text-white">
      <Sidebar className="h-full">
        <SidebarItems>
          {/* User Profile Area */}
          <div className="p-4 ">
            <div className="flex items-center space-x-3 mb-2">
              <img 
                src={currentUser.profilePicture || 'https://cdn.pixabay.com/photo/2019/08/11/18/59/icon-4399701_640.png'} 
                alt="Profile" 
                className="rounded-full h-10 w-10 object-cover"
              />
              <div>
                <p className="text-sm font-medium text-blue-500 truncate">{currentUser.username}</p>
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

            {/* Profile link - show regular profile for users, admin profile for admins */}
            <SidebarItem 
              icon={HiUser} 
              as={Link} 
              to={isAdmin ? "/admin-profile" : "/profile"}
              active={isActive(isAdmin ? "/admin-profile" : "/profile")}
            >
              {isAdmin ? "Admin Profile" : "Profile"}
            </SidebarItem>

            {/* User Specific Items */}
            {!isAdmin && (
              <>
                <SidebarItem 
                  icon={HiOutlineChartPie} 
                  active={isActive('/dashboard?tab=overview')}
                  onClick={() => navigateToUserTab('overview')}
                >
                  Dashboard
                </SidebarItem>

                <SidebarItem 
                  icon={HiOutlineDocumentText} 
                  active={isActive('/dashboard?tab=displaypost')}
                  onClick={() => navigateToUserTab('displaypost')}
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

                <SidebarItem 
                  icon={HiCalendar} 
                  active={isActive('/dashboard?tab=events')}
                  onClick={() => navigateToUserTab('events')}
                >
                  Event Calendar
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
                  active={isActive('/admin-dashboard') || isAdminTabActive('overview')}
                  onClick={() => navigateToAdminTab('overview')}
                >
                  Dashboard
                </SidebarItem>
                
                <SidebarItem 
                  icon={HiOutlineUsers} 
                  active={isAdminTabActive('users')}
                  onClick={() => navigateToAdminTab('users')}
                >
                  Manage Users
                </SidebarItem>
                
                <SidebarItem 
                  icon={HiOutlineAcademicCap} 
                  active={isAdminTabActive('courses')}
                  onClick={() => navigateToAdminTab('courses')}
                >
                  Manage Courses
                </SidebarItem>

                <SidebarItem 
                  icon={HiOutlineBookOpen} 
                  active={isAdminTabActive('lessons')}
                  onClick={() => navigateToAdminTab('lessons')}
                >
                  Manage Lessons
                </SidebarItem>
                
                <SidebarItem 
                  icon={HiOutlineDocumentText} 
                  active={isAdminTabActive('posts')}
                  onClick={() => navigateToAdminTab('posts')}
                >
                  Manage Posts
                </SidebarItem>
                
                <SidebarItem 
                  icon={HiOutlineStar} 
                  active={isAdminTabActive('reviews')}
                  onClick={() => navigateToAdminTab('reviews')}
                >
                  Manage Reviews
                </SidebarItem>

                {/* Events Management Section */}
                <div className="pt-4 pb-2 px-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    EVENTS
                  </p>
                </div>

                <SidebarItem 
                  icon={HiOutlineCalendar} 
                  active={isAdminTabActive('events')}
                  onClick={() => navigateToAdminTab('events')}
                >
                  View Events
                </SidebarItem>

                <SidebarItem 
                  icon={HiOutlinePlusCircle} 
                  active={isAdminTabActive('addevent')}
                  onClick={() => navigateToAdminTab('addevent')}
                >
                  Add/Edit Event
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