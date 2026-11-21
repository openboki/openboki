// JWT_SECRETからanonキー(role: anonのJWT、10年有効)を作る。使い方: JWT_SECRET=... node deploy/anon-key.mjs
import { createHmac } from "node:crypto";

const secret = process.env.JWT_SECRET;
if (!secret || secret.length < 32) {
  console.error("JWT_SECRETを32文字以上で渡してください");
  process.exit(1);
}
const b64 = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const body = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ role: "anon", iss: "supabase", iat: now, exp: now + 10 * 365 * 24 * 3600 })}`;
console.log(`${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`);
