// app/api/github/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('user') || 'dhruvkkrishna';
  const token = process.env.GITHUB_TOKEN;

  if (!token) return NextResponse.json(generateMockData());

  const query = `
    query($userName:String!) {
      user(login: $userName) {
        avatarUrl
        followers { totalCount }
        pullRequests { totalCount }
        issues { totalCount }
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
        topRepositories(first: 3, orderBy: {field: STARGAZERS, direction: DESC}) {
          nodes {
            name
            description
            stargazerCount
            primaryLanguage {
              name
              color
            }
            url
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { userName: username } }),
    });

    const json = await response.json();
    const user = json.data?.user;

    if (!user) throw new Error("User not found");

    return NextResponse.json({
      total: user.contributionsCollection.contributionCalendar.totalContributions,
      weeks: user.contributionsCollection.contributionCalendar.weeks,
      followers: user.followers.totalCount,
      prs: user.pullRequests.totalCount,
      issues: user.issues.totalCount,
      topRepos: user.topRepositories.nodes,
      avatar: user.avatarUrl,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(generateMockData());
  }
}

function generateMockData() {
  const weeks = [];
  for(let w=0; w<30; w++) {
    const days = [];
    for(let d=0; d<7; d++) {
        days.push({ contributionCount: Math.floor(Math.random() * 10), date: "2024-01-01" });
    }
    weeks.push({ contributionDays: days });
  }
  return { 
    total: 1024, 
    weeks, 
    followers: 100, 
    prs: 50, 
    issues: 20,
    topRepos: [
      { name: "Mock-Repo-1", description: "A cool project", stargazerCount: 120, primaryLanguage: { name: "TypeScript", color: "#3178c6" } },
      { name: "Mock-Repo-2", description: "Another cool one", stargazerCount: 80, primaryLanguage: { name: "Rust", color: "#dea584" } }
    ]
  };
}