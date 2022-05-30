import Cart from "../../../../src/components/cart/cart";
import { Drawer } from "./drawer";
import { useUI } from "../../../../src/contexts/ui.context";
import { getDirection } from "../../../utils/get-direction";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const VideoRecorder = dynamic(
  () => import("../video-recorder")
);

export const DRAWER = {
  VIDEO_RECORDER: "VIDEO_RECORDER",
  CART: "CART",
};

const ManagedDrawer = () => {
  const { drawerView, closeCart } = useUI();
  const { locale } = useRouter();
  const dir = getDirection(locale);
  const contentWrapperCSS = dir === "ltr" ? { right: 0 } : { left: 0 };

  return (
    <Drawer
      open={!!drawerView}
      placement={dir === "rtl" ? "left" : "right"}
      onClose={closeCart}
      handler={false}
      showMask={true}
      level={null}
      id={drawerView || "default"}
      contentWrapperStyle={contentWrapperCSS}
    >
      {drawerView === DRAWER.VIDEO_RECORDER && <VideoRecorder />}
      {drawerView === DRAWER.CART && <Cart />}
    </Drawer>
  );
};

export default ManagedDrawer;
