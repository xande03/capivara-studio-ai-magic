
export interface MusicInfo {
  title: string;
  artist: string;
  band: string;
  genre: string;
  bpm: number;
  key: string;
  lyrics: string;
  mp3Url?: string;
  thumbnail?: string;
  duration?: string;
}

export async function analyzeMusicLink(url: string): Promise<{ data?: MusicInfo; error?: string }> {
  try {
    console.log("Analyzing URL via Edge Function:", url);

    // Try edge function first (Firecrawl + Gemini) via Direct Fetch
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/music-dna`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ url }),
    }).catch(err => {
      console.error("Direct fetch error:", err);
      return null;
    });

    if (response && response.ok) {
      const data = await response.json();
      if (data?.success && data?.data) {
        const d = data.data;
        return {
          data: {
            title: d.title || "Desconhecido",
            artist: d.artist || "Desconhecido",
            band: d.band || "",
            genre: d.genre || "Indefinido",
            bpm: d.bpm || 0,
            key: d.key || "N/A",
            lyrics: d.lyrics || "Letra não disponível",
            mp3Url: d.mp3Url,
            thumbnail: d.thumbnail,
            duration: d.duration,
          },
        };
      }
    }

    console.warn("Edge function failed or returned error, using OEmbed fallback");

    // Fallback: OEmbed metadata
    let title = "";
    let artist = "";
    let thumbnail = "";

    try {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const json = await res.json();
          title = json.title || "";
          artist = json.author_name || "";
          thumbnail = json.thumbnail_url || "";
        }
      } else if (url.includes("spotify.com")) {
        const oembedUrl = `https://embed.spotify.com/oembed?url=${encodeURIComponent(url)}`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const json = await res.json();
          title = json.title || "";
          artist = json.provider_name || "";
          thumbnail = json.thumbnail_url || "";
        }
      }
    } catch (e) {
      console.warn("OEmbed fetch failed:", e);
    }

    if (!title) {
      try {
        const urlObj = new URL(url);
        title = urlObj.pathname.split("/").pop()?.replace(/[-_]/g, " ") || "Música Desconhecida";
      } catch {
        title = "Link Externo";
      }
    }

    return {
      data: {
        title,
        artist: artist || "Artista não identificado",
        band: "",
        genre: "Não identificado",
        bpm: 0,
        key: "N/A",
        lyrics: `Não foi possível extrair a letra automaticamente.\n\nBusque no Genius:\nhttps://genius.com/search?q=${encodeURIComponent(title)}`,
        thumbnail,
      },
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    return { error: error instanceof Error ? error.message : "Erro crítico na análise" };
  }
}
