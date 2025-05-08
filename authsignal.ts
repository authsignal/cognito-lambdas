import { Authsignal } from "@authsignal/node";
import axios from "axios";

const apiSecretKey = process.env.AUTHSIGNAL_SECRET!;
const apiUrl = process.env.AUTHSIGNAL_URL!;

export const authsignal = new Authsignal({ apiSecretKey, apiUrl });

interface User {
  userId: string;
  username?: string;
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
  phoneNumberVerified?: boolean;
}

export async function queryUsersByEmail(email: string): Promise<User[]> {
  const apiSecretKey = process.env.AUTHSIGNAL_SECRET!;
  const apiUrl = process.env.AUTHSIGNAL_URL!;

  const url = `${apiUrl}/users?email=${email}`;

  const config = {
    auth: {
      username: apiSecretKey,
      password: "",
    },
  };

  const response = await axios.get<User[]>(url, config);

  return response.data;
}

export async function queryUsersByPhoneNumber(phoneNumber: string): Promise<User[]> {
  const apiSecretKey = process.env.AUTHSIGNAL_SECRET!;
  const apiUrl = process.env.AUTHSIGNAL_URL!;

  const url = new URL(`${apiUrl}/users`);

  url.searchParams.append("phoneNumber", phoneNumber);

  const config = {
    auth: {
      username: apiSecretKey,
      password: "",
    },
  };

  const urlString = url.toString();

  const response = await axios.get<User[]>(urlString, config);

  return response.data;
}
