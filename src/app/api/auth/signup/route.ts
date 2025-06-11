import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { UserAccountType } from '@/generated/prisma/index.d'

export async function POST(request: Request) {
  try {
    const { name, email, password, accountType } = await request.json()

    // Validate input
    if (!name || !email || !password || !accountType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    if (!Object.values(UserAccountType).includes(accountType)) {
      return NextResponse.json(
        { error: "Invalid account type" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        accountType,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      }
    })

    // Create default user settings
    await prisma.userSettings.create({
      data: {
        userId: user.id,
      }
    })

    // Create default goals
    await prisma.goal.create({
      data: {
        userId: user.id,
        title: "Weekly Carbon Goal",
        description: "Reduce weekly carbon footprint",
        target: 20,
        unit: "kg CO₂",
        period: "weekly",
      }
    })

    return NextResponse.json({
      message: "User created successfully",
      user
    })

  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 