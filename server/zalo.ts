import { Express } from "express";
import { USERS } from "@utils/constants";
import { info, sendGetRequest } from "./request";
import { sendZaloMessage } from "@topfan-modules/utils/zalo";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

/**
 * @param app
 */
export function useZalo(app: Express) {
  app.post("/zalo/login", async (req, res) => {
    const code = req.query.code;
    const { NEXT_PUBLIC_ZALO_APP_ID, ZALO_APP_SECRET } = process.env;
    const { access_token } = await sendGetRequest(
      "oauth.zaloapp.com",
      `/v3/access_token?app_id=${NEXT_PUBLIC_ZALO_APP_ID}&app_secret=${ZALO_APP_SECRET}&code=${code}`
    );
    info({
      NEXT_PUBLIC_ZALO_APP_ID,
      ZALO_APP_SECRET,
      access_token,
    });
    const json = await sendGetRequest(
      "graph.zalo.me",
      `/v2.0/me?access_token=${access_token}&fields=id,birthday,name,gender,picture`
    );
    if (!json?.id) {
      throw new Error("Invalid access token");
    }
    const { id, name, picture, birthday, gender } = json;
    const userRef = getFirestore().collection(USERS);
    const snap = await userRef.where("zalo_uid", "==", id).limit(1).get();
    let uid: string;
    if (snap.docs.length) {
      uid = snap.docs[0].id;
    } else {
      const data = {
        displayName: name,
        photoURL: picture.data.url,
      };
      const user = await getAuth().createUser(data);
      uid = user.uid;
      await userRef.doc(uid).set({
        ...data,
        zalo_uid: id,
        gender,
        birthday,
      });
    }
    const token = await getAuth().createCustomToken(uid);
    res.json({ token });
  });

  app.post("/zalo/opt_out", async (req, res) => {
    await getFirestore().collection(USERS).doc(req.body.uid).update({
      zalo_uid: FieldValue.delete(),
    });
    res.json({});
  });

  app.post("/admin/zalo/send", async (req, res) => {
    const user_id = req.body.psid;
    const message = req.body.value;
    await sendZaloMessage(user_id, message);
    res.json({});
  });
}
