import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import api from "../api/axios";
import { Navigate, Link, useNavigate } from "react-router-dom";
import "../main.css";
import UpdateProfile from './UpdateProfile'
function Login({ setUser }) {
  const [loading, setLoading] = useState(false);
  const [Credentials, setCredentials] = useState({email:"",password:""});
  const [Info, setInfo] = useState({name:"",bio:"",departement:"",year:""});
    const [showpass,updateShowPass] = useState(false)

  const onChange = (e) => {
    setInfo({...Info , [e.target.name] : e.target.value});
  };

  let history = useNavigate();
  const handleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);

      const res = await api.post("/api/auth/google", {
        token: credentialResponse.credential,
      });
      const user = res.data.user;
      setUser(user);
      if(!user.department||!user.year){
        localStorage.setItem("token", res.data.token);
        history("/UpdateProfile");
      }
      else{
        localStorage.setItem("token", res.data.token);
        history("/ArticlesPage");
      }
    } catch (error) {
      alert(error.response?.data?.message|| "Login failed" );
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await api.post(`${host}api/auth/login`, Credentials);
    if(response.success){
        localStorage.setItem('token',response.authToken)
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
