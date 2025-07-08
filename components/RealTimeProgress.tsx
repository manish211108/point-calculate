"use client"
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Clock, TrendingUp, Target, Award } from 'lucide-react'

interface RealTimeProgressProps {
  userProfile: {
    name: string
    totalPoints: number
    arcadePoints: number
    bonusPoints: number
    league: string
    badges: {
      gameBadges: number
      triviaBadges: number
      skillBadges: number
      labFreeCourses: number
    }
  } | null
}

interface Milestone {
  name: string
  game: { current: number; required: number }
  trivia: { current: number; required: number }
  skill: { current: number; required: number }
  labFree: { current: number; required: number }
  bonus: number
  color: string
  completed: boolean
}

const MILESTONES: Milestone[] = [
  {
    name: "Milestone 1",
    game: { current: 0, required: 4 },
    trivia: { current: 0, required: 4 },
    skill: { current: 0, required: 10 },
    labFree: { current: 0, required: 4 },
    bonus: 2,
    color: "bg-blue-500",
    completed: false,
  },
  {
    name: "Milestone 2",
    game: { current: 0, required: 6 },
    trivia: { current: 0, required: 6 },
    skill: { current: 0, required: 20 },
    labFree: { current: 0, required: 8 },
    bonus: 8,
    color: "bg-yellow-500",
    completed: false,
  },
  {
    name: "Milestone 3",
    game: { current: 0, required: 8 },
    trivia: { current: 0, required: 7 },
    skill: { current: 0, required: 30 },
    labFree: { current: 0, required: 12 },
    bonus: 15,
    color: "bg-green-500",
    completed: false,
  },
  {
    name: "Ultimate",
    game: { current: 0, required: 10 },
    trivia: { current: 0, required: 8 },
    skill: { current: 0, required: 44 },
    labFree: { current: 0, required: 16 },
    bonus: 25,
    color: "bg-red-500",
    completed: false,
  },
]

const SWAG_TIERS = [
  { name: "Novice", points: 20, color: "bg-gray-600" },
  { name: "Trooper", points: 40, color: "bg-blue-600" },
  { name: "Ranger", points: 65, color: "bg-gray-700" },
  { name: "Champion", points: 75, color: "bg-green-600" },
  { name: "Legend", points: 85, color: "bg-yellow-600" },
]

// Custom ProgressBar for swag tier with colored fill and gray background
function SwagTierProgressBar({ value, colorClass }: { value: number; colorClass: string }) {
  return (
    <div className="relative w-full h-3 rounded-full bg-gray-300 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function RealTimeProgress({ userProfile }: RealTimeProgressProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [nextMilestone, setNextMilestone] = useState<Milestone | null>(null)
  const [progressToNextTier, setProgressToNextTier] = useState(0)
  const [nextTier, setNextTier] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!userProfile) return

    // Update milestone progress
    const updatedMilestones = MILESTONES.map(milestone => ({
      ...milestone,
      game: { ...milestone.game, current: userProfile.badges.gameBadges },
      trivia: { ...milestone.trivia, current: userProfile.badges.triviaBadges },
      skill: { ...milestone.skill, current: userProfile.badges.skillBadges },
      labFree: { ...milestone.labFree, current: userProfile.badges.labFreeCourses },
      completed: 
        userProfile.badges.gameBadges >= milestone.game.required &&
        userProfile.badges.triviaBadges >= milestone.trivia.required &&
        userProfile.badges.skillBadges >= milestone.skill.required &&
        userProfile.badges.labFreeCourses >= milestone.labFree.required
    }))

    // Find next incomplete milestone
    const next = updatedMilestones.find(m => !m.completed) || null
    setNextMilestone(next)

    // Find the highest tier the user qualifies for
    let actualIndex = -1;
    for (let i = SWAG_TIERS.length - 1; i >= 0; i--) {
      if (userProfile.totalPoints >= SWAG_TIERS[i].points) {
        actualIndex = i;
        break;
      }
    }
    if (actualIndex >= 0 && actualIndex < SWAG_TIERS.length - 1) {
      const currentTier = SWAG_TIERS[actualIndex];
      const nextTierData = SWAG_TIERS[actualIndex + 1];
      const progress = ((userProfile.totalPoints - currentTier.points) /
                       (nextTierData.points - currentTier.points)) * 100
      setProgressToNextTier(Math.min(progress, 100))
      setNextTier(nextTierData.name)
    } else if (actualIndex === SWAG_TIERS.length - 1) {
      // User has reached the highest tier
      setProgressToNextTier(100)
      setNextTier('Legend')
    } else {
      // User hasn't reached any tier yet
      const firstTier = SWAG_TIERS[0]
      const progress = (userProfile.totalPoints / firstTier.points) * 100
      setProgressToNextTier(Math.min(progress, 100))
      setNextTier(firstTier.name)
    }
  }, [userProfile])

  if (!userProfile) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6 text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p className="text-slate-300">Enter a profile URL to see real-time progress</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Real-time Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Real-time Progress
            <div className="inline-flex items-center rounded-full bg-green-500 text-white px-2.5 py-0.5 text-xs font-semibold ml-2">
              <Clock className="w-3 h-3 mr-1" />
              Live
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-400">
            Last updated: {currentTime.toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{userProfile.totalPoints}</div>
            <div className="text-slate-300 text-sm">Total Points</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{userProfile.arcadePoints}</div>
            <div className="text-slate-300 text-sm">Arcade Points</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{userProfile.bonusPoints}</div>
            <div className="text-slate-300 text-sm">Bonus Points</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Tier */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Target className="w-5 h-5 text-blue-400" />
            Progress to {nextTier}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Current: {userProfile.totalPoints} points</span>
              <span className="text-slate-300">{Math.round(progressToNextTier)}%</span>
            </div>
            {/* Swag Tier ProgressBar with color */}
            {(() => {
              const tierObj = SWAG_TIERS.find(t => t.name === nextTier);
              const colorClass = tierObj ? tierObj.color : 'bg-blue-600';
              return (
                <SwagTierProgressBar value={progressToNextTier} colorClass={colorClass} />
              );
            })()}
            <div className="text-xs text-slate-400">
              {nextTier !== 'Legend' ? 
                `Next tier: ${nextTier} (${SWAG_TIERS.find(t => t.name === nextTier)?.points} points)` :
                'You have reached the highest tier!'
              }
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Milestone */}
      {nextMilestone && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Award className="w-5 h-5 text-yellow-400" />
              Next Milestone: {nextMilestone.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-300">Game Badges:</span>
                  <span className="text-white ml-2">
                    {nextMilestone.game.current}/{nextMilestone.game.required}
                  </span>
                </div>
                <div>
                  <span className="text-slate-300">Trivia Badges:</span>
                  <span className="text-white ml-2">
                    {nextMilestone.trivia.current}/{nextMilestone.trivia.required}
                  </span>
                </div>
                <div>
                  <span className="text-slate-300">Skill Badges:</span>
                  <span className="text-white ml-2">
                    {nextMilestone.skill.current}/{nextMilestone.skill.required}
                  </span>
                </div>
                <div>
                  <span className="text-slate-300">Lab-free Courses:</span>
                  <span className="text-white ml-2">
                    {nextMilestone.labFree.current}/{nextMilestone.labFree.required}
                  </span>
                </div>
              </div>
              <div className="text-sm text-yellow-400">
                Bonus Points Available: {nextMilestone.bonus}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badge Progress */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Badge Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{userProfile.badges.gameBadges}</div>
              <div className="text-slate-300 text-sm">Game Badges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{userProfile.badges.triviaBadges}</div>
              <div className="text-slate-300 text-sm">Trivia Badges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{userProfile.badges.skillBadges}</div>
              <div className="text-slate-300 text-sm">Skill Badges</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{userProfile.badges.labFreeCourses}</div>
              <div className="text-slate-300 text-sm">Lab-free Courses</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 