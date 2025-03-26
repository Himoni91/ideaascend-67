
import { ReactNode } from "react";

interface PostCardProps {
  author: {
    name: string;
    avatar: string;
    role?: string;
  };
  category: string;
  title: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isTrending?: boolean;
  image?: string;
}

const PostCard = ({
  author,
  category,
  title,
  content,
  timestamp,
  likes,
  comments,
  isTrending = false,
  image,
}: PostCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] animate-scale-in">
      <div className="p-4">
        {/* Author */}
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-idolyst-blue to-idolyst-indigo flex items-center justify-center text-white">
            <span className="text-sm font-medium">{author.avatar}</span>
          </div>
          <div className="ml-3">
            <div className="flex items-center">
              <p className="text-sm font-medium">{author.name}</p>
              {author.role && (
                <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-xs">
                  {author.role}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">{timestamp}</p>
          </div>
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center mb-2">
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full mr-2">
              {category}
            </span>
            {isTrending && (
              <span className="text-xs px-2 py-1 bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100 rounded-full flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                  <polyline points="17 6 23 6 23 12"></polyline>
                </svg>
                Trending
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {content}
          </p>

          {/* Image */}
          {image && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img
                src={image}
                alt={title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Engagement */}
          <div className="flex items-center text-sm text-gray-500">
            <button className="mr-4 flex items-center hover:text-idolyst-blue transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M7 10v12"></path>
                <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"></path>
              </svg>
              {likes}
            </button>
            <button className="mr-4 flex items-center hover:text-idolyst-blue transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {comments}
            </button>
            <button className="flex items-center hover:text-idolyst-blue transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
