import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-jwt-secret';

export async function POST(request: Request) {
  try {
    const { userId, extensionId } = await request.json();
    console.log('🔍 Extension verification request:', { userId, extensionId });
    
    // Check if authorization header exists
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "No valid token provided" }, { status: 401 });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    // Validate token claims
    if (decoded.type !== 'extension_access' || 
        decoded.userId !== userId ||
        (decoded.extensionId && decoded.extensionId !== extensionId && decoded.extensionId !== 'web_direct_connection')) {
      console.error('Token validation details:', {
        tokenType: decoded.type,
        tokenUserId: decoded.userId,
        requestUserId: userId,
        tokenExtensionId: decoded.extensionId,
        requestExtensionId: extensionId,
        source: decoded.source
      });
      return NextResponse.json({ error: "Token validation failed" }, { status: 401 });
    }
    
    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        accountType: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accountType: user.accountType
      }
    });
    
  } catch (error) {
    console.error('Extension auth verification failed:', error);
    return NextResponse.json(
      { error: 'Authentication verification failed' },
      { status: 500 }
    );
  }
} 