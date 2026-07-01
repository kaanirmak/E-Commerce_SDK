import { NextRequest, NextResponse } from "next/server";
import { uploadFile } from "@/actions/upload.actions";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const result = await uploadFile(formData);
    
    if (result.success) {
      return NextResponse.json({ url: result.url });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
