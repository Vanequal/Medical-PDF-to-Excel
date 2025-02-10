import React from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.css";
import user from '../../assets/user.png';
import dashboard from '../../assets/cpu.png';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">Medical App</Link>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to='/dashboard'>
                        <img className="icon-white" src={dashboard} alt="Dashboard" />
                    </Link>
                </li>
                <li>
                    <Link to='/login'>
                        <img className="icon-white" src={user} alt="User" />
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
