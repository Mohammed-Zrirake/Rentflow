import axios from "axios";
import { getSession, signOut } from "next-auth/react";
import NextAuth, { DefaultSession, DefaultUser, Session } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";





let getSessionPromise: Promise<Session | null> | null = null;


const fetchAndCacheSession = () => {
  if (!getSessionPromise) {
    getSessionPromise = getSession();
  }
  return getSessionPromise;
};

const clearSessionCache = () => {
  getSessionPromise = null;
};


const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(
  async (config) => {
    if (config.headers.Authorization) {
      return config;
    }

    try {
      const session = await fetchAndCacheSession();

      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    } catch (error) {
      console.error("Error fetching session for interceptor:", error);
      clearSessionCache();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

 api.interceptors.response.use(
   (response) => {
     return response;
   },
   (error) => {
     if (error.response?.status === 401) {
       console.error("Authentication Error: Token is invalid. Signing out.");
       clearSessionCache();
       signOut({ callbackUrl: "/login" });
     }
     return Promise.reject(error);
   }
 );

 export default api;
