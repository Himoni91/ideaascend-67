
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMentor } from '@/hooks/use-mentor';
import AppLayout from '@/components/layout/AppLayout';
import { MentorReviews } from '@/components/mentor/MentorReviews';
import { useAuth } from '@/contexts/AuthContext';
import { PageTransition } from '@/components/ui/page-transition';

const MentorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const { 
    useMentorProfile,
    useMentorAvailability,
    useBookMentorSession,
    useMentorReviews
  } = useMentor();
  
  // Get mentor profile
  const { data: mentor, isLoading: isLoadingMentor } = useMentorProfile(id);
  
  // Get mentor availability with proper params
  const { data: availabilitySlots, isLoading: isLoadingAvailability } = useMentorAvailability({
    mentorId: id || '',
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 14))
  });
  
  // Get mentor reviews
  const { data: reviews } = useMentorReviews(id);
  
  if (isLoadingMentor) {
    return <div>Loading mentor profile...</div>;
  }
  
  return (
    <AppLayout>
      <PageTransition>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Mentor Profile</h1>
          {mentor && (
            <div>
              <h2>{mentor.full_name || mentor.username}</h2>
              <p>{mentor.bio}</p>
              
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Reviews</h3>
                {id && <MentorReviews mentorId={id} />}
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default MentorProfile;
