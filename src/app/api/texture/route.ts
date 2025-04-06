import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return new NextResponse('URL parameter is required', { status: 400 });
    }

    // что URL ведет на Firebase Storage
    const allowedDomains = [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com'
    ];
    
    const urlObj = new URL(url);
    if (!allowedDomains.includes(urlObj.hostname)) {
      return new NextResponse('Forbidden domain', { status: 403 });
    }

    // Загружаем изображение
    const response = await fetch(url, {
      headers: {
        'Referrer-Policy': 'no-referrer-when-downgrade'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    //  изображение с правильными заголовками
    return new NextResponse(response.body, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });

  } catch (error) {
    console.error('Texture proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}