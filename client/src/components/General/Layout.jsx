import React from "react";
import Navigationbar from "../Navbars/Navigationbar"
import Footer from "../Footer/Footer"
const Layout = ({ children }) => {
  return (
    <div className="container">
      <Navigationbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
