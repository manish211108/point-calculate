import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface PointCalculation {
  badgePoints: number;
  milestoneBonus: number;
  totalPoints: number;
  currentTier: string;
  nextTier: string;
  progressToNextTier: number;
  milestoneProgress: {
    current: string;
    next: string;
    progress: number;
  };
  breakdown: {
    gameBadges: number;
    triviaBadges: number;
    skillBadges: number;
    specialGameBadges: number;
    skillBadgePoints: number;
  };
}

interface PointCalculationDisplayProps {
  pointCalculation: PointCalculation;
}

// Color mapping for milestones
const milestoneColorMap: Record<string, string> = {
  'Milestone 1': 'bg-blue-500',
  'Milestone 2': 'bg-yellow-500',
  'Milestone 3': 'bg-green-500',
  'Ultimate': 'bg-red-500',
  'Ultimate Milestone': 'bg-red-500',
};

// Custom ProgressBar for milestone with gradient colored fill and black background
interface MilestoneProgressBarProps {
  value: number;
  colorClass?: string; // Not used for gradient, but kept for compatibility
}
function MilestoneProgressBar({ value, colorClass }: MilestoneProgressBarProps) {
  return (
    <div className="relative w-full h-2 rounded-full bg-gray-300 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

// Swag tier color mapping for progress bar and text
const SWAG_TIERS = [
  { name: "Novice", points: 20, color: "bg-gray-600", text: "text-gray-400" },
  { name: "Trooper", points: 40, color: "bg-blue-600", text: "text-blue-400" },
  { name: "Ranger", points: 65, color: "bg-gray-700", text: "text-gray-300" },
  { name: "Champion", points: 75, color: "bg-green-600", text: "text-green-400" },
  { name: "Legend", points: 85, color: "bg-yellow-600", text: "text-yellow-400" }
];

// Helper to normalize tier names for matching
function normalizeTierName(name: string) {
  return name.toLowerCase().replace(/^arcade\s+/, '').trim();
}

export function PointCalculationDisplay({ pointCalculation }: PointCalculationDisplayProps) {
  const {
    badgePoints,
    milestoneBonus,
    totalPoints,
    currentTier,
    nextTier,
    progressToNextTier,
    milestoneProgress,
    breakdown
  } = pointCalculation;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Total Points Summary */}
      <Card className="rounded-lg border text-card-foreground shadow-sm bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-white justify-between">
            <span>Total Arcade Points</span>
            <Badge variant="secondary" className="text-lg font-bold">
              {totalPoints} Points
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-300">Badge Points:</span>
              <span className="ml-2 font-medium text-orange-400">{badgePoints}</span>
            </div>
            <div>
              <span className="text-slate-300">Milestone Bonus:</span>
              <span className="ml-2 font-medium text-green-600">+{milestoneBonus}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Point Breakdown */}
      <Card className="rounded-lg border text-card-foreground shadow-sm bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-white">Point Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Game Badges ({breakdown.gameBadges} × 1 point)</span>
              <Badge className="bg-slate-700 text-white font-semibold">{breakdown.gameBadges} points</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Trivia Badges ({breakdown.triviaBadges} × 1 point)</span>
              <Badge className="bg-slate-700 text-white font-semibold">{breakdown.triviaBadges} points</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Skill Badges ({breakdown.skillBadges} badges ÷ 2)</span>
              <Badge className="bg-slate-700 text-white font-semibold">{breakdown.skillBadgePoints} points</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Special Game Badges ({breakdown.specialGameBadges} × 2 points)</span>
              <Badge className="bg-slate-700 text-white font-semibold">{breakdown.specialGameBadges} points</Badge>
            </div>
            <Separator />
            <div className="text-slate-300">
              <span>Total Badge Points </span>
              <Badge className="bg-white text-black text-lg font-bold">{badgePoints} points</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Swag Tier Progress */}
      <Card className="rounded-lg border text-card-foreground shadow-sm bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-white">Swag Tier Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const nextTierObj = SWAG_TIERS.find(t => normalizeTierName(t.name) === normalizeTierName(nextTier));
            const progressBarColor = nextTierObj ? nextTierObj.color : "bg-blue-600";
            const progressTextColor = nextTierObj ? nextTierObj.text : "text-blue-400";
            return (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Current Tier</span>
                  <Badge variant="default" className="bg-white text-black text-lg font-bold">{currentTier}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Next Tier</span>
                  <Badge variant="outline" className="bg-white text-black text-lg font-bold">{nextTier}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Progress to {nextTier}</span>
                    <span className={progressTextColor}>{Math.round(progressToNextTier)}%</span>
                  </div>
                  <div className="relative w-full h-2 rounded-full bg-gray-300 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${progressBarColor}`}
                      style={{ width: `${progressToNextTier}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Milestone Progress */}
      <Card className="rounded-lg border text-card-foreground shadow-sm bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-white">Milestone Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const milestoneBarColor =
              milestoneColorMap[milestoneProgress.next] ||
              milestoneColorMap[milestoneProgress.current] ||
              'bg-blue-500';
            return (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Current Milestone</span>
                  <Badge variant="default" className="bg-white text-black text-lg font-bold">{milestoneProgress.current}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Next Milestone</span>
                  <Badge variant="outline" className="bg-white text-black text-lg font-bold">{milestoneProgress.next}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">Progress to {milestoneProgress.next}</span>
                    {(() => {
                      const milestoneTextColor =
                        milestoneColorMap[milestoneProgress.next]?.replace('bg-', 'text-') ||
                        milestoneColorMap[milestoneProgress.current]?.replace('bg-', 'text-') ||
                        'text-blue-500';
                      return (
                        <span className={milestoneTextColor}>{Math.round(milestoneProgress.progress)}%</span>
                      );
                    })()}
                  </div>
                  {/* Use colored progress bar for milestone */}
                  <MilestoneProgressBar
                    value={milestoneProgress.progress}
                    colorClass={milestoneBarColor}
                  />
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* Point System Rules */}
      <Card className="rounded-lg border text-card-foreground shadow-sm bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-white">Point System Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Game Badges:</span>
              <span className="text-slate-300">1 point each</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Trivia Badges:</span>
              <span className="text-slate-300">1 point each</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Skill Badges:</span>
              <span className="text-slate-300">1 point per 2 badges</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Special Game Badges:</span>
              <span className="text-slate-300">2 points each</span>
            </div>
            <Separator />
            <div className="text-xs text-slate-300">
              <p>• Milestone bonuses are awarded for achieving specific badge combinations</p>
              <p>• Only the highest achieved milestone bonus is applied</p>
              <p>• Lab-free courses count toward milestone eligibility but don't award points directly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 