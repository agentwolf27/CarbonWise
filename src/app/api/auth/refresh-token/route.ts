import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-jwt-secret';

export async function POST(request: Request) {
  try {
    const { refreshToken, extensionId, clientId } = await request.json();
    
    if (!refreshToken || !extensionId || !clientId) {
      return NextResponse.json({ 
        error: "Missing required fields" 
      }, { status: 400 });
    }
    
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json({ 
        error: "Invalid refresh token" 
      }, { status: 401 });
    }
    
    // Validate token type and claims
    if (decoded.type !== 'extension_refresh' || 
        decoded.extensionId !== extensionId || 
        decoded.clientId !== clientId) {
      return NextResponse.json({ 
        error: "Token validation failed" 
      }, { status: 401 });
    }
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true,
        image: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ 
        error: "User not found" 
      }, { status: 404 });
    }
    
    // Generate new access token
    const newAccessToken = jwt.sign(
      { 
        userId: user.id,
        extensionId,
        clientId,
        type: 'extension_access'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Optionally rotate refresh token for enhanced security
    const newRefreshToken = jwt.sign(
      { 
        userId: user.id,
        extensionId,
        clientId,
        type: 'extension_refresh'
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        image: user.image
      },
      expiresIn: 24 * 60 * 60 // 24 hours in seconds
    });
    
  } catch (error) {
    console.error('Token refresh failed:', error);
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
} 