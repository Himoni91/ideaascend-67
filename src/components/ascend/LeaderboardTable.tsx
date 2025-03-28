
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LeaderboardEntry } from "@/types/ascend";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
  currentUserId?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
  highlightUser?: boolean;
}

export function LeaderboardTable({ 
  data, 
  currentUserId, 
  showViewAll = false, 
  onViewAll,
  highlightUser = false 
}: LeaderboardTableProps) {
  const navigate = useNavigate();
  
  const handleRowClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };
  
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="pb-2 text-left font-medium text-muted-foreground">Rank</th>
              <th className="pb-2 text-left font-medium text-muted-foreground">User</th>
              <th className="pb-2 text-left font-medium text-muted-foreground">Level</th>
              <th className="pb-2 text-right font-medium text-muted-foreground">XP</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr 
                key={entry.id}
                onClick={() => handleRowClick(entry.user_id)}
                className={cn(
                  "border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors",
                  entry.user_id === currentUserId && highlightUser ? "bg-primary/5" : ""
                )}
              >
                <td className="py-3 pr-4">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                    entry.rank === 1 ? "bg-yellow-100 text-yellow-800" :
                    entry.rank === 2 ? "bg-gray-100 text-gray-800" :
                    entry.rank === 3 ? "bg-amber-100 text-amber-800" :
                    "text-muted-foreground"
                  )}>
                    {entry.rank}
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-xs">
                      {entry.avatar_url ? (
                        <img 
                          src={entry.avatar_url} 
                          alt={entry.username} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        entry.username?.substring(0, 2).toUpperCase() || '??'
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{entry.full_name || entry.username}</div>
                      <div className="text-xs text-muted-foreground">@{entry.username}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                      {entry.level}
                    </div>
                  </div>
                </td>
                <td className="py-3 text-right font-medium">
                  {entry.xp.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showViewAll && onViewAll && (
        <div className="mt-4 text-right">
          <Button variant="ghost" size="sm" onClick={onViewAll} className="text-sm">
            View Full Leaderboard
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
