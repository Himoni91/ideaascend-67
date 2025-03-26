
import AppLayout from "@/components/layout/AppLayout";

const PitchHub = () => {
  const featuredIdeas = [
    {
      id: 1,
      title: "AI-Powered Personal Fitness Coach",
      description: "An app that uses computer vision to provide real-time form correction and personalized workout plans.",
      author: "Sarah Johnson",
      votes: 124,
      comments: 32,
      tags: ["AI", "Fitness", "Mobile App"]
    },
    {
      id: 2,
      title: "Sustainable Packaging Marketplace",
      description: "A B2B marketplace connecting businesses with sustainable packaging suppliers and solutions.",
      author: "David Kim",
      votes: 95,
      comments: 27,
      tags: ["Sustainability", "B2B", "Marketplace"]
    },
    {
      id: 3,
      title: "Remote Team Collaboration Platform",
      description: "A virtual office platform that creates spontaneous interaction opportunities for remote teams.",
      author: "Alex Rivera",
      votes: 87,
      comments: 19,
      tags: ["Remote Work", "SaaS", "Productivity"]
    }
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-idolyst-blue to-idolyst-indigo bg-clip-text text-transparent">
            PitchHub
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Submit your startup ideas, get feedback from the community, and connect with potential mentors and co-founders
          </p>
        </div>

        {/* Submit Idea Button */}
        <div className="mb-8 flex justify-center">
          <button className="px-6 py-3 bg-idolyst-blue text-white rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path>
              <path d="M9 18h6"></path>
              <path d="M10 22h4"></path>
            </svg>
            Submit Your Idea
          </button>
        </div>

        {/* Featured Ideas */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Featured Ideas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredIdeas.map((idea) => (
              <div key={idea.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium">{idea.title}</h3>
                  <div className="flex items-center text-idolyst-blue">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="m6 9 6 6 6-6"></path>
                    </svg>
                    <span>{idea.votes}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {idea.description}
                </p>
                <div className="flex flex-wrap mb-3">
                  {idea.tags.map((tag) => (
                    <span key={tag} className="mr-2 mb-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">By {idea.author}</span>
                  <div className="flex items-center text-gray-500">
                    <span className="mr-3">{idea.comments} comments</span>
                    <button className="text-idolyst-blue hover:text-idolyst-darkBlue transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Top Ideas This Week</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Idea
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Votes
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Mentor Feedback
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {[...featuredIdeas]
                    .sort((a, b) => b.votes - a.votes)
                    .map((idea, index) => (
                      <tr key={idea.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-idolyst-lightBlue flex items-center justify-center text-idolyst-darkBlue font-medium">
                              {index + 1}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {idea.title}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              By {idea.author}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {idea.votes}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            index === 0
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}>
                            {index === 0 ? "3 Mentors" : "1 Mentor"}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default PitchHub;
