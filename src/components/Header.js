import "../styles/Header.css";
import ltelogo from "../assets/img/ltelogo.png";
import logoutIcon from "../assets/icon/logout.png";
import { NavLink } from "react-router-dom";
import api from "../Api";
import config from "../Config";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


function Header() {
    const navigate = useNavigate();
    const [loggingOut, setLoggingOut] = useState(false);
    
    let userName = "";

    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        userName = user.username || "";
    } catch (error) {
        console.error("사용자 정보 읽기 실패:", error);
    }

    const handleLogout = async () => {
        if(loggingOut) return;
        setLoggingOut(true);

        try {
            const { data } = await api.post(
                config.AUTH.LOGOUT,
                {}
            );

            if (data?.isSuccess === false) {
                throw new Error ("로그아웃에 실패했습니다.");
            }
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            window.dispatchEvent(new Event("auth:changed"));
            navigate("/login", { replace: true });
        } catch {
            alert("로그아웃에 실패했습니다.");
        } finally {
            setLoggingOut(false);
        }
    }

    return(
        <header className="header">
            {/* 로고 */}
            <div className = "header-left">
                <img src={ltelogo} alt="LTE 로고" className="header-logo"/>
                <span className="header-title">Lion To-do Everyday</span>
            </div>

            {/* 메뉴 */}
            <nav className="header-nav">
                <NavLink to = "/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    홈 
                </NavLink>

                <NavLink to = "/friends" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    친구
                </NavLink>

                <NavLink to = "/mypage" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    마이페이지
                </NavLink>
            </nav>

            {/*사용자 정보*/}
            <div className = "header-right">
                <span className="user-name">
                    {userName ? `${userName}님` : ""}
                </span>
                <img src = {logoutIcon} alt="로그아웃" className="logout-icon" onClick= {handleLogout}/>
            </div>
        </header>
    );
}

export default Header;