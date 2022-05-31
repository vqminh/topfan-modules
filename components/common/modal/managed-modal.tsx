import { useUI } from "src/contexts/ui.context";
import Modal from "./modal";
import dynamic from "next/dynamic";
import Newsletter from "../newsletter";
import React from "react";

const LoginForm = dynamic(() => import("../../auth/login-form"));
const SignUpForm = dynamic(() => import("../../auth/signup-form"));
const InviteForm = dynamic(() => import("../../auth/invite-form"));
const ForgetPasswordForm = dynamic(
  () => import("../../auth/forget-password-form")
);
const ProductPopup = dynamic(() => import("@components/product/product-popup"));
const ImageCropper = dynamic(() => import("../image-cropper"));
const VideoUploader = dynamic(
  () => import("../video-uploader")
);
const ConfirmationForm = dynamic(
  () => import("../confirmation-form")
);

export const MODAL = {
  CONFIRMATION: "0",
  LOGIN: "1",
};

const ManagedModal: React.FC<{ children?: React.ReactNode }>= () => {
  const { displayModal, closeModal, modalView } = useUI();

  if (!displayModal) {
    return null;
  }

  return (
    <Modal open={displayModal} onClose={closeModal}>
      {modalView === MODAL.LOGIN && <LoginForm />}
      {modalView === "SIGN_UP_VIEW" && <SignUpForm />}
      {modalView === "INVITE_VIEW" && <InviteForm />}
      {modalView === "FORGET_PASSWORD" && <ForgetPasswordForm />}
      {modalView === "PRODUCT_VIEW" && <ProductPopup />}
      {modalView === "NEWSLETTER_VIEW" && <Newsletter />}
      {modalView === "IMAGE_CROPPER_VIEW" && <ImageCropper />}
      {modalView === "VIDEO_UPLOAD_VIEW" && <VideoUploader />}
      {modalView == MODAL.CONFIRMATION && <ConfirmationForm />}
    </Modal>
  );
};

export default ManagedModal;
