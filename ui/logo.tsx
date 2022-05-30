import Image from "next/image";
import Link from "./link";
import cn from "classnames";
import { siteSettings } from "../../src/settings/site-settings";
import { vercelLoader } from "../utils/firebase";
import React from "react";

const Logo: React.FC<React.AnchorHTMLAttributes<{}>> = ({
  className,
  ...props
}) => {
  return (
    <Link
      href={siteSettings.logo.href}
      className={cn("inline-flex focus:outline-none", className)}
      {...props}
    >
      <Image
        src={siteSettings.logo.url}
        alt={siteSettings.logo.alt}
        height={siteSettings.logo.height}
        width={siteSettings.logo.width}
        loader={vercelLoader}
        layout="fixed"
        loading="eager"
      />
    </Link>
  );
};

export default Logo;