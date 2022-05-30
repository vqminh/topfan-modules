import { DefaultSeo as NextDefaultSeo } from "next-seo";
import { siteSettings } from "../../../src/settings/site-settings";

export const DefaultSeo = () => {
  const { name, description } = siteSettings;
  return (
    <NextDefaultSeo
      title={name}
      description={description}
      openGraph={{
        type: "website",
        locale: "vi_VN",
        site_name: name,
      }}
      twitter={{
        handle: "@handle",
        site: "@site",
        cardType: "summary_large_image",
      }}
      additionalMetaTags={[
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1 maximum-scale=1",
        },
        {
          name: "apple-mobile-web-app-capable",
          content: "yes",
        },
        {
          name: "theme-color",
          content: "#ffffff",
        },
      ]}
      additionalLinkTags={[
        {
          rel: "apple-touch-icon",
          href: "/apple-touch-icon.png",
        },
        {
          rel: "manifest",
          href: "/manifest.json",
        },
      ]}
    />
  );
};
