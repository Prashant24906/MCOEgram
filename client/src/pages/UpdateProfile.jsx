import React from "react";
import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function UpdateProfile() {
  const [Info, setInfo] = useState({
    name: "",
    bio: "",
    year: "",
    department: "",
  });
  const history = useNavigate();
  const onChange = (e) => {
    setInfo({ ...Info, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    try {
      const response = await api.put("/api/users/update", Info);
      history("/ArticlesPage");
    } catch (error) {
        alert(error)
    } 
  };
  return (
    <>
      <div className="login">
        <h1>Input Details</h1>
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <div className="Input-box ">
            <input
              type="text"
              name="name"
              value={Info.name}
              onChange={onChange}
              className="form-control mb-2"
              placeholder="Name"
            />
            <input
              type="text"
              name="bio"
              value={Info.bio}
              onChange={onChange}
              className="form-control mb-2"
              placeholder="Bio"
            />
            <input
              type="text"
              name="department"
              value={Info.department}
              onChange={onChange}
              className="form-control mb-2"
              placeholder="Department"
            />
            <input
              type="text"
              name="year"
              value={Info.year}
              onChange={onChange}
              className="form-control mb-2"
              placeholder="Year"
            />
            <button
              className="btn btn-primary "
              onClick={()=>{
                
                  (Info.department && Info.name && Info.year && Info.bio)
                  ? (handleSubmit())
                  : (alert("Please fill all the Details"))
                  
                }
            }
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
