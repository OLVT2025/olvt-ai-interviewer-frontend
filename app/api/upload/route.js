// app/api/upload/route.js
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import { MockInterview } from '@/utils/schema';
import { db } from "@/utils/db";
import {eq} from 'drizzle-orm'; 

export async function POST(request) {
  try {
    const { file, fileName, interviewId } = await request.json();
    
    if (!file || !fileName) {
      return NextResponse.json({ 
        error: 'File and filename are required' 
      }, { status: 400 });
    }

    // Initialize Google Drive API
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(file, 'base64');

    // Create readable stream from buffer
    const stream = new Readable();
    stream._read = () => {}; // Required implementation
    stream.push(fileBuffer);
    stream.push(null); // Signals end of stream

    // Create file metadata
    const fileMetadata = {
      name: fileName,
      description: `Interview recording for ID: ${interviewId}`,
      mimeType: 'video/webm',
    };

    try {
      // Upload file using resumable upload
      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType: 'video/webm',
          body: stream,
        },
        fields: 'id,name,webViewLink',
      });

      // Set file permissions
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Update the database with the view link
      try {
        await db.update(MockInterview)
          .set({ 
            viewLink: response.data.webViewLink 
          })
          .where(eq(MockInterview.mockId, interviewId));

        console.log('Database updated with view link');
      } catch (dbError) {
        console.error('Database update error:', dbError);
        // Continue with the response even if DB update fails
      }

      return NextResponse.json({
        success: true,
        fileId: response.data.id,
        fileName: response.data.name,
        viewLink: response.data.webViewLink,
        message: 'File uploaded successfully'
      });

    } catch (uploadError) {
      console.error('Drive API Error:', uploadError);
      return NextResponse.json({
        error: 'Drive API Error',
        details: uploadError.message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({
      error: 'Server error',
      details: error.message
    }, { status: 500 });
  }
}