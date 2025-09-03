import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, title, message } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
      );
    }

    let conversation;

    // If we have a message to create
    if (message?.content) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          title: title ?? "Untitled",
          message: {
            create: [
              {
                role: "user", // or dynamic: message.role ?? "user"
                content: message.content,
                sequence: 1,
                storageRefs: message.storageRefs
                  ? {
                      create: message.storageRefs.map((ref: { url: string; type: string }) => ({
                        url: ref.url,
                        type: ref.type,
                      })),
                    }
                  : undefined,
              },
            ],
          },
        },
        include: {
          message: {
            include: {
              storageRefs: true,
            },
          },
        },
      });
    } else {
      // Just create the conversation
      conversation = await prisma.conversation.create({
        data: {
          userId,
          title: title ?? "Untitled",
        },
      });
    }

    return NextResponse.json(conversation, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
