import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 };

/** Fondo como data URL; en caché para que la imagen se genere en el build. */
async function backgroundDataUrl(): Promise<string> {
  "use cache";
  const background = await readFile(join(process.cwd(), "public/illustrations/og-bg.jpg"));
  return `data:image/jpeg;base64,${background.toString("base64")}`;
}

/** Imagen social (Open Graph y Twitter): fondo ilustrado y texto a la izquierda. */
export async function renderSocialImage(): Promise<ImageResponse> {
  const src = await backgroundDataUrl();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "sans-serif" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse solo admite <img>. */}
        <img src={src} alt="" width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630 }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 72px", width: 640, height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 72,
                height: 72,
                borderRadius: 18,
                background: "white",
                color: "#4f46e5",
                fontSize: 44,
                fontWeight: 700,
              }}
            >
              P
            </div>
            <div style={{ fontSize: 76, fontWeight: 700, color: "white", letterSpacing: -2 }}>Postula</div>
          </div>
          <div style={{ marginTop: 36, fontSize: 50, fontWeight: 700, color: "white", lineHeight: 1.12, letterSpacing: -1 }}>
            Tu búsqueda de empleo, bajo control
          </div>
          <div style={{ marginTop: 22, fontSize: 28, color: "rgba(255,255,255,0.85)", lineHeight: 1.35 }}>
            Candidaturas, estados y notas en un solo sitio. Gratis.
          </div>
        </div>
      </div>
    ),
    { ...SOCIAL_IMAGE_SIZE },
  );
}
