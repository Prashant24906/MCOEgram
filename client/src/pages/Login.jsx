import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import api from "../api/axios";
import { Navigate, Link, useNavigate } from "react-router-dom";
import "../main.css";
function Login({ setUser }) {
  const [loading, setLoading] = useState(false);
  const [Credentials, setCredentials] = useState({email:"",password:""});
    const [showpass,updateShowPass] = useState(false)

  const onChange = (e) => {
    setCredentials({...Credentials , [e.target.name] : e.target.value});
  };

  const PasswordVisibility=()=>{
    if(showpass===false){
        updateShowPass(true)
    }
    else updateShowPass(false);
  }


  let history = useNavigate();
  const handleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);

      const res = await api.post("/api/auth/google", {
        token: credentialResponse.credential,
      });

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      history("/ArticlesPage");
    } catch (error) {
      alert(error.response?.data?.message|| "Login failed" );
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${host}api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        
        },
      body: JSON.stringify( {email:Credentials.email,password: Credentials.password} )
    });
    const state = await response.json()
    if(state.success){
        localStorage.setItem('token',state.authToken)
        props.showAlert("Login Successfull","success")
        history('/')
    }
    else{
        props.showAlert("Invalid Credentials","danger")
    }
};
  return (
    <>
    
      <div className="login">
        <h1>Login to MCOEGRAM</h1>
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        

        {loading ? (
          <p>Signing you in...</p>
        ) : (
          <div className = "GoogleLogin">

          <GoogleLogin 
          onSuccess={handleSuccess}
          onError={() => alert("Google Login Failed")}
          />
          </div>
        )}
      </div>
        </div>
    </>
  );
}

export default Login;
