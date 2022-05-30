import NextLink, { LinkProps as NextLinkProps } from "next/link";
import React, { MouseEventHandler } from "react";

const Link: React.FC<
  NextLinkProps & {
    children?: React.ReactNode | JSX.Element | string | undefined | null;
    className?: string;
    target?: string;
    onClick?: MouseEventHandler;
  }
> = ({ href, onClick, children, ...props }) => {
  return (
    <NextLink href={href}>
      <a onClick={onClick} {...props}>
        {children}
      </a>
    </NextLink>
  );
};

export default Link;
