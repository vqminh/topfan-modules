import { useUI } from "../../src/contexts/ui.context";
import { useMutation } from "react-query";
import { generatePassword } from "./strings";
import { Profile } from "../../src/types/account";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { auth, firestore } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { PUBLIC_PROFILES } from "../../src/utils/constants";
import { User } from "@firebase/auth";

export async function updateUserProfile(
  user: User,
  input: {
    photoURL?: string | null;
    displayName?: string;
    phoneNumber?: string;
    email?: string;
  }
) {
  const { displayName, photoURL, phoneNumber, email } = input;
  await updateProfile(user, { displayName, photoURL });
  await setDoc(
    doc(firestore, PUBLIC_PROFILES, user.uid),
    { displayName, photoURL, phoneNumber, email },
    {
      merge: true,
    }
  );
}

async function signUp(input: Profile) {
  const { email } = input;

  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    generatePassword()
  );
  const { user } = credential;
  await updateUserProfile(user, input);
  await sendEmailVerification(user);
  return credential;
}

export const useSignUpMutation = () => {
  const { closeModal } = useUI();
  return useMutation((input: Profile) => signUp(input), {
    onSuccess: closeModal,
    onError: (data) => {
      console.log(data, "login error response");
    },
  });
};
