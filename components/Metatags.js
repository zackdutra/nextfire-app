import Head from "next/head";
import LogRocket from "logrocket";
import { useContext } from "react";
import { UserContext } from "../lib/context";

export default function Metatags({
  title = "FireBlog",
  description = "A complete Next.js + Firebase Blog",
  image,
}) {
  const { user, username } = useContext(UserContext);
  LogRocket.identify(username, {
    name: username,
  });
  return (
    <Head>
      <title>{title}</title>
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:site" content="@fireship_dev" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
    </Head>
  );
}
