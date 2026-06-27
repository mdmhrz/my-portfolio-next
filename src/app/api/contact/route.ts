import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  type: z.enum(["Freelance project", "Full-time role", "Collaboration", "Other"]),
  message: z.string().min(1, "Message is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = contactSchema.parse(body);

    const message = await prisma.message.create({
      data: {
        name: validated.name,
        email: validated.email,
        type: validated.type,
        message: validated.message,
      },
    });

    return NextResponse.json({ success: true, message: "Message saved", data: message });
  } catch (error) {
    console.error("Error in contact form submission API:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
