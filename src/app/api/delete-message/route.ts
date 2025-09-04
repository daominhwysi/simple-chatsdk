import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: NextRequest){
    try {
        const { messageId } = await request.json()
        await prisma.message.delete({
            where: { id : messageId }
        })
        return NextResponse.json({ message: "Message Sucessfully deleted " }, {status: 201})
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error : "Failed to delete message" }, {status: 500})
    }

}