/* eslint-disable */
import './App.css';

import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import HomePage from './HomePage/HomePage.js';
import SignInPage from './SignInPage/SignInPage';
import SignUpPage from './SignUpPage/SignUpPage.js';
import NavigationMenu from './NavigationMenu/NavigationMenu';
import ForgotPasswordPage from "./ForgotPasswordPage/ForgotPasswordPage.js";
import NotFoundPage from './NotFoundPage/NotFoundPage';
import ChangePasswordPage from './ChangePasswordPage/ChangePasswordPage';
import UserProfilePage from './UserProfilePage/UserProfilePage';
import AdminPage from './AdminPage/AdminPage';
import MyFriendPage from './MyFriendsPage/MyFriendPage';
import PlayerSearchPage from './PlayerSearchPage/PlayerSearchPage';
import ClubSearchPage from './ClubSearchPage/ClubSearchPage';
import FaqsPage from './FaqsPage/FaqsPage';
import AboutUsPage from './AboutUsPage/AboutUsPage';
import UserCollectionPage, {CollectionCard,PaginationCollections} from './UserCollectionPage/UserCollectionPage';
import GameInformationPage from './GameInformationPage/GameInformationPage';
import MyCollectionPage from './MyCollectionPage/MyCollectionPage';





// the root of the whole web application
//keeps state of: log in state; user name;

function App() {

  var localUserName = localStorage.getItem("username");
  const localToken = localStorage.getItem("token");
  var logState = false;

  if (localUserName == null && localToken == null) {
    localUserName = "";
    logState = false;
  }
  else {
    logState = true;
  }
  //keep track of log in state
  const [logInState, setLogInState] = useState(logState);
  const [userName, setUserName] = useState(localUserName);
  //navigate method
  const navigate = useNavigate();

  return (
    <div className='app-container'>
      <NavigationMenu logInState={logInState} userName={userName} setLogInState={setLogInState} setUserName={setUserName} navigate={navigate} />
      <Routes>
        <Route path='/' element={<HomePage setLogInState={setLogInState} setUserName={setUserName} navigate={navigate} />} />
        <Route path='/signin' element={<SignInPage logInState={logInState} setLogInState={setLogInState} setUserName={setUserName} navigate={navigate} />} />
        <Route path='/signup' element={<SignUpPage logInState={logInState} setLogInState={setLogInState} setUserName={setUserName} navigate={navigate} />} />
        <Route path='/forgetpassword' element={<ForgotPasswordPage logInState={logInState} navigate={navigate} setUserName={setUserName} setLogInState={setLogInState} />} />
        <Route path='/changepassword' element={<ChangePasswordPage logInState={logInState} setLogInState={setLogInState} setUserName={setUserName} navigate={navigate} />} />
        <Route path='/userprofile/:id' element={<UserProfilePage logInState={logInState} naviagte={navigate} />} />
        <Route path='/gameinfo/:id' element={<GameInformationPage hasLoggedIn={logInState} />} />
        <Route path='/adminpage' element={<AdminPage />} />
        <Route path='/myfriends' element={<MyFriendPage />} />
        <Route path='/playersearch' element={<PlayerSearchPage/>} />
        <Route path='/clubsearch' element={<ClubSearchPage/>} />
        <Route path='/faqs' element={<FaqsPage/>} />
        <Route path='/aboutus' element={<AboutUsPage/>} />
        <Route path='/usercollectionpage' element={<UserCollectionPage navigate={navigate} logInState={logInState}/>}/>
        <Route path='/mycollection/:id' element={<MyCollectionPage logInState={logInState} navigate={navigate}/>} />
        <Route path="*" element={<NotFoundPage promotion={null} />} />
      </Routes>
    </div>
  );



}

export default App;
/* eslint-disable */