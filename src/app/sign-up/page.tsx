import { getSessionFromCookie } from "@/utils/auth";
import SignUpClientComponent from "./sign-up.client";


const SignUpPage = async () => {
  const session = await getSessionFromCookie();

  return (
    <div>
      {session ? <p>You are signed in</p> : <SignUpClientComponent />}
    </div>
  );
};

export default SignUpPage;
