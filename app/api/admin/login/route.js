import { NextResponse } from "next/server";
import { Admin } from "@/lib/sequelize";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Username dan password wajib diisi" 
        },
        { status: 400 }
      );
    }

    // Find admin by username
    const admin = await Admin.findOne({
      where: { 
        email: username
      }
    });

    if (!admin) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Username atau password salah" 
        },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await admin.checkPassword(password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Username atau password salah" 
        },
        { status: 401 }
      );
    }

    // Return success response (in production, you would set JWT token here)
    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      data: {
        id: admin.id,
        email: admin.email,
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Terjadi kesalahan pada server" 
      },
      { status: 500 }
    );
  }
}
