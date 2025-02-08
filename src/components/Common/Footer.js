import React from "react";
import "../../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Medical App. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
