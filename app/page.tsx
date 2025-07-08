"use client"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import {
  Trophy,
  Award,
  Star,
  Zap,
  Bell,
  Home,
  Calculator,
  Info,
  HelpCircle,
  Twitter,
  Linkedin,
  MessageCircle,
  Send,
  Facebook,
  Link,
  BarChart3,
  Eye,
  Monitor,
  Shield,
  Clock,
  ChevronDown,
  Crown,
  Medal,
  Users,
} from "lucide-react"
import RealTimeProgress from "@/components/RealTimeProgress"
import { PointCalculationDisplay } from "@/components/PointCalculationDisplay"
import emailjs from 'emailjs-com'
import Footer from "@/components/Footer"

interface UserProfile {
  name: string
  avatar: string
  league: string
  totalPoints: number
  arcadePoints: number
  bonusPoints: number
  badges: {
    gameBadges: number
    triviaBadges: number
    skillBadges: number
    labFreeCourses: number
  }
  swagEligibility: string
  facilitatorProgram: boolean
  pointCalculation?: {
    badgePoints: number
    milestoneBonus: number
    totalPoints: number
    currentTier: string
    nextTier: string
    progressToNextTier: number
    milestoneProgress: {
      current: string
      next: string
      progress: number
    }
    breakdown: {
      gameBadges: number
      triviaBadges: number
      skillBadges: number
      specialGameBadges: number
      skillBadgePoints: number
    }
  }
  allBadgeDetails?: {
    title: string;
    dateEarned?: string;
    point?: number;
  }[];
}

interface LeaderboardEntry {
  id: number
  name: string
  avatar?: string
  points: number
  tier: string
  badges: number
}

const SWAG_TIERS = [
  { name: "Novice", points: 20, color: "bg-gray-600", image: "/Novice.png" },
  { name: "Trooper", points: 40, color: "bg-blue-600", image: "/Trooper.png" },
  { name: "Ranger", points: 65, color: "bg-gray-700", image: "/Ranger.png" },
  { name: "Champion", points: 75, color: "bg-green-600", image: "/Champion.png" },
  { name: "Legend", points: 85, color: "bg-yellow-600", image: "/Legend.png" }
]

const MILESTONES = [
  {
    name: "Milestone 1",
    game: { current: 4, required: 4 },
    trivia: { current: 4, required: 4 },
    skill: { current: 10, required: 10 },
    labFree: { current: 4, required: 4 },
    bonus: 2,
    color: "bg-blue-500",
    completed: true,
  },
  {
    name: "Milestone 2",
    game: { current: 6, required: 6 },
    trivia: { current: 6, required: 6 },
    skill: { current: 20, required: 20 },
    labFree: { current: 8, required: 8 },
    bonus: 8,
    color: "bg-yellow-500",
    completed: true,
  },
  {
    name: "Milestone 3",
    game: { current: 8, required: 8 },
    trivia: { current: 7, required: 7 },
    skill: { current: 30, required: 30 },
    labFree: { current: 12, required: 12 },
    bonus: 15,
    color: "bg-green-500",
    completed: true,
  },
  {
    name: "Ultimate",
    game: { current: 10, required: 10 },
    trivia: { current: 8, required: 8 },
    skill: { current: 44, required: 44 },
    labFree: { current: 16, required: 16 },
    bonus: 25,
    color: "bg-red-500",
    completed: true,
  },
]

// Helper to normalize tier and milestone names for matching
function normalizeTierName(name: string) {
  return name.toLowerCase().replace(/^arcade\s+/, '').trim();
}
function normalizeMilestoneName(name: string) {
  return name.toLowerCase().replace(/milestone/g, '').replace(/ultimate/g, '').replace(/\s+/g, '').trim();
}

// Helper to calculate milestone progress
function getMilestoneProgress(
  userBadges: {
    gameBadges?: number;
    triviaBadges?: number;
    skillBadges?: number;
    labFreeCourses?: number;
  } | undefined,
  milestone: {
    game: { required: number };
    trivia: { required: number };
    skill: { required: number };
    labFree: { required: number };
    bonus: number;
    color: string;
    name: string;
  }
) {
  const game = Math.min(userBadges?.gameBadges || 0, milestone.game.required);
  const trivia = Math.min(userBadges?.triviaBadges || 0, milestone.trivia.required);
  const skill = Math.min(userBadges?.skillBadges || 0, milestone.skill.required);
  const labFree = Math.min(userBadges?.labFreeCourses || 0, milestone.labFree.required);
  const gamePct = (game / milestone.game.required) * 100;
  const triviaPct = (trivia / milestone.trivia.required) * 100;
  const skillPct = (skill / milestone.skill.required) * 100;
  const labFreePct = (labFree / milestone.labFree.required) * 100;
  const avgPct = (gamePct + triviaPct + skillPct + labFreePct) / 4;
  return {
    game, trivia, skill, labFree,
    gameRequired: milestone.game.required,
    triviaRequired: milestone.trivia.required,
    skillRequired: milestone.skill.required,
    labFreeRequired: milestone.labFree.required,
    avgPct: Math.round(avgPct)
  };
}

// Custom ProgressBar for milestone with colored fill and black background
interface MilestoneProgressBarProps {
  value: number;
  colorClass: string;
}
function MilestoneProgressBar({ value, colorClass }: MilestoneProgressBarProps) {
  return (
    <div className="relative w-full h-2 rounded-full bg-black overflow-hidden">
      <div
        className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${colorClass}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function getNextTierAndProgress(currentTier: string, totalPoints: number) {
  // Sort tiers by points ascending
  const sortedTiers = [...SWAG_TIERS].sort((a, b) => a.points - b.points);
  // Normalize current tier name for matching
  const currentIdx = sortedTiers.findIndex(t => normalizeTierName(t.name) === normalizeTierName(currentTier));
  if (currentIdx === -1) {
    // Not in any tier yet
    return {
      nextTier: sortedTiers[0].name,
      progressToNextTier: Math.min((totalPoints / sortedTiers[0].points) * 100, 100)
    };
  }
  if (currentIdx === sortedTiers.length - 1) {
    // Already at max tier
    return {
      nextTier: "Maximum Tier Reached",
      progressToNextTier: 100
    };
  }
  const currentTierPoints = sortedTiers[currentIdx].points;
  const nextTier = sortedTiers[currentIdx + 1];
  const progress = ((totalPoints - currentTierPoints) / (nextTier.points - currentTierPoints)) * 100;
  return {
    nextTier: nextTier.name,
    progressToNextTier: Math.min(Math.max(progress, 0), 100)
  };
}

export default function ArcadeCalculator() {
  const [currentView, setCurrentView] = useState<"home" | "calculator" | "leaderboard" | "about" | "query">("home")
  const [profileUrl, setProfileUrl] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [facilitatorProgram, setFacilitatorProgram] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showBadgeDetails, setShowBadgeDetails] = useState(false)

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardLoading, setLeaderboardLoading] = useState(false)
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null)

  // Home page stats state
  const [stats, setStats] = useState({
    totalUsers: 0,
    pointsCalculated: 0,
    totalMilestones: 0,
    accuracyRate: 99.9,
    loading: true,
  });

  const formRef = useRef<HTMLFormElement>(null);

  // Load profileUrl from localStorage on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('arcade_profile_url');
    if (savedUrl) {
      setProfileUrl(savedUrl);
    }
  }, []);

  useEffect(() => {
    if (currentView === 'leaderboard') {
      setLeaderboardLoading(true)
      setLeaderboardError(null)
      fetch('/api/leaderboard')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLeaderboard(data.data)
          } else {
            setLeaderboardError(data.error || 'Failed to load leaderboard')
          }
        })
        .catch(err => setLeaderboardError(err.message || 'Failed to load leaderboard'))
        .finally(() => setLeaderboardLoading(false))
    }
  }, [currentView])

  useEffect(() => {
    // Fetch stats only on home view
    if (currentView === 'home') {
      setStats(s => ({ ...s, loading: true }));
      fetch('/api/leaderboard/stats')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setStats({ ...data.data, loading: false });
          } else {
            setStats(s => ({ ...s, loading: false }));
          }
        })
        .catch(() => setStats(s => ({ ...s, loading: false })));
    }
  }, [currentView]);

  const handleCalculate = async () => {
    if (!profileUrl.trim()) {
      alert("Please enter a valid Google Cloud Skills Boost profile URL")
      return
    }

    // Save profileUrl to localStorage
    localStorage.setItem('arcade_profile_url', profileUrl.trim());

    setIsLoading(true)
    try {
      const response = await fetch('/api/scrape-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileUrl: profileUrl.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch profile data');
      }

      if (result.success && result.data) {
        // Transform the API response to match our UserProfile interface
        const apiData = result.data;
        // Find current and next milestone
        const userBadges = {
          gameBadges: apiData.badge_breakdown.game,
          triviaBadges: apiData.badge_breakdown.trivia,
          skillBadges: apiData.badge_breakdown.skill,
          labFreeCourses: apiData.badge_breakdown.lab_free,
        };
        let currentMilestoneIdx = MILESTONES.findIndex(m => normalizeMilestoneName(m.name) === normalizeMilestoneName(apiData.highest_achieved_milestone || ''));
        if (currentMilestoneIdx === -1) currentMilestoneIdx = 0;
        let nextMilestoneIdx = currentMilestoneIdx < MILESTONES.length - 1 ? currentMilestoneIdx + 1 : currentMilestoneIdx;
        const currentMilestone = MILESTONES[currentMilestoneIdx];
        let nextMilestone = MILESTONES[nextMilestoneIdx];
        let milestoneProgressObj = getMilestoneProgress(userBadges, nextMilestone);
        let milestoneProgress;
        if (currentMilestoneIdx === MILESTONES.length - 1) {
          // User achieved the last milestone
          milestoneProgress = {
            current: currentMilestone.name,
            next: 'Maximum Milestone Reached',
            progress: 100
          };
        } else {
          milestoneProgress = {
            current: currentMilestone.name,
            next: nextMilestone.name,
            progress: milestoneProgressObj.avgPct
          };
        }
        const { nextTier, progressToNextTier } = getNextTierAndProgress(apiData.current_swag_tier, apiData.total_arcade_points);
        const transformedProfile: UserProfile = {
          name: apiData.name,
          avatar: apiData.avatar || "/placeholder.svg?height=100&width=100",
          league: apiData.current_swag_tier,
          totalPoints: apiData.total_arcade_points,
          arcadePoints: apiData.points_from_each_type.game_points + apiData.points_from_each_type.trivia_points + apiData.points_from_each_type.skill_points + apiData.points_from_each_type.special_game_points,
          bonusPoints: apiData.points_from_each_type.milestone_bonus,
          badges: {
            gameBadges: apiData.badge_breakdown.game,
            triviaBadges: apiData.badge_breakdown.trivia,
            skillBadges: apiData.badge_breakdown.skill,
            labFreeCourses: apiData.badge_breakdown.lab_free,
          },
          swagEligibility: apiData.current_swag_tier,
          facilitatorProgram: true,
          pointCalculation: {
            badgePoints: apiData.points_from_each_type.game_points + apiData.points_from_each_type.trivia_points + apiData.points_from_each_type.skill_points + apiData.points_from_each_type.special_game_points,
            milestoneBonus: apiData.points_from_each_type.milestone_bonus,
            totalPoints: apiData.total_arcade_points,
            currentTier: apiData.current_swag_tier,
            nextTier,
            progressToNextTier,
            milestoneProgress,
            breakdown: {
              gameBadges: apiData.badge_breakdown.game,
              triviaBadges: apiData.badge_breakdown.trivia,
              skillBadges: apiData.badge_breakdown.skill,
              specialGameBadges: apiData.badge_breakdown.special_game,
              skillBadgePoints: apiData.points_from_each_type.skill_points
            }
          },
          allBadgeDetails: apiData.all_badge_details || [],
        };
        
        setUserProfile(transformedProfile);
        // Add to leaderboard with correct totalBadges calculation
        try {
          // Calculate totalBadges from all badge types
          const totalBadges = (apiData.badge_breakdown.game || 0)
            + (apiData.badge_breakdown.trivia || 0)
            + (apiData.badge_breakdown.skill || 0)
            + (apiData.badge_breakdown.special_game || 0)
            + (apiData.badge_breakdown.lab_free || 0);
          await fetch('/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: apiData.name,
              avatar: apiData.avatar || "/placeholder.svg?height=100&width=100",
              points: apiData.total_arcade_points,
              tier: apiData.current_swag_tier,
              badges: totalBadges
            })
          });
          // Optionally refresh leaderboard if on leaderboard view
          if (currentView === 'leaderboard') {
            setLeaderboardLoading(true);
            setLeaderboardError(null);
            fetch('/api/leaderboard')
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  setLeaderboard(data.data)
                } else {
                  setLeaderboardError(data.error || 'Failed to load leaderboard')
                }
              })
              .catch(err => setLeaderboardError(err.message || 'Failed to load leaderboard'))
              .finally(() => setLeaderboardLoading(false));
          }
        } catch (e) {
          // Ignore leaderboard errors for now
        }
      } else {
        throw new Error(result.error || 'Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      alert(error instanceof Error ? error.message : 'Failed to fetch profile data');
    } finally {
      setIsLoading(false);
    }
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    const text = `Check out my Google Cloud Arcade progress! I have ${userProfile?.totalPoints || 0} points!`

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    }

    if (platform === "copy") {
      navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    } else {
      window.open(shareUrls[platform as keyof typeof shareUrls], "_blank")
    }
  }

  const handleEmailSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formRef.current) return;
    emailjs.sendForm(
      'service_dgv1lys', // SERVICE_ID
      'template_adlgy9e', // TEMPLATE_ID
      formRef.current,
      'zD0q8Hne_fgJ4QIJJ' // <-- Replace with your EmailJS Public Key
    )
    .then(
      (result) => {
        alert('Message sent successfully!');
        formRef.current?.reset();
      },
      (error) => {
        alert('Failed to send message. Please try again.');
        console.error('EmailJS error:', error); // <-- Add this line
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
                onClick={() => window.open('https://go.cloudskillsboost.google/arcade', '_blank')}
              >
                Play Now
              </Button>
              <div className="hidden md:flex items-center space-x-6">
                <Button
                  className={`text-slate-300 hover:text-white ${currentView === "home" ? "text-white" : ""}`}
                  onClick={() => setCurrentView("home")}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button
                  className={`text-slate-300 hover:text-white ${currentView === "calculator" ? "text-white" : ""}`}
                  onClick={() => setCurrentView("calculator")}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculator
                </Button>
                <Button
                  className={`text-slate-300 hover:text-white ${currentView === "leaderboard" ? "text-white" : ""}`}
                  onClick={() => setCurrentView("leaderboard")}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </Button>
                <Button
                  className={`text-slate-300 hover:text-white ${currentView === "about" ? "text-white" : ""}`}
                  onClick={() => setCurrentView("about")}
                >
                  <Info className="w-4 h-4 mr-2" />
                  About
                </Button>
                <Button
                  className={`text-slate-300 hover:text-white ${currentView === "query" ? "text-white" : ""}`}
                  onClick={() => setCurrentView("query")}
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Query
                </Button>
              </div>
            </div>
            <Button className="text-slate-300 hover:text-white">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "leaderboard" ? (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold text-white flex items-center justify-center gap-3">
                <Trophy className="w-12 h-12 text-yellow-500" />
                Leaderboard
              </h1>
              <p className="text-xl text-slate-300">Top performers in the Google Cloud Arcade</p>
            </div>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Global Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboardLoading ? (
                  <div className="text-center text-slate-400 py-12 text-xl">Loading leaderboard...</div>
                ) : leaderboardError ? (
                  <div className="text-center text-red-400 py-12 text-xl">{leaderboardError}</div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center text-slate-400 py-12 text-xl">No leaderboard data yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-600">
                          <th className="p-3 text-slate-300">Rank</th>
                          <th className="p-3 text-slate-300">Avatar</th>
                          <th className="p-3 text-slate-300">Name</th>
                          <th className="p-3 text-slate-300">Points</th>
                          <th className="p-3 text-slate-300">Tier</th>
                          <th className="p-3 text-slate-300">Badges</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((entry: LeaderboardEntry, idx: number) => (
                          <tr key={entry.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                            <td className="p-3 text-lg font-bold text-blue-400">{idx + 1}</td>
                            <td className="p-3">
                              <img src={entry.avatar || "/placeholder-user.jpg"} alt={entry.name} className="w-12 h-12 rounded-full border border-slate-600" />
                            </td>
                            <td className="p-3 text-white font-semibold">{entry.name}</td>
                            <td className="p-3 text-green-400 font-bold">{entry.points}</td>
                            <td className="p-3 text-yellow-400">{entry.tier}</td>
                            <td className="p-3 text-slate-300">{entry.badges}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : currentView === "home" ? (
          /* Home Page */
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-6xl font-bold text-white">
                  Google Cloud Arcade
                  <span className="block text-blue-400">Point Calculator</span>
                </h1>
                <p className="text-2xl text-slate-300 max-w-4xl mx-auto">
                  Your ultimate companion for tracking Google Cloud Arcade progress, calculating points, and achieving milestones in the Facilitator Program
                </p>
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button
                    onClick={() => setCurrentView("calculator")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Start Calculating
                  </Button>
                  <Button
                    onClick={() => setCurrentView("leaderboard")}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-4 text-lg rounded-xl"
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    View Leaderboard
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    {stats.loading ? '...' : stats.totalUsers.toLocaleString()}
                  </div>
                  <div className="text-slate-300">Active Users</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    {stats.loading ? '...' : (stats.pointsCalculated || 0).toLocaleString()}
                  </div>
                  <div className="text-slate-300">Points Calculated</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {stats.loading ? '...' : stats.totalMilestones.toLocaleString()}
                  </div>
                  <div className="text-slate-300">Milestones Achieved</div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-red-400 mb-2">
                    {stats.loading ? '...' : `${stats.accuracyRate}%`}
                  </div>
                  <div className="text-slate-300">Accuracy Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* How It Works */}
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-white text-center">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-white">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Enter Profile URL</h3>
                  <p className="text-slate-300">
                    Paste your Google Cloud Skills Boost public profile URL into our calculator
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-white">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Analyze Progress</h3>
                  <p className="text-slate-300">
                    Our system analyzes your badges, courses, and achievements automatically
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-white">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Get Results</h3>
                  <p className="text-slate-300">
                    View your total points, milestone progress, and swag tier eligibility
                  </p>
                </div>
              </div>
            </div>

            {/* Features Preview */}
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-white text-center">Why Choose Our Calculator?</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      <Zap className="w-6 h-6 text-yellow-500" />
                      Lightning Fast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Get your results in seconds with our optimized calculation engine. No waiting, no delays.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      <Shield className="w-6 h-6 text-green-500" />
                      100% Accurate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Based on official Google Cloud Arcade rules and updated with the latest program guidelines.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      <Eye className="w-6 h-6 text-blue-500" />
                      Real-time Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Monitor your progress toward milestones and swag tiers with live updates and insights.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-3">
                      <Users className="w-6 h-6 text-purple-500" />
                      Community Driven
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Join thousands of Google Cloud enthusiasts tracking their Arcade journey together.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-12 rounded-2xl">
              <h2 className="text-3xl font-bold text-white">Ready to Track Your Progress?</h2>
              <p className="text-xl text-slate-300">
                Join thousands of learners who trust our calculator for accurate Arcade point tracking
              </p>
              <Button
                onClick={() => setCurrentView("calculator")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-xl"
              >
                Get Started Now
              </Button>
            </div>
          </div>
        ) : currentView === "about" ? (
          /* About Page */
          <div className="space-y-12">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold text-white">About Our Calculator</h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Learn about the Google Cloud Arcade Point Calculator, our mission, and how we help you succeed in your cloud learning journey.
              </p>
            </div>

            {/* Mission Section */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300 text-lg">
                  We believe that learning Google Cloud should be rewarding and transparent. Our mission is to provide the most accurate, user-friendly, and comprehensive tool for tracking your Google Cloud Arcade progress.
                </p>
                <p className="text-slate-300">
                  Whether you're aiming for your first milestone or working toward Legend status, we're here to help you understand exactly where you stand and what you need to achieve your goals.
                </p>
              </CardContent>
            </Card>

            {/* What is Google Cloud Arcade */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">What is Google Cloud Arcade?</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">The Program</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Google Cloud Arcade is a gamified learning program that rewards participants for completing hands-on labs, earning badges, and mastering Google Cloud technologies. The program runs in cohorts with specific timelines and milestone requirements.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Point System</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-slate-300">
                      <p>• <strong>Game Badges:</strong> 1 point each</p>
                      <p>• <strong>Special Game Badges:</strong> 2 points each</p>
                      <p>• <strong>Trivia Badges:</strong> 1 point each</p>
                      <p>• <strong>Skill Badges:</strong> 1 point per 2 badges</p>
                      <p>• <strong>Milestone Bonuses:</strong> 2-25 additional points</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Facilitator Program */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
              <CardHeader>
                <CardTitle className="text-2xl text-white">Facilitator Program - Cohort 2, 2025</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">
                  The Facilitator Program is an exclusive track within Google Cloud Arcade that offers additional rewards and recognition for dedicated participants. Cohort 2 ran from April 1st to June 2nd, 2025.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Milestones & Bonuses:</h4>
                    <ul className="text-slate-300 space-y-1">
                      <li>• Milestone 1: +2 bonus points</li>
                      <li>• Milestone 2: +8 bonus points</li>
                      <li>• Milestone 3: +15 bonus points</li>
                      <li>• Ultimate Milestone: +25 bonus points</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Swag Tiers:</h4>
                    <ul className="text-slate-300 space-y-1">
                      <li>• Novice: 20+ points</li>
                      <li>• Trooper: 40+ points</li>
                      <li>• Ranger: 65+ points</li>
                      <li>• Champion: 75+ points</li>
                      <li>• Legend: 85+ points</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How Our Calculator Works */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">How Our Calculator Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      Data Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      We analyze your public Google Cloud Skills Boost profile to extract badge completion data, course progress, and achievement timestamps with precision and accuracy.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-green-400" />
                      Point Calculation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Using the official Google Cloud Arcade point system, we calculate your total points, milestone bonuses, and swag tier eligibility in real-time.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Eye className="w-5 h-5 text-yellow-400" />
                      Progress Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      We provide detailed insights into your progress toward each milestone, showing exactly what you need to complete to reach the next tier.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Shield className="w-5 h-5 text-red-400" />
                      Accuracy Guarantee
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Our calculations are based on the official program rules and are continuously updated to reflect any changes in the point system or requirements.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Team Section */}
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white text-center">Built by Cloud Enthusiasts</h2>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-300 text-lg mb-4">
                    This calculator was built by passionate Google Cloud practitioners who understand the importance of accurate progress tracking in your learning journey.
                  </p>
                  <p className="text-slate-300">
                    We're committed to maintaining the highest standards of accuracy and continuously improving the tool based on community feedback and program updates.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact CTA */}
            <div className="text-center space-y-6 bg-gradient-to-r from-green-600/20 to-blue-600/20 p-12 rounded-2xl">
              <h2 className="text-3xl font-bold text-white">Have Questions?</h2>
              <p className="text-xl text-slate-300">
                We're here to help you succeed in your Google Cloud Arcade journey
              </p>
              <Button
                onClick={() => setCurrentView("query")}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg rounded-xl"
              >
                Contact Us
              </Button>
            </div>
          </div>
        ) : currentView === "query" ? (
          /* Query Page */
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-bold text-white">Help & Support</h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Get help with the calculator, report issues, or ask questions about the Google Cloud Arcade program
              </p>
            </div>

            {/* Contact Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Send us a Message</CardTitle>
                  <CardDescription className="text-slate-400">
                    We'll get back to you within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form ref={formRef} onSubmit={handleEmailSend}>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-slate-300">Name</Label>
                      <Input
                        id="name"
                        name="user_name"
                        placeholder="Your full name"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-slate-300">Email</Label>
                      <Input
                        id="email"
                        name="user_email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-slate-300">Subject</Label>
                      <select name="subject" className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-md text-white" required>
                        <option value="">Select a topic</option>
                        <option value="calculation-error">Calculation Error</option>
                        <option value="missing-badge">Missing Badge</option>
                        <option value="technical-issue">Technical Issue</option>
                        <option value="feature-request">Feature Request</option>
                        <option value="general-question">General Question</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-url" className="text-slate-300">Profile URL (Optional)</Label>
                      <Input
                        id="profile-url"
                        name="profile_url"
                        placeholder="Your Google Cloud Skills Boost profile URL"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-slate-300">Message</Label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder="Describe your issue or question in detail..."
                        className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-md text-white placeholder:text-slate-400 resize-none"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* FAQ Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">How accurate is the calculator?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Our calculator is 99.9% accurate and based on the official Google Cloud Arcade point system. We continuously update our algorithms to match program changes.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Why are my points different from expected?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Point discrepancies can occur due to badge completion timing, special game badge identification, or milestone bonus calculations. Use our contact form to report specific issues.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Can I track multiple profiles?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Currently, you can analyze one profile at a time. We're working on features to save and compare multiple profiles in future updates.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Is my data secure?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      We only access publicly available information from your Skills Boost profile. No personal data is stored, and all calculations are performed in real-time.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">How often is the calculator updated?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      We monitor Google Cloud Arcade program changes daily and update our calculator within 24 hours of any official announcements or rule changes.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : !userProfile ? (
          /* Calculator Input View */
          <>
            <div className="text-center space-y-8 mb-12">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold text-white">Arcade Points Calculator</h1>
                <p className="text-xl text-slate-300 flex items-center justify-center gap-2">
                  Your ultimate companion for Google Cloud Arcade Journey! <Zap className="w-6 h-6 text-yellow-400" />
                </p>
                <p className="text-sm text-green-400">Last Updated: 08-07-2025 23:06:33</p>
              </div>

              <div className="max-w-2xl mx-auto space-y-4">
                <div className="relative">
                  <Input
                    type="url"
                    placeholder="Paste Public-Profile-URL here"
                    value={profileUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfileUrl(e.target.value)}
                    className="h-14 text-lg bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked: boolean) => setRememberMe(checked)}
                      className="border-slate-500"
                    />
                    <label htmlFor="remember" className="text-slate-300 text-sm">
                      Remember me
                    </label>
                  </div>
                  <Button className="text-blue-400 hover:text-blue-300" onClick={() => setCurrentView("query")}>
                    <HelpCircle className="w-4 h-4 mr-1" />
                    Get help
                  </Button>
                </div>

                <Button
                  onClick={handleCalculate}
                  disabled={isLoading}
                  className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing Profile...
                    </div>
                  ) : (
                    "Calculate"
                  )}
                </Button>
              </div>
            </div>

            {/* Share Section */}
            <div className="text-center space-y-6 mb-12">
              <h2 className="text-3xl font-bold text-blue-400">Share This Tool</h2>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button
                  onClick={() => handleShare("twitter")}
                  className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600"
                >
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => handleShare("linkedin")}
                  className="w-12 h-12 rounded-full bg-blue-700 hover:bg-blue-800"
                >
                  <Linkedin className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => handleShare("whatsapp")}
                  className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => handleShare("telegram")}
                  className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => handleShare("facebook")}
                  className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700"
                >
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => handleShare("copy")}
                  className="px-4 py-2 border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>

            {/* Key Features - 6 Cards */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-blue-400 text-center">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-blue-400">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Monitor className="w-6 h-6" />
                      </div>
                      Intuitive Interface
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Clean, user-friendly design that's easy to navigate and understand at a glance.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-green-400">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      Accurate Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Precisely tracks your Arcade Points based on your profile progress and achievements.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-red-400">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <Eye className="w-6 h-6" />
                      </div>
                      Live Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Monitor your real-time progress toward milestones with detailed insights.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-yellow-400">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Award className="w-6 h-6" />
                      </div>
                      Badge Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      View a clear summary of all earned badges along with completion timestamps.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-purple-400">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Bell className="w-6 h-6" />
                      </div>
                      Auto Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Stay aligned with the latest program announcements and guidelines to maximize benefits.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-cyan-400">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <Shield className="w-6 h-6" />
                      </div>
                      Chrome Extension
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Calculate points directly from your browser with our Chrome extension.{" "}
                      <Button className="text-cyan-400 p-0 h-auto">
                        Learn more →
                      </Button>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          /* Results View */
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <Button
                onClick={() => setUserProfile(null)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                ← Back to Calculator
              </Button>
            </div>

            {/* Facilitator Program Question */}
            <div className="flex items-center gap-4 text-white">
              <span>Have you participated in the Facilitator Program?</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={facilitatorProgram}
                    onCheckedChange={(checked: boolean) => setFacilitatorProgram(checked)}
                  />
                  Yes
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={!facilitatorProgram}
                    onCheckedChange={(checked: boolean) => setFacilitatorProgram(!checked)}
                  />
                  No
                </label>
              </div>
            </div>

            {/* Main Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Total Points Card */}
              <Card className="bg-blue-600 text-white">
                <CardHeader>
                  <CardTitle className="text-2xl">Total Points: {userProfile.totalPoints}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white/20 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg">Arcade Points: {userProfile.arcadePoints}</div>
                      <div className="text-lg">+ Bonus Points: {userProfile.bonusPoints}</div>
                    </div>
                  </div>

                  {/* User Profile */}
                  <div className="text-center space-y-3">
                    <Avatar className="w-32 h-32 mx-auto border-4 border-white/30">
                      <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-2xl bg-orange-500">
                        {userProfile.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{userProfile.name}</h3>
                      <Badge className="bg-blue-500 text-white mt-2">
                        <Star className="w-4 h-4 mr-1" />
                        {userProfile.league}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badges Table */}
              <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Badges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300">Game Badge</span>
                      <span className="text-white font-bold text-right">{userProfile.badges.gameBadges}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300">Trivia Badge</span>
                      <span className="text-white font-bold text-right">{userProfile.badges.triviaBadges}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300">Skill Badge</span>
                      <span className="text-white font-bold text-right">{userProfile.badges.skillBadges}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300">Lab-free Courses</span>
                      <span className="text-white font-bold text-right">{userProfile.badges.labFreeCourses}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 p-3 bg-slate-700/50 rounded-lg">
                      <span className="text-slate-300">Swag Eligibility</span>
                      <span className="text-white font-bold text-right">{userProfile.swagEligibility}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Swag Tiers */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {SWAG_TIERS.map((tier, index) => (
                <Card key={tier.name} className={`${tier.color} text-white`}>
                  <CardContent className="p-4 text-center">
                    <div className="w-24 h-24 mx-auto mb-3 bg-black/20 rounded-full flex items-center justify-center">
                      <img src={tier.image || "/placeholder.svg"} alt={tier.name} className="w-20 h-20 rounded-full" />
                    </div>
                    <h3 className="font-bold">{tier.name}</h3>
                    <p className="text-sm">{tier.points} Points</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Facilitator Milestones */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Facilitator Milestones</h2>
                <p className="text-red-400">
                  The program has now ended - badges earned between 1st April to 2nd June, 2025 have counted.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MILESTONES.map((milestone, index) => {
                  const progress = getMilestoneProgress(userProfile?.badges, milestone);
                  return (
                    <Card key={milestone.name} className="bg-slate-800/50 border-slate-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                          <span>{milestone.name}</span>
                          <span className="text-sm">{progress.avgPct}%</span>
                        </CardTitle>
                        <MilestoneProgressBar value={progress.avgPct} colorClass={milestone.color} />
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-slate-300 text-sm space-y-1">
                          <div>
                            Game: {progress.game} / {progress.gameRequired}
                          </div>
                          <div>
                            Trivia: {progress.trivia} / {progress.triviaRequired}
                          </div>
                          <div>
                            Skill: {progress.skill} / {progress.skillRequired}
                          </div>
                          <div>
                            Lab-free: {progress.labFree} / {progress.labFreeRequired}
                          </div>
                        </div>
                        <Button className={`w-full ${milestone.color} text-white`}>
                          Bonus Points: {milestone.bonus}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <p className="text-center text-slate-400 text-sm">
                Upon reaching a milestone, Bonus Points will be automatically added to your Prize Counter — only for
                Facilitator Program participants.
              </p>
            </div>

            {/* Real-time Progress Component */}
            <RealTimeProgress userProfile={userProfile} />

            {/* Point Calculation Display */}
            {userProfile.pointCalculation && (
              <PointCalculationDisplay pointCalculation={userProfile.pointCalculation} />
            )}

            {/* All Badge Details */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle
                  className="text-white flex items-center justify-between cursor-pointer"
                  onClick={() => setShowBadgeDetails(!showBadgeDetails)}
                >
                  All Badge Details
                  <ChevronDown className={`w-5 h-5 transition-transform ${showBadgeDetails ? "rotate-180" : ""}`} />
                </CardTitle>
              </CardHeader>
              {showBadgeDetails && (
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-600">
                          <th className="text-left text-slate-300 p-3">Title</th>
                          <th className="text-left text-slate-300 p-3">Date Earned</th>
                          <th className="text-left text-slate-300 p-3">Arcade Point</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userProfile.allBadgeDetails && userProfile.allBadgeDetails.length > 0 ? (
                          userProfile.allBadgeDetails.map((badge: { title: string; dateEarned?: string; point?: number }, idx: number) => (
                            <tr key={idx} className="border-b border-slate-700">
                              <td className="text-slate-300 p-3">{badge.title}</td>
                              <td className="text-slate-300 p-3">{badge.dateEarned || ''}</td>
                              <td className="text-slate-300 p-3">{badge.point ?? ''}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td className="text-slate-300 p-3" colSpan={3}>No badge details found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Share Section */}
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold text-blue-400">Share This Tool</h2>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Button
                  onClick={() => handleShare("twitter")}
                  className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600"
                >
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => handleShare("linkedin")}
                  className="w-12 h-12 rounded-full bg-blue-700 hover:bg-blue-800"
                >
                  <Linkedin className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => handleShare("whatsapp")}
                  className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => handleShare("telegram")}
                  className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600"
                >
                  <Send className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => handleShare("facebook")}
                  className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700"
                >
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => handleShare("copy")}
                  className="px-4 py-2 border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  <Link className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>

            {/* Key Features - 6 Cards */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-blue-400 text-center">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-blue-400">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Monitor className="w-6 h-6" />
                      </div>
                      Intuitive Interface
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Clean, user-friendly design that's easy to navigate and understand at a glance.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-green-400">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      Accurate Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Precisely tracks your Arcade Points based on your profile progress and achievements.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-red-400">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <Eye className="w-6 h-6" />
                      </div>
                      Live Tracking
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Monitor your real-time progress toward milestones with detailed insights.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-yellow-400">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <Award className="w-6 h-6" />
                      </div>
                      Badge Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      View a clear summary of all earned badges along with completion timestamps.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-purple-400">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Bell className="w-6 h-6" />
                      </div>
                      Auto Updates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Stay aligned with the latest program announcements and guidelines to maximize benefits.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-cyan-400">
                      <div className="p-2 bg-cyan-500/20 rounded-lg">
                        <Shield className="w-6 h-6" />
                      </div>
                      Chrome Extension
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">
                      Calculate points directly from your browser with our Chrome extension.{" "}
                      <Button className="text-cyan-400 p-0 h-auto">
                        Learn more →
                      </Button>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer onNavigate={(view) => setCurrentView(view as "home" | "calculator" | "leaderboard" | "about" | "query")} />
    </div>
  );
}