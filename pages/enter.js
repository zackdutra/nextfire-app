import styles from "../styles/Enter.module.css";
import { auth, firestore, googleAuthProvider, provider } from "../lib/firebase";
import { doc, writeBatch, getDoc, getFirestore } from "firebase/firestore";
import {
  signInWithPopup,
  signInWithRedirect,
  OAuthProvider,
  signInAnonymously,
  signOut,
} from "firebase/auth";
import { UserContext } from "../lib/context";

import { useEffect, useState, useCallback, useContext } from "react";
import debounce from "lodash.debounce";
import camelCase from "lodash.camelcase";

export default function Enter(props) {
  const { user, username } = useContext(UserContext);
  // 1. user signed out <SignInButton />
  // 2. user signed in, but missing username <UsernameForm />
  // 3. user signed in, has username <SignOutButton />
  return (
    <main className={styles.enter}>
      {user ? (
        !username ? (
          <UsernameForm />
        ) : (
          <SignOutButton />
        )
      ) : (
        <>
          <GoogleSignInButton />
          <BaysideSignInButton />
        </>
      )}
    </main>
  );
}
// Sign in with Google Button
function GoogleSignInButton() {
  const signInWithGoogle = async () => {
    await signInWithRedirect(auth, googleAuthProvider);
  };
  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <img src={"/google.png"} alt="Google Icon" />
      Sign in with Google
    </button>
  );
}

// Sign in with Bayside Button
function BaysideSignInButton() {
  const signInWithBayside = async () => {
    await signInWithRedirect(auth, provider);
  };
  return (
    <button className="btn-google" onClick={signInWithBayside}>
      <img src={"/Bayside_B-01.png"} alt="Bayside Icon" />
      Sign in with Bayside
    </button>
  );
}

//Sign out button
function SignOutButton() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>;
}

// Pick username
function UsernameForm() {
  const { user, username } = useContext(UserContext);

  function cleanUserDisplayName(displayName) {
    let newDisplayName = camelCase(displayName);
    return newDisplayName.toLowerCase();
  }
  const defaultDisplayName = cleanUserDisplayName(user.displayName);

  const [formValue, setFormValue] = useState(defaultDisplayName);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    // Create refs for both documents
    const userDoc = doc(getFirestore(), "users", user.uid);
    const usernameDoc = doc(getFirestore(), "usernames", formValue);

    // Commit both docs together as a batch write.
    const batch = writeBatch(getFirestore());
    batch.set(userDoc, {
      username: formValue,
      photoURL: user.photoURL,
      displayName: user.displayName,
    });
    batch.set(usernameDoc, { uid: user.uid });

    await batch.commit();
  };

  const onChange = (e) => {
    //Force form value typed in form to match correct format
    console.log(`Trying`);

    const val = e.target.value.toLowerCase();
    console.log(`Trying ${val}`);

    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    //Only set form value if Length is > 3 or it passes Regex
    if (val.length < 3) {
      setFormValue(val);
      setLoading(false);
      setIsValid(false);
    }

    if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  //Hit the database for username match after each debounced change
  //useCallback is required for debounce to work
  const checkUsername = useCallback(
    debounce(async (username) => {
      if (username.length >= 3) {
        const ref = doc(getFirestore(), "usernames", username);
        const snap = await getDoc(ref);
        console.log("Firestore read executed!", snap.exists());
        setIsValid(!snap.exists());
        setLoading(false);
      }
    }, 500),
    []
  );

  return (
    !username && (
      <section>
        <h3>Choose a Username</h3>
        <form onSubmit={onSubmit}>
          <input
            name="username"
            placeholder="username"
            value={formValue}
            onChange={onChange}
          />
          <UsernameMessage
            username={formValue}
            isValid={isValid}
            loading={loading}
          />
          <button className="btn-green" type="submit" disabled={!isValid}>
            Choose
          </button>
        </form>
      </section>
    )
  );
}

function UsernameMessage({ username, isValid, loading }) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}
