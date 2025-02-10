import React from "react";
import { Link } from "react-router-dom";
import { FiGrid, FiUser } from "react-icons/fi"; // Подключаем иконки из react-icons
import "../../styles/navbar.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">Medical App</Link>
            </div>
            <ul className="navbar-links">
                <li>
                    <Link to="/dashboard" className="navbar-icon">
                        <FiGrid />
                        <span className="navbar-tooltip">Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link to="/login" className="navbar-icon">
                        <FiUser />
                        <span className="navbar-tooltip">Login</span>
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
