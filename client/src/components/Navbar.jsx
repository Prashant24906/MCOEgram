import { NavLink, useNavigate } from "react-router-dom";
import socket from "../sockets";
import "../main.css";
function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.clear();
    socket.disconnect();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg border-bottom border-body" data-bs-theme="dark">
      <div className="container-fluid ">
        <NavLink className="navbar-brand"to={localStorage.getItem('token')?"/feed":"/login"}>
          MCOEGRAM
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to={localStorage.getItem('token')?"/Articles":"/login"}>
                <i className="fa-solid fa-blog"></i> Articles
              </NavLink>
            </li>
            
            <li className="nav-item">
              <NavLink className="nav-link" to={localStorage.getItem('token')?"/feed":"/login"}>
                <i className="fa-solid fa-house"></i> Posts
              </NavLink>
            </li>
            

            <li className="nav-item">
              <NavLink className="nav-link" to={localStorage.getItem('token')?"/chats":"/login"}>
                <i className="fa-solid fa-paper-plane"></i> Chat
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to={localStorage.getItem('token')?"/me":"/login"}>
                <i className="fa-solid fa-user"></i> Profile
              </NavLink>
            </li>
          </ul>

          {!token ? (
            <NavLink className="btn btn-primary" to="/login">
              Login
            </NavLink>
          ) : (
            <button className="btn btn-primary" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;