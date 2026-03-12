import { supabase }  from "@/lib/supabaseClient";

export async function uploadImages(
  files: File[],
  userId: string
): Promise<string[]> {
  const urls: string[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    // ✅ EXACT bucket name from Supabase
    const { error } = await supabase.storage
      .from("products-images")
      .upload(filePath, file);

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage
      .from("products-images")
      .getPublicUrl(filePath);

    urls.push(data.publicUrl);
  }

  return urls;
}
