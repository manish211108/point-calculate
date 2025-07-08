import { NextRequest, NextResponse } from 'next/server';

// Import the point calculation logic
interface BadgeCounts {
  gameBadges: number;
  triviaBadges: number;
  skillBadges: number;
  specialGameBadges: number;
  labFreeCourses: number;
}

interface Milestone {
  name: string;
  requirements: BadgeCounts;
  bonusPoints: number;
  totalPoints: number;
}

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

// Define milestones based on the rules
const MILESTONES: Milestone[] = [
  {
    name: "Milestone 1",
    requirements: { gameBadges: 4, triviaBadges: 4, skillBadges: 10, specialGameBadges: 0, labFreeCourses: 4 },
    bonusPoints: 2,
    totalPoints: 15
  },
  {
    name: "Milestone 2", 
    requirements: { gameBadges: 6, triviaBadges: 6, skillBadges: 20, specialGameBadges: 0, labFreeCourses: 8 },
    bonusPoints: 8,
    totalPoints: 30
  },
  {
    name: "Milestone 3",
    requirements: { gameBadges: 8, triviaBadges: 7, skillBadges: 30, specialGameBadges: 0, labFreeCourses: 12 },
    bonusPoints: 15,
    totalPoints: 45
  },
  {
    name: "Ultimate Milestone",
    requirements: { gameBadges: 10, triviaBadges: 8, skillBadges: 44, specialGameBadges: 0, labFreeCourses: 16 },
    bonusPoints: 25,
    totalPoints: 65
  }
];

// Define swag tier thresholds
const SWAG_TIERS = [
  { name: "Arcade Novice", points: 20 },
  { name: "Arcade Trooper", points: 40 },
  { name: "Arcade Ranger", points: 65 },
  { name: "Arcade Champion", points: 75 },
  { name: "Arcade Legend", points: 85 }
];

function calculatePoints(badgeCounts: BadgeCounts): PointCalculation {
  // Calculate badge points
  const gameBadgePoints = badgeCounts.gameBadges * 1;
  const triviaBadgePoints = badgeCounts.triviaBadges * 1;
  const skillBadgePoints = Math.floor(badgeCounts.skillBadges / 2); // 1 point per 2 skill badges
  const specialGameBadgePoints = badgeCounts.specialGameBadges * 2;
  
  const totalBadgePoints = gameBadgePoints + triviaBadgePoints + skillBadgePoints + specialGameBadgePoints;
  
  // Determine highest eligible milestone
  let highestMilestone: Milestone | null = null;
  for (const milestone of MILESTONES) {
    if (
      badgeCounts.gameBadges >= milestone.requirements.gameBadges &&
      badgeCounts.triviaBadges >= milestone.requirements.triviaBadges &&
      badgeCounts.skillBadges >= milestone.requirements.skillBadges &&
      badgeCounts.labFreeCourses >= milestone.requirements.labFreeCourses
    ) {
      highestMilestone = milestone;
    }
  }
  
  const milestoneBonus = highestMilestone ? highestMilestone.bonusPoints : 0;
  const totalPoints = totalBadgePoints + milestoneBonus;
  
  // Determine current tier
  let currentTier = "No Tier";
  let nextTier = "Arcade Novice";
  let progressToNextTier = 0;
  
  for (let i = 0; i < SWAG_TIERS.length; i++) {
    if (totalPoints >= SWAG_TIERS[i].points) {
      currentTier = SWAG_TIERS[i].name;
      if (i < SWAG_TIERS.length - 1) {
        nextTier = SWAG_TIERS[i + 1].name;
        const currentTierPoints = SWAG_TIERS[i].points;
        const nextTierPoints = SWAG_TIERS[i + 1].points;
        progressToNextTier = ((totalPoints - currentTierPoints) / (nextTierPoints - currentTierPoints)) * 100;
      } else {
        nextTier = "Maximum Tier Reached";
        progressToNextTier = 100;
      }
    } else {
      if (i === 0) {
        progressToNextTier = (totalPoints / SWAG_TIERS[i].points) * 100;
      }
      break;
    }
  }
  
  // Determine milestone progress
  let currentMilestone = "No Milestone";
  let nextMilestone = "Milestone 1";
  let milestoneProgress = 0;
  
  if (highestMilestone) {
    currentMilestone = highestMilestone.name;
    const currentIndex = MILESTONES.findIndex(m => m.name === highestMilestone!.name);
    if (currentIndex < MILESTONES.length - 1) {
      nextMilestone = MILESTONES[currentIndex + 1].name;
      const nextMilestoneReqs = MILESTONES[currentIndex + 1].requirements;
      
      // Calculate progress to next milestone (average of all requirements)
      const gameProgress = Math.min((badgeCounts.gameBadges / nextMilestoneReqs.gameBadges) * 100, 100);
      const triviaProgress = Math.min((badgeCounts.triviaBadges / nextMilestoneReqs.triviaBadges) * 100, 100);
      const skillProgress = Math.min((badgeCounts.skillBadges / nextMilestoneReqs.skillBadges) * 100, 100);
      const labProgress = Math.min((badgeCounts.labFreeCourses / nextMilestoneReqs.labFreeCourses) * 100, 100);
      
      milestoneProgress = (gameProgress + triviaProgress + skillProgress + labProgress) / 4;
    } else {
      nextMilestone = "Maximum Milestone Reached";
      milestoneProgress = 100;
    }
  } else {
    // Progress to first milestone
    const firstMilestone = MILESTONES[0].requirements;
    const gameProgress = Math.min((badgeCounts.gameBadges / firstMilestone.gameBadges) * 100, 100);
    const triviaProgress = Math.min((badgeCounts.triviaBadges / firstMilestone.triviaBadges) * 100, 100);
    const skillProgress = Math.min((badgeCounts.skillBadges / firstMilestone.skillBadges) * 100, 100);
    const labProgress = Math.min((badgeCounts.labFreeCourses / firstMilestone.labFreeCourses) * 100, 100);
    
    milestoneProgress = (gameProgress + triviaProgress + skillProgress + labProgress) / 4;
  }
  
  return {
    badgePoints: totalBadgePoints,
    milestoneBonus,
    totalPoints,
    currentTier,
    nextTier,
    progressToNextTier: Math.min(progressToNextTier, 100),
    milestoneProgress: {
      current: currentMilestone,
      next: nextMilestone,
      progress: Math.min(milestoneProgress, 100)
    },
    breakdown: {
      gameBadges: gameBadgePoints,
      triviaBadges: triviaBadgePoints,
      skillBadges: badgeCounts.skillBadges,
      specialGameBadges: specialGameBadgePoints,
      skillBadgePoints
    }
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testCase = searchParams.get('test');
    
    let badgeCounts: BadgeCounts;
    
    switch (testCase) {
      case 'empty':
        badgeCounts = { gameBadges: 0, triviaBadges: 0, skillBadges: 0, specialGameBadges: 0, labFreeCourses: 0 };
        break;
      case 'milestone1':
        badgeCounts = { gameBadges: 4, triviaBadges: 4, skillBadges: 10, specialGameBadges: 0, labFreeCourses: 4 };
        break;
      case 'milestone2':
        badgeCounts = { gameBadges: 6, triviaBadges: 6, skillBadges: 20, specialGameBadges: 0, labFreeCourses: 8 };
        break;
      case 'milestone3':
        badgeCounts = { gameBadges: 8, triviaBadges: 7, skillBadges: 30, specialGameBadges: 0, labFreeCourses: 12 };
        break;
      case 'ultimate':
        badgeCounts = { gameBadges: 10, triviaBadges: 8, skillBadges: 44, specialGameBadges: 0, labFreeCourses: 16 };
        break;
      case 'legend':
        badgeCounts = { gameBadges: 12, triviaBadges: 10, skillBadges: 50, specialGameBadges: 2, labFreeCourses: 20 };
        break;
      default:
        badgeCounts = { gameBadges: 5, triviaBadges: 5, skillBadges: 15, specialGameBadges: 1, labFreeCourses: 6 };
    }
    
    const pointCalculation = calculatePoints(badgeCounts);
    
    return NextResponse.json({
      success: true,
      testCase,
      badgeCounts,
      pointCalculation,
      message: `Test case: ${testCase || 'default'}`
    });
    
  } catch (error) {
    console.error('Error in test points:', error);
    return NextResponse.json({ 
      error: 'Failed to test point calculation',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 