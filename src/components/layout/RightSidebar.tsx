
import { useIsMobile } from "@/hooks/use-mobile";

interface RightSidebarProps {
  onClose: () => void;
}

const RightSidebar = ({ onClose }: RightSidebarProps) => {
  const isMobile = useIsMobile();

  return (
    <aside className={`w-full md:w-72 border-l border-gray-200 dark:border-gray-800 h-screen sticky top-0 ${isMobile ? 'fixed right-0 z-50 bg-background' : ''} animate-slide-right`}>
      <div className="flex flex-col h-full p-4 overflow-y-auto">
        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={onClose}
            className="ml-auto p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            aria-label="Close sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        )}

        {/* Trending Topics */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Trending Topics
          </h3>
          <div className="space-y-2">
            {["#AI", "#Startup", "#Funding", "#ProductHunt", "#SaaS"].map((tag) => (
              <button
                key={tag}
                className="inline-block mr-2 mb-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full text-sm transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Top Mentors */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Top Mentors
          </h3>
          <div className="space-y-3">
            {[
              { name: "Sarah Johnson", expertise: "Product Strategy", avatar: "SJ" },
              { name: "Michael Chen", expertise: "VC Funding", avatar: "MC" },
              { name: "Alex Rivera", expertise: "UX Design", avatar: "AR" },
            ].map((mentor) => (
              <div key={mentor.name} className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-full bg-idolyst-lightBlue flex items-center justify-center text-idolyst-darkBlue font-medium">
                  {mentor.avatar}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{mentor.name}</p>
                  <p className="text-xs text-gray-500">{mentor.expertise}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured PitchHub Ideas */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Featured Ideas
          </h3>
          <div className="space-y-3">
            {[
              { title: "AI-Powered Personal Fitness Coach", votes: 124 },
              { title: "Sustainable Packaging Marketplace", votes: 95 },
              { title: "Remote Team Collaboration Platform", votes: 87 },
            ].map((idea) => (
              <div key={idea.title} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h4 className="text-sm font-medium mb-1">{idea.title}</h4>
                <div className="flex items-center text-xs text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="m6 9 6 6 6-6"></path>
                  </svg>
                  {idea.votes} votes
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
