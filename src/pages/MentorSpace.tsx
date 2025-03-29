import React, { useState, useEffect } from 'react';
import { useMentor } from '@/hooks/use-mentor';
import { MentorFilter } from '@/types/mentor';
import AppLayout from '@/components/layout/AppLayout';

const MentorSpace = () => {
  const { useMentors, useMentorSessions } = useMentor();
  const [filters, setFilters] = useState<MentorFilter>({
    expertise: [], // Use expertise instead of specialties
    priceRange: [0, 500]
  });
  
  const { data: mentors, isLoading: mentorsLoading } = useMentors(filters);
  const { data: sessions, isLoading: sessionsLoading } = useMentorSessions();
  
  // Fix the unnecessary arguments
  useEffect(() => {
    // Load initial data
    document.title = "Mentor Space | Find and Connect with Mentors";
    
    // You could add analytics tracking here
    const trackPageView = () => {
      // Example analytics tracking
      console.log("Mentor Space page viewed");
    };
    
    trackPageView();
  }, []);
  
  return (
    <AppLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Mentor Space</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">Find a Mentor</h2>
              <p className="text-gray-600 mb-4">
                Connect with experienced mentors who can help guide your career or business.
              </p>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Filter Mentors</h3>
                {/* Filter controls would go here */}
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    Startup Strategy
                  </button>
                  <button className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    Product Development
                  </button>
                  <button className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    Marketing
                  </button>
                  <button className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    Fundraising
                  </button>
                </div>
              </div>
              
              {mentorsLoading ? (
                <div>Loading mentors...</div>
              ) : mentors && mentors.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mentors.map((mentor) => (
                    <div key={mentor.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                          {mentor.avatar_url && (
                            <img 
                              src={mentor.avatar_url} 
                              alt={mentor.full_name || mentor.username} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{mentor.full_name || mentor.username}</h3>
                          <p className="text-sm text-gray-600">
                            {mentor.position}{mentor.company ? ` at ${mentor.company}` : ''}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm mb-3 line-clamp-2">
                        {mentor.bio || "Experienced mentor ready to help you succeed."}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {mentor.expertise?.slice(0, 3).map((exp, i) => (
                          <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            {exp}
                          </span>
                        ))}
                      </div>
                      <button className="w-full py-1.5 bg-blue-600 text-white rounded-md text-sm">
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p>No mentors found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h2 className="text-xl font-semibold mb-4">Your Sessions</h2>
              {sessionsLoading ? (
                <div>Loading sessions...</div>
              ) : sessions && sessions.length > 0 ? (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{session.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          session.status === 'completed' ? 'bg-green-100 text-green-800' :
                          session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                          session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {new Date(session.start_time).toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                          {session.mentor?.avatar_url && (
                            <img 
                              src={session.mentor.avatar_url} 
                              alt={session.mentor.full_name || ''} 
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span className="text-sm">
                          {session.mentor?.full_name || 'Unknown Mentor'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="mb-4">You don't have any sessions yet.</p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">
                    Find a Mentor
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4">Become a Mentor</h2>
              <p className="text-gray-600 mb-4">
                Share your expertise and help others grow. Become a mentor today.
              </p>
              <button className="w-full py-2 bg-green-600 text-white rounded-md">
                Apply to be a Mentor
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MentorSpace;
