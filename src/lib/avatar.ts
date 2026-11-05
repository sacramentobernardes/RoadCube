const SIZE = 160;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

/**
 * Corta a foto em quadrado e reduz a 160 px no navegador. Reescrever a imagem
 * no canvas também descarta metadados, como a localização gravada pelo celular.
 */
export async function imageToAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");
  if (file.size > MAX_FILE_BYTES) throw new Error("A imagem precisa ter até 8 MB.");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("Não foi possível abrir essa imagem. Tente uma foto JPG ou PNG.");
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = SIZE;
  canvas.getContext("2d")!.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();
  return canvas.toDataURL("image/webp", 0.82);
}
