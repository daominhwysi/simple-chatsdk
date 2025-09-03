// app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Missing required field: email" },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name ?? null,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    console.error("create user error:", err);
    if (err.code === "P2002") {
      // Prisma unique constraint violation (duplicate email)
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create user", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
