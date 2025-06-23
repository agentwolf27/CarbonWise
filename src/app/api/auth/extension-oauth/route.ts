import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken';

// In production, store these securely
const EXTENSION_CLIENTS = {
  '113243607151-f8cbt4ror4v1uqtdftf41pq6uvko9so4.apps.googleusercontent.com': {
    secret: process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret-here',
    name: 'CarbonWise Chrome Extension',
    allowedOrigins: ['chrome-extension://']
  }
};

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-jwt-secret';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Handle direct authentication from web app
    if (body.directAuth && body.userId) {
      return await handleDirectAuth(body.userId);
    }
    
    // Handle OAuth flow from extension
    const { oauthToken, extensionId, clientId, code, redirectUri } = body;
    
    if (code && redirectUri) {
      // Handle authorization code flow
      return await handleOAuthCodeFlow(code, redirectUri, clientId);
    }
    
    if (oauthToken && extensionId && clientId) {
      // Handle token-based flow (legacy)
      return await handleTokenFlow(oauthToken, extensionId, clientId);
    }
    
    return NextResponse.json({ 
      error: "Missing required fields" 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Extension OAuth failed:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

async function handleDirectAuth(userId: string) {
  // Get user from database
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  
  if (!user) {
    return NextResponse.json({ 
      error: "User not found" 
    }, { status: 404 });
  }
  
  // Generate JWT tokens for the extension
  const accessToken = jwt.sign(
    { 
      userId: user.id,
      type: 'extension_access',
      source: 'direct_auth'
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  const refreshToken = jwt.sign(
    { 
      userId: user.id,
      type: 'extension_refresh',
      source: 'direct_auth'
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  // Ensure user settings exist
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      notifications: true,
      emailNotifications: true,
      theme: 'dark',
      timezone: 'UTC',
      carbonUnit: 'kg',
      privacyLevel: 'private'
    },
    update: {}
  });
  
  console.log(`Direct extension auth for user ${user.email}`);
  
  return NextResponse.json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      image: user.image
    },
    expiresIn: 24 * 60 * 60 // 24 hours in seconds
  });
}

async function handleOAuthCodeFlow(code: string, redirectUri: string, clientId?: string) {
  // Exchange authorization code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  
  if (!tokenResponse.ok) {
    const error = await tokenResponse.text();
    throw new Error(`Token exchange failed: ${error}`);
  }
  
  const { access_token } = await tokenResponse.json();
  
  // Get user info from Google
  const userInfoResponse = await fetch(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`
  );
  
  if (!userInfoResponse.ok) {
    throw new Error('Failed to get user info');
  }
  
  const googleUserInfo = await userInfoResponse.json();
  
  // Find or create user in our database
  let user = await prisma.user.findUnique({
    where: { email: googleUserInfo.email }
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        image: googleUserInfo.picture,
        emailVerified: new Date(),
        accountType: 'INDIVIDUAL'
      }
    });
  }
  
  return await generateExtensionTokens(user, 'oauth_code_flow');
}

async function handleTokenFlow(oauthToken: string, extensionId: string, clientId: string) {
  // Verify client ID is registered
  const client = EXTENSION_CLIENTS[clientId];
  if (!client) {
    return NextResponse.json({ 
      error: "Invalid client ID" 
    }, { status: 401 });
  }
  
  // Verify OAuth token with Google
  const userInfoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${oauthToken}`);
  
  if (!userInfoResponse.ok) {
    return NextResponse.json({ 
      error: "Invalid OAuth token" 
    }, { status: 401 });
  }
  
  const googleUserInfo = await userInfoResponse.json();
  
  // Find or create user in our database
  let user = await prisma.user.findUnique({
    where: { email: googleUserInfo.email }
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        image: googleUserInfo.picture,
        emailVerified: new Date(),
        accountType: 'INDIVIDUAL'
      }
    });
  }
  
  return await generateExtensionTokens(user, 'oauth_token_flow');
}

async function generateExtensionTokens(user: any, source: string) {
  // Generate JWT tokens for the extension
  const accessToken = jwt.sign(
    { 
      userId: user.id,
      type: 'extension_access',
      source
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  const refreshToken = jwt.sign(
    { 
      userId: user.id,
      type: 'extension_refresh',
      source
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
  
  // Ensure user settings exist
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      notifications: true,
      emailNotifications: true,
      theme: 'dark',
      timezone: 'UTC',
      carbonUnit: 'kg',
      privacyLevel: 'private'
    },
    update: {}
  });
  
  console.log(`Extension authenticated for user ${user.email} via ${source}`);
  
  return NextResponse.json({
    success: true,
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: user.accountType,
      image: user.image
    },
    expiresIn: 24 * 60 * 60 // 24 hours in seconds
  });
} 