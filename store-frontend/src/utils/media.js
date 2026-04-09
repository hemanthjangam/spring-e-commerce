import { API_BASE_URL } from "../api";

export function resolveImageUrl(imageUrl, fallbackUrl) {
  if (!imageUrl) {
    return fallbackUrl;
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  return `${API_BASE_URL}${imageUrl}`;
}
