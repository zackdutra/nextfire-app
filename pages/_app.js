import "../styles/globals.css";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";
import { UserContext } from "../lib/context";

import LogRocket from "logrocket";

// only initialize when in the browser
if (typeof window !== "undefined") {
  LogRocket.init("yx1rtj/fireblog");
}

import { useUserData } from "../lib/hooks";

function MyApp({ Component, pageProps }) {
  const userData = useUserData();
  return (
    <UserContext.Provider value={userData}>
      <Navbar />
      <Component {...pageProps} />
      <Toaster />
    </UserContext.Provider>
  );
}

export default MyApp;
