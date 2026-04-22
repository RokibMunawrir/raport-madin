import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
  const path = params.path;
  
  if (!path) {
    return new Response(JSON.stringify({ error: 'Path is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await fetch(`https://wilayah.id/api/${path}`);
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to fetch wilayah data' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
