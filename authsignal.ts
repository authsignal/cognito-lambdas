import { Authsignal } from "@authsignal/node";

const apiSecretKey = process.env.AUTHSIGNAL_SECRET!;
const apiUrl = process.env.AUTHSIGNAL_URL!;

export const authsignal = new Authsignal({ apiSecretKey, apiUrl });
