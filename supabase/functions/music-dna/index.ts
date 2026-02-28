// Music DNA Edge Function - no auth required

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getOEmbedData(url: string) {
  try {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const json = await res.json();
        return {
          title: json.title || "",
          artist: json.author_name || "",
          thumbnail: json.thumbnail_url || "",
        };
      }
    } else if (url.includes("spotify.com")) {
      const oembedUrl = `https://embed.spotify.com/oembed?url=${encodeURIComponent(url)}`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const json = await res.json();
        return {
          title: json.title || "",
          artist: json.provider_name || "",
          thumbnail: json.thumbnail_url || "",
        };
      }
    }
  } catch (e) {
    console.warn("OEmbed fetch failed in Edge Function:", e);
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 0: Fast Meta Data (OEmbed)
    const quickMeta = await getOEmbedData(url);
    console.log("Quick Meta (OEmbed):", quickMeta);

    // Step 1: Scrape the URL with Firecrawl
    let pageContent = "";
    if (firecrawlKey) {
      try {
        const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: url.trim(),
            formats: ["markdown"],
            onlyMainContent: true,
            timeout: 12000, // Safe timeout
          }),
        });

        if (scrapeRes.ok) {
          const contentType = scrapeRes.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const scrapeData = await scrapeRes.json();
            pageContent = scrapeData?.data?.markdown || "";
          }
        }
      } catch (err) {
        console.warn("Scraping failed, will rely on AI knowledge:", (err as Error).message);
      }
    }

    // Step 2: Use Lovable AI to extract structured music data
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a high-level music analysis expert. Your goal is to provide TOTAL FIDELITY information.
            - IDENTIFICATION: Use the URL and OEmbed Metadata as the "Ground Truth" to identify the EXACT song and artist.
            - LYRICS: Provide the COMPLETE and VERIFIED lyrics for the identified song from your internal knowledge. Ignore scraped content if it contains irrelevant text, navigation, or is for a different song.
            - DNA SPECS: BPM and Key must be accurate as per professional music theory for the identified track.
            - FORMAT: Always return the data in the specified structured format.`,
          },
          {
            role: "user",
            content: `Expertly analyze this music:
            URL: ${url}
            OEmbed Metadata (Verified): ${quickMeta ? JSON.stringify(quickMeta) : "N/A"}
            Scraped Context: ${pageContent ? pageContent.slice(0, 4000) : "Scraping timed out or failed. Rely on Metadata and your knowledge."}
            
            Identify the song and return accurate BPM, Key, Genre, and the COMPLETE lyrics.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_music_info",
              description: "Extract structured music information",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  artist: { type: "string" },
                  genre: { type: "string" },
                  bpm: { type: "number" },
                  key: { type: "string" },
                  lyrics: { type: "string" },
                  thumbnail: { type: "string", description: "URL of the music/video thumbnail" },
                },
                required: ["title", "artist", "genre", "bpm", "key", "lyrics", "thumbnail"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_music_info" } },
      }),
    });

    if (!aiRes.ok) throw new Error("AI Gateway Error");

    const aiData = await aiRes.json();
    const args = aiData.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("AI Analysis Empty");

    const musicInfo = JSON.parse(args);
    if (!musicInfo.thumbnail && quickMeta?.thumbnail) musicInfo.thumbnail = quickMeta.thumbnail;

    return new Response(
      JSON.stringify({ success: true, data: musicInfo }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("music-dna error:", error);
    return new Response(
      JSON.stringify({ error: "Ocorreu um erro ao processar o DNA da música. Tente novamente." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
