import type { SupabaseClient } from "@supabase/supabase-js";

export async function uploadFile(
  supabase: SupabaseClient,
  file: File,
  folder: "avatars" | "covers",
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${user.id}/${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("public-assets")
    .upload(path, file, { upsert: true });
  if (error) {
    console.error("upload error", error);
    return null;
  }
  const { data } = supabase.storage.from("public-assets").getPublicUrl(path);
  return data.publicUrl;
}
