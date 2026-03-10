import React from "react";
import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

export default function UpdateProfile() {
  const Department = [
    { label: "CS" },
    { label: "IT" },
    { label: "ENTC" },
    { label: "AIML" },
  ];
  const Year = [
    { label: "1st" },
    { label: "2nd" },
    { label: "3rd" },
    { label: "4th" },
  ];
  const [Info, setInfo] = useState({
    name: "",
    bio: "",
    year: "",
    department: "",
  });
  const history = useNavigate();
  const onChange = (e) => {
    setInfo({ ...Info, [e.target.name]: e.target.value });
    console.log(Info);
  };
  const handleSubmit = async (e) => {
    try {
      console.log(Info);
      const response = await api.put("/api/users/update", Info);
      history("/ArticlesPage");
    } catch (error) {
      alert(error);
    }
  };
  return (
    <>
       <div className="Login-container">

      <div className="login">
        <h1>Login to MCOEGRAM</h1>
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <h1>Input Details</h1>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <div className="Input-box">
              <TextField
                id="outlined-basic"
                label="Name"
                variant="outlined"
                type="text"
                name="name"
                value={Info.name}
                onChange={onChange}
              />
              <TextField
                id="outlined-basic"
                label="Bio"
                variant="outlined"
                type="text"
                name="bio"
                value={Info.bio}
                onChange={onChange}
              />
              <Autocomplete
                options={Year}
                sx={{ width: 300 }}
                value={Year.find((y) => y.label === Info.year) || null}
                onChange={(event, value) =>
                  setInfo({ ...Info, year: value?.label || "" })
                }
                renderInput={(params) => <TextField {...params} label="Year" />}
              />
              <Autocomplete
                options={Department}
                sx={{ width: 300 }}
                value={
                  Department.find((d) => d.label === Info.department) || null
                }
                onChange={(event, value) =>
                  setInfo({ ...Info, department: value?.label || "" })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Department" />
                )}
              />
              <button
                className="btn btn-primary "
                onClick={() => {
                  console.log(Info);
                  Info.department && Info.name && Info.year && Info.bio
                    ? handleSubmit()
                    : alert("Please fill all the Details");
                }}
              >
                Submit
              </button>
          </div>
          </div>
          </div>
        </div>
      </div>
    </>
  );
}
