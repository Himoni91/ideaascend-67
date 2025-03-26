
import AppLayout from "@/components/layout/AppLayout";

const MentorSpace = () => {
  const topMentors = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "SJ",
      expertise: "Product Strategy",
      rate: "$150/hr",
      rating: 4.9,
      reviewCount: 42,
      availability: "Next available: Tomorrow",
      tags: ["Product", "Strategy", "UX"]
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "MC",
      expertise: "VC Funding",
      rate: "$200/hr",
      rating: 4.8,
      reviewCount: 36,
      availability: "Next available: Today",
      tags: ["Funding", "Pitch Deck", "VC"]
    },
    {
      id: 3,
      name: "Alex Rivera",
      avatar: "AR",
      expertise: "UX Design",
      rate: "$125/hr",
      rating: 4.7,
      reviewCount: 29,
      availability: "Next available: Friday",
      tags: ["UX", "UI", "Design"]
    },
    {
      id: 4,
      name: "Jessica Taylor",
      avatar: "JT",
      expertise: "Growth Marketing",
      rate: "$175/hr",
      rating: 4.9,
      reviewCount: 51,
      availability: "Next available: Tomorrow",
      tags: ["Marketing", "Growth", "SEO"]
    }
  ];

  const expertiseCategories = [
    "All",
    "Product",
    "Funding",
    "Marketing",
    "Design",
    "Engineering",
    "Sales",
    "Operations"
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-idolyst-blue to-idolyst-indigo bg-clip-text text-transparent">
            MentorSpace
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect with experienced mentors who can help you navigate challenges and accelerate your professional growth
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white focus:ring-idolyst-blue focus:border-idolyst-blue"
                placeholder="Search by name, expertise, or keyword..."
              />
            </div>
            <div className="flex-shrink-0">
              <button className="px-5 py-3 bg-idolyst-blue text-white rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <line x1="4" x2="20" y1="7" y2="7"></line>
                  <line x1="10" x2="14" y1="11" y2="11"></line>
                  <line x1="6" x2="18" y1="15" y2="15"></line>
                  <line x1="8" x2="16" y1="19" y2="19"></line>
                </svg>
                Filter
              </button>
            </div>
          </div>
        </div>

        {/* Expertise Categories */}
        <div className="mb-8 overflow-x-auto scrollbar-none -mx-4 px-4">
          <div className="flex space-x-2 pb-2">
            {expertiseCategories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  category === "All"
                    ? "bg-idolyst-blue text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {topMentors.map((mentor) => (
            <div key={mentor.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-all animate-scale-in">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-full bg-idolyst-lightBlue flex items-center justify-center text-idolyst-darkBlue font-medium text-lg">
                  {mentor.avatar}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between">
                    <h3 className="text-lg font-semibold">{mentor.name}</h3>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FCD34D" stroke="#FCD34D" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      <span className="font-medium">{mentor.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">({mentor.reviewCount})</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {mentor.expertise} · {mentor.rate}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mb-3">
                    {mentor.availability}
                  </p>
                  <div className="flex flex-wrap mb-3">
                    {mentor.tags.map((tag) => (
                      <span key={tag} className="mr-2 mb-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <button className="text-sm text-idolyst-blue hover:text-idolyst-darkBlue transition-colors">
                      View Profile
                    </button>
                    <button className="px-3 py-1.5 bg-idolyst-blue text-white rounded-lg text-sm hover:bg-idolyst-darkBlue transition-colors">
                      Book Session
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Become a Mentor */}
        <div className="bg-gradient-to-r from-idolyst-blue to-idolyst-indigo rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-center">
            <div className="flex-1 mb-4 md:mb-0">
              <h3 className="text-xl font-bold mb-2">Become a Mentor</h3>
              <p className="mb-4">
                Share your expertise, guide ambitious professionals, and earn while making an impact
              </p>
              <button className="px-4 py-2 bg-white text-idolyst-blue rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Apply Now
              </button>
            </div>
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M5.3 18.7l5.3-5.3-5.3-5.3"></path>
                  <path d="m10.6 13.4 5.3-5.3"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MentorSpace;
