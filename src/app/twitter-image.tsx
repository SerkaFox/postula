import { renderSocialImage } from "@/components/social-image";

export const alt = "Postula: tu búsqueda de empleo, bajo control";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderSocialImage();
}
