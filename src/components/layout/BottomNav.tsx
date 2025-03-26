
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route: string) => {
    return path === route;
  };

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="flex items-center justify-around h-16">
        {/* Launchpad */}
        <Link 
          to="/" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
            isActive('/') ? 'text-idolyst-blue' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span className="text-xs mt-1 font-medium">Home</span>
          </motion.div>
        </Link>

        {/* MentorSpace */}
        <Link 
          to="/mentor-space" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
            isActive('/mentor-space') ? 'text-idolyst-blue' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M5.3 18.7l5.3-5.3-5.3-5.3"></path>
              <path d="m10.6 13.4 5.3-5.3"></path>
            </svg>
            <span className="text-xs mt-1 font-medium">Mentors</span>
          </motion.div>
        </Link>

        {/* PitchHub - Center with highlight */}
        <Link 
          to="/pitch-hub" 
          className="flex flex-col items-center justify-center w-full h-full relative"
        >
          <motion.div 
            className={cn(
              "absolute -top-5 p-3 rounded-full shadow-md transition-all duration-300",
              isActive('/pitch-hub') ? 'bg-idolyst-blue text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
            )}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
              <path d="M9 18h6"></path>
              <path d="M10 22h4"></path>
            </svg>
          </motion.div>
          <span className="text-xs mt-6 font-medium">Pitch</span>
        </Link>

        {/* Ascend */}
        <Link 
          to="/ascend" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
            isActive('/ascend') ? 'text-idolyst-blue' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m2 20 2-2h2l5-5 5 5h2l4 4"></path>
              <path d="M18.5 5.5a2.5 2.5 0 0 0-5 0 2.5 2.5 0 0 0 5 0Z"></path>
              <path d="M18.5 2.5V5"></path>
              <path d="M18.5 8.5V11"></path>
              <path d="M16 5.5H13.5"></path>
              <path d="M18.5 5.5H21"></path>
            </svg>
            <span className="text-xs mt-1 font-medium">Ascend</span>
          </motion.div>
        </Link>

        {/* Profile */}
        <Link 
          to="/profile" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
            isActive('/profile') ? 'text-idolyst-blue' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          )}
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="5"></circle>
              <path d="M20 21a8 8 0 0 0-16 0"></path>
            </svg>
            <span className="text-xs mt-1 font-medium">Profile</span>
          </motion.div>
        </Link>
      </div>
    </motion.nav>
  );
};

export default BottomNav;
