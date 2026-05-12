import React from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/Mainpage/MainPage';
//import LoginPage from './pages/LoginPage/LoginPage';
import MyPage from './pages/MyPage/MyPage';
import FriendPage from './pages/FriendPage/FriendPage';
import FriendDetailPage from './pages/FriendPage/FriendDetailPage';
import { Routes, Route, useLocation } from 'react-router-dom';

function App() {
  // 현재 브라우저 주소 정보를 가져온다.
  // 이 값을 기준으로 현재 사용자가 어떤 페이지에 있는지 판단할 수 있다.
  const location = useLocation();

  // 현재 경로가 /login이면 로그인 페이지로 판단한다.
  // 이 값은 Header와 Footer를 보여줄지 말지 결정하는 조건으로 사용된다.
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="layout">
      {/* 로그인 페이지가 아닐 때만 Header를 보여준다.
          따라서 메인 페이지, 마이페이지, 친구 페이지, 친구 상세 페이지에서는 Header가 표시된다. */}
      {!isLoginPage && <Header />}

      <div className="content">
        <Routes>
          {/* 현재 주소가 "/"이면 MainPage 컴포넌트를 화면에 보여준다. */}
          <Route path="/" element={<MainPage />} />

          {/* 현재 주소가 "/login"이면 LoginPage 컴포넌트를 화면에 보여준다. 
          <Route path="/login" element={<LoginPage />} />*/}

          {/* 현재 주소가 "/mypage"이면 MyPage 컴포넌트를 화면에 보여준다. */}
          <Route path="/mypage" element={<MyPage />} />

          {/* 현재 주소가 "/friends"이면 친구 목록과 친구 검색 기능이 있는 FriendPage를 보여준다. */}
          <Route path="/friends" element={<FriendPage />} />

          {/* "/friends/:id"는 친구별 상세 페이지 경로이다.
              :id 자리에는 선택한 친구의 id 값이 들어갈 수 있으며,
              해당 경로로 이동하면 FriendDetailPage가 화면에 표시된다. */}
          <Route path="/friends/:id" element={<FriendDetailPage />} />
        </Routes>
      </div>

      {/* 현재 코드에서는 로그인 페이지일 때만 Footer를 보여준다.
          isLoginPage가 true일 때 Footer가 렌더링된다. */}
      {isLoginPage && <Footer />}
    </div>
  );
}

export default App;