import { GoogleLogin } from "@react-oauth/google";
import jwtDecode from "jwt-decode";

export default function GoogleLoginButton() {
  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        const decodedToken = jwtDecode(credentialResponse.credential);
        console.log("User Info:", decodedToken);
        localStorage.setItem("authToken", credentialResponse.credential);
      }}
      onError={() => {
        console.log("Login Failed");
      }}
    />
  );
}
