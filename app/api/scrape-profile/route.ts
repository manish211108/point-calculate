export const runtime = "nodejs";
import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

// --- Your existing interfaces (copy these from your original file) ---
interface BadgeData {
  name: string;
  dateEarned?: string;
}

interface ScrapedProfile {
  userName: string;
  avatarUrl: string;
  badgeData: BadgeData[];
}

interface BadgeCounts {
  num_game_badges: number;
  num_trivia_badges: number;
  num_skill_badges: number;
  num_special_game_badges: number;
  num_lab_free_courses: number;
}

interface Milestone {
  name: string;
  req: { game: number; trivia: number; skill: number; lab_free: number };
  bonus: number;
}

interface PointCalculation {
  total_arcade_points: number;
  current_swag_tier: string;
  highest_achieved_milestone: string;
  badge_breakdown: {
    game: number;
    trivia: number;
    skill: number;
    special_game: number;
    lab_free: number;
  };
  milestone_progress_details: any; // You might want a more specific type here
  points_from_each_type: {
    game_points: number;
    trivia_points: number;
    skill_points: number;
    special_game_points: number;
    milestone_bonus: number;
  };
}

// --- Your existing MILESTONES and SWAG_TIERS arrays (copy these from your original file) ---
// If these are not provided, please define them based on your project's needs.
// Example placeholders (replace with your actual definitions):
const MILESTONES: Milestone[] = [
  { name: "Ultimate Milestone", req: { game: 10, trivia: 8, skill: 44, lab_free: 16 }, bonus: 25 },
  { name: "Milestone 3", req: { game: 8, trivia: 7, skill: 30, lab_free: 12 }, bonus: 15 },
  { name: "Milestone 2", req: { game: 6, trivia: 6, skill: 20, lab_free: 8 }, bonus: 8 },
  { name: "Milestone 1", req: { game: 4, trivia: 4, skill: 10, lab_free: 4 }, bonus: 2 }
];

const SWAG_TIERS: { tier: string; points: number }[] = [
  { tier: "Arcade Legend", points: 85 },
  { tier: "Arcade Champion", points: 75 },
  { tier: "Arcade Ranger", points: 65 },
  { tier: "Arcade Trooper", points: 40 },
  { tier: "Arcade Novice", points: 20 }
];


// --- Hardcoded badge lists ---
// IMPORTANT: Adjust these lists to accurately reflect the badge names
// as they appear on the Google Cloud Skills Boost website.
// Case-insensitivity and trimming are handled by the normalization function.

// If 'SPECIAL_GAME_BADGES' was meant to be a distinct list from 'KNOWN_SPECIAL_GAME_BADGES',
// please define 'SPECIAL_GAME_BADGES' here. Otherwise, 'KNOWN_SPECIAL_GAME_BADGES' is used.
// For now, assuming they refer to the same set of badges if only one was provided initially.
const SPECIAL_GAME_BADGES = [ // This might be redundant if you only use KNOWN_SPECIAL_GAME_BADGES
  "Analyze BigQuery Data in Connected Sheets",
  "Streaming Analytics into BigQuery",
  "Store, Process, and Manage Data on Google Cloud - Console",
  "Using the Google Cloud Speech API",
  "Analyze Speech and Language with Google APIs",
  "Create a Secure Data Lake on Cloud Storage ",
  "Get Started with API Gateway",
  "Get Started with Dataplex",
  "Get Started with Pub/Sub",
  "Tag and Discover BigLake Data",
  "Use APIs to Work with Cloud Storage",
  "Integrate BigQuery Data and Google Workspace using Apps Script",
  "Configure Service Accounts and IAM Roles for Google Cloud",
  "Prepare Data for Looker Dashboards and Reports",
  "Create and Manage Cloud Spanner Instances",
  "Use Functions, Formulas, and Charts in Google Sheets",
  "Create and Manage AlloyDB Instances",
  "Build Real World AI Applications with Gemini and Imagen",
  "App Engine: 3 Ways",
  "Create a Streaming Data Lake on Cloud Storage",
  "Store, Process, and Manage Data on Google Cloud - Command Line",
  "App Building with AppSheet",
  "Cloud Functions: 3 Ways",
  "Get Started with Cloud Storage",
  "Get Started with Looker",
  "The Basics of Google Cloud Compute",
  "Analyze Images with the Cloud Vision API",
  "Analyze Sentiment with Natural Language API",
  "Cloud Speech API: 3 Ways",
  "Monitor and Manage Google Cloud Resources",
  "Protect Sensitive Data with Data Loss Prevention",
  "Secure BigLake Data",
  "Get Started with Eventarc",
  "Implement Load Balancing on Compute Engine",
  "Monitoring in Google Cloud",
  "Automate Data Capture at Scale with Document AI",
  "Develop Serverless Apps with Firebase",
  "Develop with Apps Script and AppSheet",
  "Networking Fundamentals on Google Cloud",
  "Build Google Cloud Infrastructure for Azure Professionals",
  "Engineer Data for Predictive Modeling with BigQuery ML",
  "Deploy Kubernetes Applications on Google Cloud",
  "Explore Generative AI with the Vertex AI Gemini API",
  "Implement CI/CD Pipelines on Google Cloud",
  "Implement DevOps Workflows in Google Cloud",
  "Build Google Cloud Infrastructure for AWS Professionals",
  "Inspect Rich Documents with Gemini Multimodality and Multimodal RAG",
  "Manage Kubernetes in Google Cloud",
  "Prompt Design in Vertex AI",
  "Protect Cloud Traffic with BeyondCorp Enterprise (BCE) Security",
  "Build LangChain Applications using Vertex AI",
  "Create and Manage Cloud SQL for PostgreSQL Instances",
  "Build a Data Warehouse with BigQuery",
  "Build a Data Mesh with Dataplex",
  "Migrate MySQL data to Cloud SQL using Database Migration Service",
  "Share Data Using Google Data Cloud",
  "Monitor and Log with Google Cloud Observability",
  "Perform Predictive Data Analysis in BigQuery",
  "Build Infrastructure with Terraform on Google Cloud",
  "Build LookML Objects in Looker",
  "Develop Serverless Applications on Cloud Run",
  "Build a Website on Google Cloud",
  "Create ML Models with BigQuery ML",
  "Mitigate Threats and Vulnerabilities with Security Command Center",
  "Develop GenAI Apps with Gemini and Streamlit",
  "Monitor Environments with Google Cloud Managed Service for Prometheus",
  "Create and Manage Bigtable Instances",
  "Detect Manufacturing Defects using Visual Inspection AI",
  "Optimize Costs for Google Kubernetes Engine",
  "Build and Deploy Machine Learning Solutions on Vertex AI",
  "Deploy and Manage Apigee X",
  "Set Up an App Dev Environment on Google Cloud",
  "Derive Insights from BigQuery Data",
  "Develop and Secure APIs with Apigee X",
  "Set Up a Google Cloud Network",
  "Implement Cloud Security Fundamentals on Google Cloud",
  "Develop your Google Cloud Network",
  "Build Custom Processors with Document AI",
  "Cloud Architecture: Design, Implement, and Manage",
  "Build a Secure Google Cloud Network",
  "Manage Data Models in Looker",
  "Classify Images with TensorFlow on Google Cloud",
  "Get Started with Google Workspace Tools",
  "Use Machine Learning APIs on Google Cloud",
  "Prepare Data for ML APIs on Google Cloud"
];

const KNOWN_SPECIAL_GAME_BADGES = [
  "Arcade Skills Resolve",
  "Arcade Love Beyond Query",
  "Color Your Skills",
  "Arcade TechCare"
];

const KNOWN_GAME_BADGES = [
  "Skills Boost Arcade Certification Zone May 2025",
  "Arcade NetworSkills",
  "Level 3: Building Blocks",
  "Level 1: Data Modeling and Reporting",
  "Skills Boost Arcade Base Camp May 2025",
  "Level 2: Data Exploration and Integration",
  "Skills Boost Arcade Certification Zone April 2025",
  "Work Meets Play: Travel Tales",
  "Level 3: The Arcade Quiz",
  "Level 1: Application Development and Security with GCP",
  "Skills Boost Arcade Base Camp April 2025",
  "Level 2: Cloud Infrastructure & API Essentials",
// second Jul
  "Level 1: Core Infrastructure and Security",
  "Level 2: Modern Application Deployment",
  "Level 3: Advanced App Operations",
  "Skills Boost Arcade Base Camp July 2025"
];

const KNOWN_TRIVIA_BADGES = [
  "Skills Boost Arcade Trivia May 2025 Week 4",
  "Skills Boost Arcade Trivia May 2025 Week 3",
  "Skills Boost Arcade Trivia May 2025 Week 2",
  "Skills Boost Arcade Trivia May 2025 Week 1",
  "Skills Boost Arcade Trivia April 2025 Week 4",
  "Skills Boost Arcade Trivia April 2025 Week 3",
  "Skills Boost Arcade Trivia April 2025 Week 2",
  "Skills Boost Arcade Trivia April 2025 Week 1",
  // second jul
  "Skills Boost Arcade Trivia July 2025 Week 1",
  "Skills Boost Arcade Trivia July 2025 Week 2",
  "Skills Boost Arcade Trivia July 2025 Week 3",
  "Skills Boost Arcade Trivia July 2025 Week 4"
];

const KNOWN_LAB_FREE_COURSES = [

  "Digital Transformation with Google Cloud",
  "Gemini for Data Scientists and Analysts",
  "Exploring Data Transformation with Google Cloud",
  "Infrastructure and Application Modernization with Google Cloud",
  "Scaling with Google Cloud Operations",
  "Innovating with Google Cloud Artificial Intelligence",
  "Trust and Security with Google Cloud",
  "Google Drive",
  "Google Docs",
  "Google Slides",
  "Google Meet",
  "Google Sheets",
  "Google Calendar",
  "Responsible AI: Applying AI Principles with Google Cloud",
  "Responsible AI for Digital Leaders with Google Cloud",
  "Customer Engagement Suite with Google AI Architecture",
  "Machine Learning Operations (MLOps) with Vertex AI: Model Evaluation",
  "Conversational AI on Vertex AI and Dialogflow CX",
  "Building Complex End to End Self-Service Experiences in Dialogflow CX"

];

// --- Your existing calculateArcadePointsAndProgress function ---
function calculateArcadePointsAndProgress({
  num_game_badges,
  num_trivia_badges,
  num_skill_badges,
  num_special_game_badges,
  num_lab_free_courses
}: {
  num_game_badges: number,
  num_trivia_badges: number,
  num_skill_badges: number,
  num_special_game_badges: number,
  num_lab_free_courses: number
}): PointCalculation {
  // Step 1: Calculate Core Badge Points
  const game_points = num_game_badges * 1;
  const trivia_points = num_trivia_badges * 1;
  const skill_points = Math.floor(num_skill_badges / 2) * 1;
  const special_game_points = num_special_game_badges * 2;
  const base_badge_points = game_points + trivia_points + skill_points + special_game_points;

  // Step 2: Determine Highest Achieved Milestone and Bonus Points
  let milestone_bonus = 0;
  let achieved_milestone = "None";
  // Using the MILESTONES array defined above
  for (const m of MILESTONES) {
    if (
      num_game_badges >= m.req.game &&
      num_trivia_badges >= m.req.trivia &&
      num_skill_badges >= m.req.skill &&
      num_lab_free_courses >= m.req.lab_free
    ) {
      milestone_bonus = m.bonus;
      achieved_milestone = m.name;
      break;
    }
  }

  // Step 3: Calculate Total Arcade Points
  const total_arcade_points = base_badge_points + milestone_bonus;

  // Step 4: Determine Swag Tier
  let current_swag_tier = "None";
  // Using the SWAG_TIERS array defined above
  for (const tierDef of SWAG_TIERS.sort((a, b) => b.points - a.points)) { // Sort descending to match tiers correctly
    if (total_arcade_points >= tierDef.points) {
      current_swag_tier = tierDef.tier;
      break;
    }
  }

  // Step 5: Prepare Milestone Progress Details
  const milestone_progress_details: any = {};
  for (const m of MILESTONES) {
    milestone_progress_details[m.name.replace(/ /g, '_').toLowerCase()] = {
      achieved:
        num_game_badges >= m.req.game &&
        num_trivia_badges >= m.req.trivia &&
        num_skill_badges >= m.req.skill &&
        num_lab_free_courses >= m.req.lab_free,
      game_progress: `${num_game_badges}/${m.req.game}`,
      trivia_progress: `${num_trivia_badges}/${m.req.trivia}`,
      skill_progress: `${num_skill_badges}/${m.req.skill}`,
      lab_free_progress: `${num_lab_free_courses}/${m.req.lab_free}`
    };
  }

  // Output structure
  return {
    total_arcade_points,
    current_swag_tier,
    highest_achieved_milestone: achieved_milestone,
    badge_breakdown: {
      game: num_game_badges,
      trivia: num_trivia_badges,
      skill: num_skill_badges,
      special_game: num_special_game_badges,
      lab_free: num_lab_free_courses
    },
    milestone_progress_details,
    points_from_each_type: {
      game_points,
      trivia_points,
      skill_points,
      special_game_points,
      milestone_bonus
    }
  };
}

// Add a simple in-memory cache for profile results
const profileCache = new Map<string, any>();

let prisma: any;
function getPrisma() {
  if (!prisma) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient();
  }
  return prisma;
}

export async function POST(request: NextRequest) {
  try {
    // Increment calculation counter
    const prisma = getPrisma();
    await prisma.calculationStat.upsert({
      where: { id: 1 },
      update: { count: { increment: 1 } },
      create: { id: 1, count: 1 },
    });

    // 1. Call request.json() ONCE at the beginning
    const requestBody = await request.json();
    const { profileUrl } = requestBody;

    // Check cache first
    if (profileCache.has(profileUrl)) {
      console.log('Returning cached result for', profileUrl);
      return NextResponse.json(profileCache.get(profileUrl));
    }

    if (!profileUrl) {
      return NextResponse.json({ error: 'Profile URL is required' }, { status: 400 });
    }
    if (!profileUrl.includes('cloudskillsboost.google')) {
      return NextResponse.json({ error: 'Invalid Google Cloud Skills Boost profile URL' }, { status: 400 });
    }

    let userName = 'Unknown User';
    let avatarUrl = '';
    let badgeData: { name: string; dateEarned?: string }[] = [];
    let num_game_badges = 0;
    let num_trivia_badges = 0;
    let num_skill_badges = 0;
    let num_special_game_badges = 0;
    let num_lab_free_courses = 0; // Initialize for scraping
    let all_badge_details: { title: string; dateEarned?: string; point: number }[] = [];

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        // executablePath: 'C:\\Users\\Manish\\.cache\\puppeteer\\chrome\\win64-138.0.7204.92\\chrome-win64\\chrome.exe'
        // For production or other environments, consider not hardcoding this or using a global path/env var.
        // If not explicitly set, Puppeteer will try to find a compatible Chromium executable.
      });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      try {
        await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 60000 }); // 60 seconds
      } catch (navErr) {
        console.error('Navigation error:', navErr);
        await browser.close();
        return NextResponse.json({ error: 'Failed to load profile page. Please check the URL and try again.', details: navErr instanceof Error ? navErr.message : navErr }, { status: 500 });
      }

      // Try to wait for badges, but don't throw if not found (user may have zero badges)
      try {
        await page.waitForSelector('.profile-badge', { timeout: 20000 });
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (e) {
        // No badges found, but continue to try to extract name/avatar
      }

      // Extract user name
      userName = await page.evaluate(() => {
        const nameElement = document.querySelector('h1, .profile-name, [data-testid="profile-name"], .user-name, .profile-title, .profile-header h1, .user-profile-name');
        return nameElement ? nameElement.textContent?.trim() : 'Unknown User';
      });

      // Extract avatar
      avatarUrl = await page.evaluate(() => {
        const qlAvatar = document.querySelector('ql-avatar.profile-avatar');
        if (qlAvatar && qlAvatar.getAttribute('src')) {
          return qlAvatar.getAttribute('src');
        }
        const selectors = [
          '.profile-avatar img', '.user-avatar img', '.profile-picture img', '.user-picture img', '.avatar img',
          '.profile-image img', '.user-image img', '.profile-header img', '.user-header img', '.profile-container img',
          '.user-container img', 'img[src*="avatar"]', 'img[src*="profile"]', 'img[src*="user"]', 'img[alt*="profile"]',
          'img[alt*="avatar"]', 'img[alt*="user"]', '[data-testid="profile-avatar"] img', '[data-testid="user-avatar"] img',
          '[data-testid="avatar"] img', '.gc-user-avatar img', '.cloud-user-avatar img', '.skills-profile-avatar img',
          '.boost-profile-avatar img', '.google-profile-avatar img', '.cloud-profile-avatar img'
        ];
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            const src = element.getAttribute('src');
            if (src && src.trim() !== '' && !src.includes('data:image/svg')) {
              return src;
            }
          }
        }
        const allImgs = Array.from(document.querySelectorAll('img')).map(img => img.src);
        if (allImgs.length > 0) {
          return allImgs[0];
        }
        return '';
      });
      if (!avatarUrl) {
        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&size=200&bold=true&format=svg`;
      } else {
        if (avatarUrl.startsWith('/')) {
          avatarUrl = `https://www.cloudskillsboost.google${avatarUrl}`;
        } else if (avatarUrl.startsWith('./')) {
          avatarUrl = `https://www.cloudskillsboost.google${avatarUrl.substring(1)}`;
        } else if (!avatarUrl.startsWith('http')) {
          avatarUrl = `https://www.cloudskillsboost.google/${avatarUrl}`;
        }
      }

      // Extract all badge titles and dates by targeting .profile-badge elements
      badgeData = await page.evaluate(() => {
        const scrapedData: { name: string; dateEarned?: string }[] = [];
        const badges = Array.from(document.querySelectorAll('.profile-badge'));
        badges.forEach(badge => {
          const nameElement = badge.querySelector('.ql-title-medium');
          const dateElement = badge.querySelector('.ql-body-medium');
          const name = nameElement ? nameElement.textContent?.trim() || '' : '';
          const dateEarned = dateElement ? dateElement.textContent?.trim() || '' : '';
          if (name) {
            scrapedData.push({ name, dateEarned });
          }
        });
        return scrapedData;
      });
      // Debug: Log all badge names (raw and normalized)
      console.log('All badge names scraped from page:');
      badgeData.forEach((b, i) => console.log(`${i + 1}. "${b.name}"`));

      // Classify badges using the hardcoded lists (case-insensitive, trimmed)
      const normalize = (s: string) => s.trim().toLowerCase();
      const specialGameSet = new Set(KNOWN_SPECIAL_GAME_BADGES.map(normalize));
      const gameSet = new Set(KNOWN_GAME_BADGES.map(normalize));
      const triviaSet = new Set(KNOWN_TRIVIA_BADGES.map(normalize));
      const labFreeSet = new Set(KNOWN_LAB_FREE_COURSES.map(normalize));

      // Assign point value to each badge (now all variables are in scope)
      all_badge_details = badgeData.map(badge => {
        const badgeName = normalize(badge.name);
        let point = 0;
        if (specialGameSet.has(badgeName)) {
          point = 2;
        } else if (gameSet.has(badgeName)) {
          point = 1;
        } else if (triviaSet.has(badgeName)) {
          point = 1;
        } else if (labFreeSet.has(badgeName)) {
          point = 0;
        } else {
          point = 0.5; // Skill badges: 1 point per 2 badges
        }
        return {
          title: badge.name,
          dateEarned: badge.dateEarned,
          point
        };
      });

      for (const badge of badgeData) {
        const badgeName = normalize(badge.name);
        if (specialGameSet.has(badgeName)) {
          num_special_game_badges += 1;
          console.log('[CLASSIFIED] Special Game Badge:', badge.name);
        } else if (gameSet.has(badgeName)) {
          num_game_badges += 1;
          console.log('[CLASSIFIED] Game Badge:', badge.name);
        } else if (triviaSet.has(badgeName)) {
          num_trivia_badges += 1;
          console.log('[CLASSIFIED] Trivia Badge:', badge.name);
        } else if (labFreeSet.has(badgeName)) {
          num_lab_free_courses += 1; // Increment if matched by scraper
          console.log('[CLASSIFIED] Lab-free Course:', badge.name); // This is crucial for debugging
        } else {
          num_skill_badges += 1;
          console.log('[CLASSIFIED] Unmatched badge (counted as skill):', badge.name); // Pay close attention to these
        }
      }

      console.log('Badge counts after scraping:', {
        num_game_badges,
        num_trivia_badges,
        num_skill_badges,
        num_special_game_badges,
        num_lab_free_courses // Log scraped count
      });

      await browser.close();
    } catch (scrapeError) {
      console.error('Scraping Error:', scrapeError); // Log scraping errors
      // Fallback to minimal data if scraping fails
      userName = 'Scrape Error';
      avatarUrl = `https://ui-avatars.com/api/?name=Scrape+Error&background=random&color=fff&size=200&bold=true&format=svg`;
      badgeData = [];
      num_game_badges = 0;
      num_trivia_badges = 0;
      num_skill_badges = 0;
      num_special_game_badges = 0;
      num_lab_free_courses = 0; // Reset on scrape error
    }

    // Apply manual input for lab-free courses if provided in the requestBody
    // This will override the scraped count if a manual value is sent.
    if (requestBody.num_lab_free_courses !== undefined && !isNaN(Number(requestBody.num_lab_free_courses))) {
      num_lab_free_courses = Number(requestBody.num_lab_free_courses);
      console.log('Manual Lab-free Courses count applied:', num_lab_free_courses);
    }

    const arcadeResult = calculateArcadePointsAndProgress({
      num_game_badges,
      num_trivia_badges,
      num_skill_badges,
      num_special_game_badges,
      num_lab_free_courses // Use the final num_lab_free_courses count here
    });

    const responseData = {
      success: true,
      data: {
        name: userName,
        avatar: avatarUrl,
        badge_breakdown: arcadeResult.badge_breakdown,
        milestone_progress_details: arcadeResult.milestone_progress_details,
        points_from_each_type: arcadeResult.points_from_each_type,
        total_arcade_points: arcadeResult.total_arcade_points,
        current_swag_tier: arcadeResult.current_swag_tier,
        highest_achieved_milestone: arcadeResult.highest_achieved_milestone,
        all_badge_details: all_badge_details,
      },
      message: 'Profile data processed successfully'
    };
    profileCache.set(profileUrl, responseData);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error processing profile:', error);
    return NextResponse.json({
      error: 'Failed to process profile data. Please check the URL and try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
