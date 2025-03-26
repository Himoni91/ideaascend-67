
import { useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import CategoryTabs from "@/components/ui/CategoryTabs";
import FeedFilter from "@/components/ui/FeedFilter";
import PostCard from "@/components/ui/PostCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, profile } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFilter, setActiveFilter] = useState("all");
  const [posts, setPosts] = useState([]);
  
  const categories = ["All", "Funding", "Startup News", "Tech Trends", "Growth", "Marketing"];

  // In a real app, we would fetch posts from Supabase here
  // This is just mock data for now
  const mockPosts = [
    {
      id: 1,
      author: {
        name: "Sarah Johnson",
        avatar: "SJ",
        role: "Mentor"
      },
      category: "Startup News",
      title: "How we secured our seed round in a down market",
      content: "After 6 months of pitching to over 30 VCs, we finally closed our $1.5M seed round. Here's what worked for us in this challenging environment...",
      timestamp: "2 hours ago",
      likes: 142,
      comments: 28,
      isTrending: true,
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
    {
      id: 2,
      author: {
        name: "David Kim",
        avatar: "DK"
      },
      category: "Tech Trends",
      title: "The rise of AI tools for entrepreneurs",
      content: "New AI tools are changing how entrepreneurs build products. Here are the top 5 tools I've been using to accelerate development...",
      timestamp: "5 hours ago",
      likes: 98,
      comments: 15,
      isTrending: false,
    },
    {
      id: 3,
      author: {
        name: "Alex Rivera",
        avatar: "AR",
        role: "Mentor"
      },
      category: "Growth",
      title: "From 0 to 10,000 users without spending on ads",
      content: "We hit 10k users last month without spending a dollar on advertising. Our strategy focused on three key channels...",
      timestamp: "Yesterday",
      likes: 214,
      comments: 42,
      isTrending: true,
    },
    {
      id: 4,
      author: {
        name: "Michelle Wong",
        avatar: "MW"
      },
      category: "Funding",
      title: "Pitch deck template that got us YC interview",
      content: "Sharing the exact structure of our pitch deck that got us an interview with Y Combinator. Feel free to use this template for your startup...",
      timestamp: "2 days ago",
      likes: 175,
      comments: 34,
      isTrending: false,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    },
  ];

  useEffect(() => {
    // Set the mock posts
    setPosts(mockPosts);
  }, []);

  const filteredPosts = posts.filter(post => {
    if (activeCategory !== "All" && post.category !== activeCategory) {
      return false;
    }
    
    if (activeFilter === "trending" && !post.isTrending) {
      return false;
    }
    
    // In a real app, we would check if the user follows the author for the "following" filter
    
    return true;
  });

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-idolyst-blue to-idolyst-indigo bg-clip-text text-transparent">
            {getGreeting()}, {profile?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Discover insights, connect with mentors, and stay updated on the startup ecosystem
          </p>
        </div>

        <CategoryTabs 
          categories={categories}
          activeCategory={activeCategory}
          onChange={setActiveCategory}
        />

        <FeedFilter 
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <PostCard key={post.id} {...post} />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">
                No posts found for the selected category and filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
