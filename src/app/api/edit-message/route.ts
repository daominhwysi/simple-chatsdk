import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// {
//   "id": "msg123",
//   "conversationId": "conv456",
//   "role": "user",
//   "content": "Hello!",
//   "sequence": 1,
//   "createdAt": "2025-09-03T12:00:00Z",
//   "storageRefs": [
//     {
//       "url": "https://storage.example.com/file.pdf",
//       "type": "application/pdf",
//       "createdAt": "2025-09-03T12:00:01Z"
//     }
//   ]
// }
async function PUT(request : NextRequest) {
    try {
        const { messageId, message } = await request.json()
        const data: any = {}
        if (message.content !== undefined) {
            data.content = message.content
        }

        if (message.role !== undefined) {
            data.role = message.role
        }

        if (message.storageRefs !== undefined) {
            // Replace all storageRefs with new ones
            data.storageRefs = {
            deleteMany: {}, // clear old refs
            create: message.storageRefs.map((ref: { id: any; url: any; type: any; }) => ({
                url: ref.url,
                type: ref.type,
            })),
            }
        }

        const updated = await prisma.message.update({
            where: {
                conversationId_sequence: {
                    conversationId: message.conversationId,
                    sequence: message.sequence,
                },
            },
            data,
        })
        return NextResponse.json(updated, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({error : "Failed to update message"}, {status : 500 })
    }

}