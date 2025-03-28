
import { motion } from "framer-motion";

export function BadgeGrid() {
  // Mock data for badges, in a real implementation this would come from the database
  const badges = [
    { id: 1, name: "First Post", icon: "📝", description: "Published your first post", earned: true },
    { id: 2, name: "Idea Maker", icon: "💡", description: "Submitted your first idea", earned: true },
    { id: 3, name: "Connector", icon: "🔗", description: "Connected with 10+ members", earned: true },
    { id: 4, name: "Feedback Pro", icon: "🎯", description: "Provided quality feedback", earned: true },
    { id: 5, name: "Rising Star", icon: "⭐", description: "Reached level 5", earned: true },
    { id: 6, name: "Trending Post", icon: "📈", description: "Had a popular post", earned: true },
    { id: 7, name: "Mentor Favorite", icon: "🏆", description: "Got featured by a mentor", earned: true },
    { id: 8, name: "Top Contributor", icon: "👑", description: "Top weekly contributor", earned: false },
    { id: 9, name: "Pitch Perfect", icon: "🚀", description: "Highly rated pitch", earned: false },
    { id: 10, name: "Community Leader", icon: "🌟", description: "Exceptional community impact", earned: false },
    { id: 11, name: "Analytics Whiz", icon: "📊", description: "Used all analytics features", earned: false },
    { id: 12, name: "Early Adopter", icon: "🔍", description: "Joined in the first month", earned: false }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {badges.map((badge) => (
        <motion.div 
          key={badge.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.05 }}
          className={`flex flex-col items-center p-4 rounded-lg border ${
            badge.earned 
              ? "bg-card" 
              : "bg-muted/50 opacity-50"
          }`}
        >
          <div className="text-4xl mb-2">{badge.icon}</div>
          <div className="text-sm font-medium text-center">{badge.name}</div>
          <div className="text-xs text-muted-foreground text-center mt-1">{badge.description}</div>
          {!badge.earned && (
            <div className="text-xs text-muted-foreground mt-2 font-medium">Locked</div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
