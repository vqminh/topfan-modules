import Button from "../../ui/button";
import { useTranslation } from "next-i18next";
import React from "react";
import { ImFacebook2, ImGoogle2 } from "react-icons/im";
import { reportError } from "../../utils/logging";
import { ZaloIcon } from "../icons/zalo-icon";
import {
  AuthProvider,
  FacebookAuthProvider,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider,
  linkWithCredential,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { auth } from "../../utils/firebase";
import { SignInMethod } from "@firebase/auth";
import { sendEvent } from "../../utils/gtag";

function getProvider(providerId: string) {
  switch (providerId) {
    case GoogleAuthProvider.PROVIDER_ID:
      return new GoogleAuthProvider();
    case FacebookAuthProvider.PROVIDER_ID:
      return new FacebookAuthProvider();
    default:
      throw new Error(`No provider implemented for ${providerId}`);
  }
}

async function handleLogin(provider: AuthProvider) {
  try {
    sendEvent({action: "SignUp", category: provider.providerId, value: 1})
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    // https://stackoverflow.com/questions/44015751/firebase-js-api-auth-account-exists-with-different-credential
    const email = error.email;
    const credential = error.credential;
    if (
      email &&
      credential &&
      error.code === "auth/account-exists-with-different-credential"
    ) {
      const providers = await fetchSignInMethodsForEmail(auth, email);
      const supportedPopupSignInMethods = [
        SignInMethod.GOOGLE,
        SignInMethod.FACEBOOK,
      ];
      const firstPopupProviderMethod = supportedPopupSignInMethods.find((p) =>
        providers.includes(p)
      );

      // Test: Could this happen with email link then trying social provider?
      if (!firstPopupProviderMethod) {
        throw new Error(
          `Your account is linked to a provider that isn't supported.`
        );
      }

      const linkedProvider = getProvider(firstPopupProviderMethod);
      linkedProvider.setCustomParameters({ login_hint: email });

      const result = await signInWithPopup(auth, linkedProvider);
      if (result.user) {
        return await linkWithCredential(result.user, credential);
      }
    }
    throw error;
  }
}

export default function LoginSocial({
  isLoading,
  onSuccess,
}: {
  isLoading: boolean;
  onSuccess: (auth: UserCredential) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <Button
        type="submit"
        loading={isLoading}
        disabled={isLoading}
        className="h-11 md:h-12 w-full mt-2.5 bg-facebook hover:bg-facebookHover"
        onClick={() =>
          handleLogin(new FacebookAuthProvider())
            .then(onSuccess)
            .catch(reportError)
        }
      >
        <ImFacebook2 className="text-sm sm:text-base me-1.5" />
        {t("common:text-login-with-facebook")}
      </Button>
      <Button
        type="submit"
        loading={isLoading}
        disabled={isLoading}
        className="h-11 md:h-12 w-full mt-2.5 bg-google hover:bg-googleHover"
        onClick={() =>
          handleLogin(new GoogleAuthProvider())
            .then(onSuccess)
            .catch(reportError)
        }
      >
        <ImGoogle2 className="text-sm sm:text-base me-1.5" />
        {t("common:text-login-with-google")}
      </Button>
      <Button
        type="submit"
        loading={isLoading}
        disabled={isLoading}
        className="h-11 md:h-12 w-full mt-2.5 bg-blue-600 hover:bg-blue-700"
        onClick={() =>
          (window.location.href = `https://oauth.zaloapp.com/v3/auth?app_id=${process.env.NEXT_PUBLIC_ZALO_APP_ID}&redirect_uri=${window.location.origin}/zalo-confirm&state=${window.location.pathname}`)
        }
      >
        <ZaloIcon className="text-sm sm:text-base me-1.5" />
        {t("common:text-login-with-zalo")}
      </Button>
      <div className="flex flex-col items-center justify-center relative text-sm text-heading mt-12 mb-7">
        <hr className="w-full border-gray-300" />
        <span className="absolute -top-2.5 px-2 bg-primary">
          {t("common:text-or")}
        </span>
      </div>
    </>
  );
}
