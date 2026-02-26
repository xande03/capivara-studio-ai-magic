import { supabase } from "@/integrations/supabase/client";

export interface MusicInfo {
  title: string;
  artist: string;
  band: string;
  genre: string;
  bpm: number;
  key: string;
  lyrics: string;
  mp3Url?: string;
}

export async function analyzeMusicLink(url: string): Promise<{ data?: MusicInfo; error?: string }> {
  const { data, error } = await supabase.functions.invoke("music-dna", {
    body: { url },
  });

  if (error) {
    return { error: error.message };
  }

  if (data?.error) {
    return { error: data.error };
  }

  return { data: data?.data };
}
