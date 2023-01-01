import LogRocket from "logrocket";
import { useContext } from "react";
import { UserContext } from "../lib/context";

export default function Logrocket() {
  const { user, username } = useContext(UserContext);
  LogRocket.identify(username, {
    name: username,
  });
}
