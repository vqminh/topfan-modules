import cn from "classnames";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "overlayscrollbars/css/OverlayScrollbars.css";
import React from "react";

type ScrollbarProps = {
  options?: any;
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onScrollEnd?: () => any;
};

const Scrollbar: React.FC<ScrollbarProps> = ({
  options,
  children,
  style,
  className,
  ...props
}) => {
  return (
    <OverlayScrollbarsComponent
      options={{
        className: cn("os-theme-thin", className),
        scrollbars: {
          autoHide: "scroll",
        },
        callbacks: {
          onScroll: props.onScrollEnd
            ? (e) => {
                const element = e?.target as HTMLDivElement;
                if (
                  element.scrollHeight - element.scrollTop ===
                  element.clientHeight
                ) {
                  props.onScrollEnd?.();
                }
              }
            : null,
        },
        ...options,
      }}
      style={style}
      {...props}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
};

export default Scrollbar;
