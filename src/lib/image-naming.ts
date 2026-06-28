export function generateImageName(section: string, originalFilename: string): string {
  const filenameWithoutExt = originalFilename
    .split(".")
    .slice(0, -1)
    .join(".")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const shortTimestamp = Math.floor(Date.now() / 1000);

  return `${section}-${filenameWithoutExt}-${shortTimestamp}`;
}

export function getCloudinaryFolder(section: string): string {
  return `personal-portfolio/${section}`;
}
