import type { MetadataRoute } from "next";

export function avecAnglais(pages: MetadataRoute.Sitemap, baseUrl: string): MetadataRoute.Sitemap {
  return pages.flatMap((page) => {
    const chemin = page.url.slice(baseUrl.length);
    const urlAnglaise = `${baseUrl}/en${chemin}`;
    const alternates = { languages: { fr: page.url, en: urlAnglaise } };
    return [{ ...page, alternates }, { ...page, url: urlAnglaise, alternates }];
  });
}
