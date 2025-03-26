
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => {
    return path === route;
  };

  const menuItems = [
    {
      title: "Launchpad",
      path: "/",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      title: "PitchHub",
      path: "/pitch-hub",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
          <path d="M9 18h6"></path>
          <path d="M10 22h4"></path>
        </svg>
      ),
    },
    {
      title: "MentorSpace",
      path: "/mentor-space",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M5.3 18.7l5.3-5.3-5.3-5.3"></path>
          <path d="m10.6 13.4 5.3-5.3"></path>
        </svg>
      ),
    },
    {
      title: "Ascend",
      path: "/ascend",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m2 20 2-2h2l5-5 5 5h2l4 4"></path>
          <path d="M18.5 5.5a2.5 2.5 0 0 0-5 0 2.5 2.5 0 0 0 5 0Z"></path>
          <path d="M18.5 2.5V5"></path>
          <path d="M18.5 8.5V11"></path>
          <path d="M16 5.5H13.5"></path>
          <path d="M18.5 5.5H21"></path>
        </svg>
      ),
    },
    {
      title: "Messages",
      path: "/messages",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
    {
      title: "Notifications",
      path: "/notifications",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
        </svg>
      ),
    },
    {
      title: "Profile",
      path: "/profile",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5"></circle>
          <path d="M20 21a8 8 0 0 0-16 0"></path>
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 hidden md:block border-r border-gray-200 dark:border-gray-800 h-screen sticky top-0 animate-slide-in">
      <div className="flex flex-col h-full py-6">
        {/* Logo */}
        <div className="px-6 mb-8">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-semibold bg-gradient-to-r from-idolyst-blue to-idolyst-indigo bg-clip-text text-transparent">
              Idolyst
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              to={item.path}
              className={`flex items-center px-3 py-3 rounded-lg transition-colors duration-200 ${
                isActive(item.path)
                  ? "bg-idolyst-blue/10 text-idolyst-blue"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="px-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-idolyst-blue to-idolyst-indigo flex items-center justify-center text-white">
              <span className="text-sm font-medium">JD</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500">Level 3 Entrepreneur</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
