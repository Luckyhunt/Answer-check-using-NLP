import { Link, useLocation } from "react-router"

import "./Navbar.css"
import Logo from "../../images/logo.svg"

const Navbar = () => {

    const location = useLocation()

    return (
        <div className="Navbar">
            <div className="Navbar__logo">
                <img src={Logo} alt="Logo image" />
                <span>AnswerCheck</span>
            </div>
            <div className="Navbar__links">
                <Link className={location.pathname === '/' ? "active": ""} to={"/"}>Upload</Link>
                <Link className={location.pathname === '/summary' ? "active" : ""} to={"/summary"}>Extract Text</Link>
                {/* <Link to={"#"}>Results</Link> */}
            </div>
        </div>
    )
}

export default Navbar