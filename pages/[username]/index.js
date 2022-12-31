import { getUserWithUsername, postToJSON } from "../../lib/firebase";
import {
  getFirestore,
  collection,
  where,
  getDocs,
  query as fireQuery,
  orderBy,
  limit,
} from "firebase/firestore";
import UserProfile from "../../components/UserProfile";
import PostFeed from "../../components/PostFeed";
import Metatags from "../../components/Metatags";
export async function getServerSideProps({ query }) {
  const { username } = query;

  const userDoc = await getUserWithUsername(username);

  // If no user, short circuit to 404 page
  if (!userDoc) {
    return {
      notFound: true,
    };
  }

  // JSON serializable data
  let user = null;
  let posts = null;

  if (userDoc) {
    user = userDoc.data();

    const postsQuery = fireQuery(
      collection(getFirestore(), userDoc.ref.path, "posts"),
      where("published", "==", true),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    posts = (await getDocs(postsQuery)).docs.map(postToJSON);
    console.log("posts in users page", posts);
  }

  return {
    props: { user, posts },
  };
}

export default function UserProfilePage({ user, posts }) {
  return (
    <main>
      <Metatags title={`${user.username}'s posts`} />
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </main>
  );
}
