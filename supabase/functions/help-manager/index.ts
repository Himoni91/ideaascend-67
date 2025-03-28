
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Create Supabase clients
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Check if user is admin (using a role check pattern)
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);
      
    const isAdmin = roles?.some(r => r.role === 'admin');
    
    // Parse request
    const { path, method } = await req.json();
    
    // Handle different endpoints
    if (path === '/articles' && method === 'POST' && isAdmin) {
      return handleCreateArticle(req, supabaseAdmin);
    } 
    else if (path.startsWith('/articles/') && method === 'PUT' && isAdmin) {
      const id = path.replace('/articles/', '');
      return handleUpdateArticle(req, supabaseAdmin, id);
    }
    else if (path.startsWith('/articles/') && method === 'DELETE' && isAdmin) {
      const id = path.replace('/articles/', '');
      return handleDeleteArticle(supabaseAdmin, id);
    }
    else if (path === '/categories' && method === 'POST' && isAdmin) {
      return handleCreateCategory(req, supabaseAdmin);
    }
    else if (path.startsWith('/categories/') && method === 'PUT' && isAdmin) {
      const id = path.replace('/categories/', '');
      return handleUpdateCategory(req, supabaseAdmin, id);
    }
    else if (path.startsWith('/categories/') && method === 'DELETE' && isAdmin) {
      const id = path.replace('/categories/', '');
      return handleDeleteCategory(supabaseAdmin, id);
    }
    else if (path === '/seed' && method === 'POST' && isAdmin) {
      return handleSeedArticles(supabaseAdmin);
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found or insufficient permissions' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper functions for handling requests
async function handleCreateArticle(req: Request, supabase: any) {
  const { article } = await req.json();
  
  const { data, error } = await supabase
    .from('help_articles')
    .insert(article)
    .select()
    .single();
    
  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
  
  return new Response(
    JSON.stringify({ article: data }),
    {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handleUpdateArticle(req: Request, supabase: any, id: string) {
  const { article } = await req.json();
  
  const { data, error } = await supabase
    .from('help_articles')
    .update(article)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
  
  return new Response(
    JSON.stringify({ article: data }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handleDeleteArticle(supabase: any, id: string) {
  const { error } = await supabase
    .from('help_articles')
    .delete()
    .eq('id', id);
    
  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
  
  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handleCreateCategory(req: Request, supabase: any) {
  const { category } = await req.json();
  
  const { data, error } = await supabase
    .from('help_categories')
    .insert(category)
    .select()
    .single();
    
  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
  
  return new Response(
    JSON.stringify({ category: data }),
    {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handleUpdateCategory(req: Request, supabase: any, id: string) {
  const { category } = await req.json();
  
  const { data, error } = await supabase
    .from('help_categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
  
  return new Response(
    JSON.stringify({ category: data }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handleDeleteCategory(supabase: any, id: string) {
  const { error } = await supabase
    .from('help_categories')
    .delete()
    .eq('id', id);
    
  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
  
  return new Response(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handleSeedArticles(supabase: any) {
  // Sample articles for each category
  const sampleArticles = [
    {
      title: "Getting Started with Idolyst",
      slug: "getting-started-guide",
      content: `
        <h2>Welcome to Idolyst!</h2>
        <p>This guide will help you get started with our platform and make the most of its features.</p>

        <h3>Setting Up Your Account</h3>
        <p>After signing up, the first step is to complete your profile:</p>
        <ul>
          <li>Upload a profile picture</li>
          <li>Add your professional information</li>
          <li>Connect your social media accounts</li>
          <li>Set your preferences</li>
        </ul>

        <h3>Exploring the Platform</h3>
        <p>The platform has several main sections:</p>
        <ul>
          <li><strong>Launchpad</strong>: Your home feed with updates and content</li>
          <li><strong>PitchHub</strong>: Share and validate your startup ideas</li>
          <li><strong>MentorSpace</strong>: Connect with mentors in your field</li>
          <li><strong>Ascend</strong>: Track your progress and achievements</li>
        </ul>

        <p>Take some time to explore each section to understand how they can help your professional journey.</p>

        <h3>Getting Help</h3>
        <p>If you need assistance at any point, you can:</p>
        <ul>
          <li>Visit this Help Center</li>
          <li>Contact our support team</li>
          <li>Join our community forums</li>
        </ul>
      `,
      category_id: null, // Will be set after fetching categories
      is_featured: true
    },
    {
      title: "How to Update Your Profile",
      slug: "update-profile-guide",
      content: `
        <h2>Updating Your Profile</h2>
        <p>A complete and up-to-date profile helps you connect with the right people and opportunities.</p>

        <h3>Accessing Profile Settings</h3>
        <p>To update your profile:</p>
        <ol>
          <li>Click on your profile picture in the top-right corner</li>
          <li>Select "Profile Settings" from the dropdown menu</li>
          <li>Navigate to the "Edit Profile" tab</li>
        </ol>

        <h3>What to Include</h3>
        <p>For a comprehensive profile, make sure to include:</p>
        <ul>
          <li><strong>Professional Summary</strong>: A brief description of your background and expertise</li>
          <li><strong>Work Experience</strong>: Your current and past positions</li>
          <li><strong>Education</strong>: Your academic background</li>
          <li><strong>Skills</strong>: Technical and soft skills you possess</li>
          <li><strong>Achievements</strong>: Notable accomplishments in your career</li>
        </ul>

        <h3>Profile Visibility</h3>
        <p>You can control who sees your profile information through the Privacy Settings tab. Options include:</p>
        <ul>
          <li>Public: Visible to everyone</li>
          <li>Connections Only: Visible to your connections</li>
          <li>Private: Visible only to you</li>
        </ul>
      `,
      category_id: null,
      is_featured: false
    },
    {
      title: "Submitting Your First Pitch Idea",
      slug: "first-pitch-submission",
      content: `
        <h2>Creating Your First Pitch on PitchHub</h2>
        <p>PitchHub is where you can share your startup ideas, get feedback, and validate your concepts.</p>

        <h3>Step 1: Prepare Your Pitch</h3>
        <p>Before submitting, make sure you have:</p>
        <ul>
          <li>A clear problem statement</li>
          <li>Your proposed solution</li>
          <li>Target audience definition</li>
          <li>Basic business model ideas</li>
        </ul>

        <h3>Step 2: Submit Your Pitch</h3>
        <ol>
          <li>Navigate to the PitchHub section</li>
          <li>Click on "Submit New Pitch"</li>
          <li>Fill out the form with your pitch details</li>
          <li>Add relevant tags to help others discover your pitch</li>
          <li>Include any relevant media (optional)</li>
          <li>Review and submit</li>
        </ol>

        <h3>Step 3: Engage With Feedback</h3>
        <p>After submission:</p>
        <ul>
          <li>Share your pitch with your network</li>
          <li>Respond to comments and questions</li>
          <li>Thank users for their feedback</li>
          <li>Consider incorporating constructive suggestions</li>
        </ul>

        <h3>Tips for Success</h3>
        <p>To get the most valuable feedback:</p>
        <ul>
          <li>Be concise and clear in your description</li>
          <li>Address potential objections proactively</li>
          <li>Ask specific questions you want feedback on</li>
          <li>Engage with other pitches to build community</li>
        </ul>
      `,
      category_id: null,
      is_featured: true
    },
    {
      title: "Finding and Booking a Mentor",
      slug: "finding-booking-mentor",
      content: `
        <h2>How to Find and Book a Mentor</h2>
        <p>MentorSpace connects you with experienced professionals who can provide guidance and insights.</p>

        <h3>Finding the Right Mentor</h3>
        <p>To find a mentor that matches your needs:</p>
        <ol>
          <li>Navigate to the MentorSpace section</li>
          <li>Use filters to narrow down by expertise, industry, or availability</li>
          <li>Review mentor profiles, including their background and reviews</li>
          <li>Create a shortlist of potential mentors</li>
        </ol>

        <h3>Booking a Session</h3>
        <p>Once you've found a mentor you'd like to connect with:</p>
        <ol>
          <li>Go to their profile</li>
          <li>Select "Book a Session"</li>
          <li>Choose a session type (e.g., 30-minute introduction, 60-minute deep dive)</li>
          <li>Select an available time slot</li>
          <li>Include session topics and questions</li>
          <li>Complete the booking process</li>
        </ol>

        <h3>Preparing for Your Session</h3>
        <p>To make the most of your mentoring session:</p>
        <ul>
          <li>Define clear goals for what you want to achieve</li>
          <li>Prepare specific questions</li>
          <li>Share relevant background information in advance</li>
          <li>Be punctual and respect the mentor's time</li>
          <li>Take notes during the session</li>
        </ul>

        <h3>After the Session</h3>
        <p>Follow these steps after your mentoring session:</p>
        <ul>
          <li>Thank your mentor</li>
          <li>Leave a review to help others</li>
          <li>Follow up on action items discussed</li>
          <li>Consider booking follow-up sessions if beneficial</li>
        </ul>
      `,
      category_id: null,
      is_featured: false
    },
    {
      title: "Understanding the Ascend System",
      slug: "ascend-system-guide",
      content: `
        <h2>The Ascend Gamification System</h2>
        <p>Ascend is our gamification system that rewards engagement and contribution on the platform.</p>

        <h3>How to Earn XP</h3>
        <p>Experience Points (XP) can be earned through various activities:</p>
        <ul>
          <li>Creating posts (+10 XP)</li>
          <li>Submitting pitch ideas (+20 XP)</li>
          <li>Providing feedback on pitches (+5 XP)</li>
          <li>Completing your profile (+15 XP)</li>
          <li>Participating in mentoring sessions (+25 XP)</li>
          <li>Daily logins (+1 XP)</li>
        </ul>

        <h3>Levels and Ranks</h3>
        <p>As you earn XP, you'll progress through levels:</p>
        <ul>
          <li><strong>Level 1-5</strong>: Novice</li>
          <li><strong>Level 6-15</strong>: Explorer</li>
          <li><strong>Level 16-30</strong>: Innovator</li>
          <li><strong>Level 31-50</strong>: Pioneer</li>
          <li><strong>Level 51+</strong>: Visionary</li>
        </ul>

        <h3>Badges and Achievements</h3>
        <p>Badges are awarded for specific accomplishments:</p>
        <ul>
          <li>"First Pitch" - Submit your first pitch idea</li>
          <li>"Mentor Match" - Complete your first mentoring session</li>
          <li>"Feedback Guru" - Provide feedback on 10 different pitches</li>
          <li>"Networking Pro" - Connect with 20 users</li>
          <li>"Content Creator" - Publish 15 posts</li>
        </ul>

        <h3>Leaderboards</h3>
        <p>Compete with others and track your progress on our leaderboards:</p>
        <ul>
          <li>Weekly Leaderboard - Resets every Monday</li>
          <li>Monthly Leaderboard - Resets on the 1st of each month</li>
          <li>All-Time Leaderboard - Cumulative rankings</li>
        </ul>

        <h3>Benefits and Rewards</h3>
        <p>Higher levels and achievements unlock various benefits:</p>
        <ul>
          <li>Enhanced profile visibility</li>
          <li>Access to exclusive events</li>
          <li>Priority support</li>
          <li>Featured placement for your pitches</li>
          <li>Discounts on premium features</li>
        </ul>
      `,
      category_id: null,
      is_featured: true
    },
    {
      title: "Building Your Network on Idolyst",
      slug: "building-network-guide",
      content: `
        <h2>Building Your Professional Network</h2>
        <p>Networking is essential for professional growth. Here's how to expand your connections on Idolyst.</p>

        <h3>Finding Relevant Connections</h3>
        <p>Discover people to connect with through:</p>
        <ul>
          <li>Discover tab - Browse professionals by industry or expertise</li>
          <li>Post comments - Engage with others' content</li>
          <li>PitchHub - Connect with those who share or comment on similar ideas</li>
          <li>Events - Virtual and in-person networking opportunities</li>
          <li>Mutual connections - Explore your existing network's connections</li>
        </ul>

        <h3>Making Meaningful Connections</h3>
        <p>Quality matters more than quantity. When connecting:</p>
        <ol>
          <li>Personalize your connection requests</li>
          <li>Explain why you're interested in connecting</li>
          <li>Reference shared interests or experiences</li>
          <li>Be specific about potential mutual benefits</li>
        </ol>

        <h3>Nurturing Your Network</h3>
        <p>Maintain and strengthen your connections by:</p>
        <ul>
          <li>Regularly engaging with connections' content</li>
          <li>Sharing valuable insights and resources</li>
          <li>Offering help without expecting immediate returns</li>
          <li>Celebrating others' achievements</li>
          <li>Following up after meaningful interactions</li>
        </ul>

        <h3>Leveraging Your Network</h3>
        <p>Use your network effectively for:</p>
        <ul>
          <li>Gathering feedback on your ideas</li>
          <li>Finding potential collaborators</li>
          <li>Requesting introductions to specific contacts</li>
          <li>Seeking advice on professional challenges</li>
          <li>Sharing opportunities that might benefit others</li>
        </ul>
      `,
      category_id: null,
      is_featured: false
    },
    {
      title: "Troubleshooting Login Issues",
      slug: "login-troubleshooting",
      content: `
        <h2>Resolving Login Problems</h2>
        <p>If you're having trouble logging in to your account, follow these steps to resolve common issues.</p>

        <h3>Forgot Password</h3>
        <p>If you can't remember your password:</p>
        <ol>
          <li>Click "Forgot Password" on the login screen</li>
          <li>Enter the email address associated with your account</li>
          <li>Check your email for password reset instructions</li>
          <li>Follow the link to create a new password</li>
          <li>Use your new password to log in</li>
        </ol>

        <h3>Email Verification Issues</h3>
        <p>If you haven't received your verification email:</p>
        <ol>
          <li>Check your spam/junk folder</li>
          <li>Ensure you entered the correct email address</li>
          <li>Click "Resend Verification Email" on the login page</li>
          <li>Add noreply@idolyst.com to your safe senders list</li>
        </ol>

        <h3>Account Locked</h3>
        <p>Your account may be temporarily locked after multiple failed login attempts:</p>
        <ol>
          <li>Wait 30 minutes before trying again</li>
          <li>Use the "Forgot Password" option to reset your credentials</li>
          <li>If still locked, contact support with your account details</li>
        </ol>

        <h3>Browser Issues</h3>
        <p>Try these troubleshooting steps:</p>
        <ul>
          <li>Clear your browser cache and cookies</li>
          <li>Try a different browser</li>
          <li>Disable browser extensions that might interfere</li>
          <li>Ensure JavaScript is enabled</li>
        </ul>

        <h3>Still Having Problems?</h3>
        <p>If you've tried these steps and still can't log in:</p>
        <ul>
          <li>Contact our support team at support@idolyst.com</li>
          <li>Include your username and detailed description of the issue</li>
          <li>Mention any error messages you're seeing</li>
          <li>Specify what device and browser you're using</li>
        </ul>
      `,
      category_id: null,
      is_featured: false
    }
  ];

  try {
    // Fetch categories to assign to articles
    const { data: categories, error: categoriesError } = await supabase
      .from('help_categories')
      .select('id, slug');
      
    if (categoriesError) throw categoriesError;
    
    // Map articles to categories
    const articlesWithCategories = sampleArticles.map(article => {
      const categorySlug = article.slug.includes('getting-started') ? 'getting-started' :
                          article.slug.includes('profile') ? 'account-profile' :
                          article.slug.includes('pitch') ? 'pitchhub' :
                          article.slug.includes('mentor') ? 'mentorspace' :
                          article.slug.includes('ascend') ? 'ascend' :
                          article.slug.includes('network') ? 'networking' :
                          'troubleshooting';
                          
      const category = categories.find(c => c.slug === categorySlug);
      
      return {
        ...article,
        category_id: category?.id || categories[0].id
      };
    });
    
    // Insert articles
    const { data: articles, error: articlesError } = await supabase
      .from('help_articles')
      .insert(articlesWithCategories)
      .select();
      
    if (articlesError) throw articlesError;
    
    // Add tags for articles
    const tags = [
      { article_id: articles[0].id, tag: 'beginner' },
      { article_id: articles[0].id, tag: 'onboarding' },
      { article_id: articles[1].id, tag: 'profile' },
      { article_id: articles[1].id, tag: 'settings' },
      { article_id: articles[2].id, tag: 'pitch' },
      { article_id: articles[2].id, tag: 'startup' },
      { article_id: articles[3].id, tag: 'mentor' },
      { article_id: articles[3].id, tag: 'coaching' },
      { article_id: articles[4].id, tag: 'gamification' },
      { article_id: articles[4].id, tag: 'rewards' },
      { article_id: articles[5].id, tag: 'networking' },
      { article_id: articles[5].id, tag: 'connections' },
      { article_id: articles[6].id, tag: 'troubleshooting' },
      { article_id: articles[6].id, tag: 'login' }
    ];
    
    const { error: tagsError } = await supabase
      .from('help_article_tags')
      .insert(tags);
      
    if (tagsError) throw tagsError;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Sample articles added successfully',
        articles: articles.length
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
