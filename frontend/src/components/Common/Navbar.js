import React from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { RiLoginBoxFill } from "react-icons/ri";


const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">Medical App</Link>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to='/dashboard'>
                    <TbLayoutDashboardFilled title="Dashboard" size={32} color="white"/>
                    </Link>
                </li>
                <li>
                    <Link to='/login'>
                    <RiLoginBoxFill title="Login" size={32} color="white"/>
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
