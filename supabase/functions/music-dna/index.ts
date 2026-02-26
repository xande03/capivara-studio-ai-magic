const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    if (!firecrawlKey) {
      return new Response(
        JSON.stringify({ error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Scrape the URL with Firecrawl
    console.log("Scraping URL:", url);
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
      }),
    });

    const scrapeData = await scrapeRes.json();
    if (!scrapeRes.ok) {
      console.error("Firecrawl error:", scrapeData);
      return new Response(
        JSON.stringify({ error: "Failed to scrape URL: " + (scrapeData.error || scrapeRes.status) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pageContent = scrapeData?.data?.markdown || "";
    console.log("Scraped content length:", pageContent.length);

    // Step 2: Use Lovable AI to extract structured music data
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash", // Corrected model name from 2.5 to 2.0
        messages: [
          {
            role: "system",
            content: `You are a music analysis expert. Given the content scraped from a music page (YouTube, Spotify, etc.), extract all relevant music information. Use your extensive knowledge of music to fill in details not present in the page content, especially BPM, key/tonality, and complete lyrics. Always provide the complete lyrics if you know the song. For BPM and key, give your best estimate based on your knowledge of the song.`,
          },
          {
            role: "user",
            content: `Analyze the following content from a music page and extract all music information.\n\nURL: ${url}\n\nPage content:\n${pageContent ? pageContent.slice(0, 8000) : "Scraping failed or no content found. Please use the URL to identify the song and provide details based on your knowledge."}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_music_info",
              description: "Extract structured music information from a page",
              parameters: {
                type: "object",
                properties: {
                  title: { type: "string", description: "Song title" },
                  artist: { type: "string", description: "Main artist/singer name" },
                  band: { type: "string", description: "Band name if applicable, empty string if solo artist" },
                  genre: { type: "string", description: "Music genre/style (e.g. Pop, Rock, Sertanejo, Funk, etc.)" },
                  bpm: { type: "number", description: "Estimated beats per minute" },
                  key: { type: "string", description: "Musical key/tonality (e.g. C Major, Am, F#m)" },
                  lyrics: { type: "string", description: "Complete song lyrics" },
                  mp3Url: { type: "string", description: "A high-quality direct download link for the MP3 of this song if you can find one, otherwise an empty string." },
                },
                required: ["title", "artist", "genre", "bpm", "key", "lyrics"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_music_info" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiRes.text();
      console.error("AI error:", aiRes.status, errText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in AI response:", JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ error: "AI could not extract music information" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const musicInfo = JSON.parse(toolCall.function.arguments);
    console.log("Extracted music info:", musicInfo.title, "-", musicInfo.artist);

    return new Response(
      JSON.stringify({ success: true, data: musicInfo }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("music-dna error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
