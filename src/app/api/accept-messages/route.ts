import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import auth from "next-auth";
import { NextResponse as Response } from "next/server";

export async function POST(request: Request) {
    await dbConnect();

    const session = auth(authOptions);
    const user = (session as { user?: User }).user // Cast session.user to 'User'

    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: "Not Authenticated"
            },
            { status: 401 }
        );
    }

    const userId = user._id;
    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessages },
            { new: true }
        );

        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Failed to update user status"
                },
                { status: 401 }
            );
        }

        return Response.json(
            {
                success: true,
                message: "User status updated successfully",
                updatedUser
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to update user status to accept messages", error);
        return Response.json(
            {
                success: false,
                message: "Failed to update status"
            },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    const session = await auth(authOptions);
    const user = (session as { user?: User }).user

    if (!session || !user) {
        return Response.json(
            {
                success: false,
                message: "Not Authenticated"
            },
            { status: 401 }
        );
    }

    const userId = user._id; // Now, user is safely accessible from session.user

    try {
        const foundUser = await UserModel.findById(userId);

        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                { status: 404 }
            );
        }

        return Response.json(
            {
                success: true,
                isAcceptingMessage: foundUser.isAcceptingMessage
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to get message acceptance status", error);
        return Response.json(
            {
                success: false,
                message: "Failed to get message acceptance status"
            },
            { status: 500 }
        );
    }
}
