import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface AchievementSectionProps {
  achievements: Achievement[];
  isEditable?: boolean;
}

export function AchievementSection({ achievements, isEditable = false }: AchievementSectionProps) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Achievements</h2>
        {isEditable && (
          <Button variant="ghost" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Achievement
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="flex gap-4">
            <div className="mt-1">
              <Trophy className="h-5 w-5 text-green-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium">{achievement.title}</h3>
              {achievement.description && (
                <p className="text-sm text-muted-foreground">{achievement.description}</p>
              )}
              <p className="text-sm text-muted-foreground">
                {new Date(achievement.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}