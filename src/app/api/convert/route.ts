import { NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || !ytdl.validateURL(url)) {
      return NextResponse.json({ error: 'A valid YouTube URL is required.' }, { status: 400 });
    }

    // Fetch video metadata
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;

    const title = videoDetails.title.replace(/[^\w\s]/gi, '').trim() || 'audio';
    const author = videoDetails.author.name;
    const thumbnail = videoDetails.thumbnails[videoDetails.thumbnails.length - 1]?.url;

    return NextResponse.json({
      success: true,
      title,
      author,
      thumbnail,
      downloadUrl: url
    });

  } catch (error) {
    console.error("Backend Error:", error);
    return NextResponse.json({ error: 'Failed to process video metadata.' }, { status: 500 });
  }
}
