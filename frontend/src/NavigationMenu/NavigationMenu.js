/* eslint-disable */
import React, { useState } from 'react';
import { PropTypes } from 'prop-types';
import { Menu, Col, Row, Dropdown, Button } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  QuestionCircleOutlined,
  DownOutlined,
} from '@ant-design/icons';

import './NavigationMenu.css';

//the navigation bar is a global component that would appear at the header of any pages
//navigation bar has two states, the login state(log or not) and user name

// TODO: Bug, when user are on about us page and refresh the page, the navigation menu 
// would go back to focus on home bar again.
export default function NavigationMenu({
  logInState,
  userName,
  setLogInState,
  setUserName,
  navigate,
}) {
  if (logInState) {
    return (
      <Row>
        <Col span={18}>
          <FixMenue navigate={navigate} />{' '}
        </Col>
        <Col span={6}>
          <LogedInMenue
            userName={userName}
            setLogInState={setLogInState}
            setUserName={setUserName}
            navigate={navigate}
          />{' '}
        </Col>
      </Row>
    );
  } else {
    return (
      <Row>
        <Col span={18}>
          <FixMenue navigate={navigate} />{' '}
        </Col>
        <Col span={6}>
          <LogInMenue navigate={navigate} />{' '}
        </Col>
      </Row>
    );
  }
}

// drop down menu to display when user have logged in
// user name -> My Profile, My Collection, Update Profile, View Friends, Change Password
function LogedInMenue({ userName, setLogInState, setUserName, navigate }) {
  const items = [
    {
      label: 'My Profile',
      key: 'profile',
      onClick: () => {
        const jwtParts = localStorage.getItem("token").split(".");
        const payload = JSON.parse(atob(jwtParts[1]));
        navigate('/userprofile/'+payload.id);
      },
    },
    {
      label: 'My Collection',
      key: 'collection',
      onClick: () => {
        navigate('/usercollectionpage');
      },
    },
    {
      label: 'View Friends',
      key: 'viewfrineds',
      onClick: () => {
        navigate('/myfriends');
      },
    },
    {
      label: 'Change Password',
      key: 'changepassword',
      onClick: () => {
        navigate('/changepassword');
      },
    },
    {
      label: 'Sign out',
      key: 'signout',
      onClick: () => {
        console.log('sign out button is clicked');
        setLogInState(false);
        setUserName('');
        localStorage.removeItem('username');
        localStorage.removeItem('user_id');
        localStorage.removeItem('token');
        navigate('/');
      },
    },
  ];

  const menuProps = {
    items: items,
  };

  return (
    <Dropdown
      menu={menuProps}
      arrow={{ pointAtCenter: true }}
      placement="bottom"
      className="LoggedInMenu"
    >
      <Button size="large" className="LoggedInButton" icon={<DownOutlined />}>
        {userName}
      </Button>
    </Dropdown>
  );
}

// Menu to displayed when user have not logeed in
// sign in, sign up
function LogInMenue({ navigate }) {
  const items = [
    {
      className: 'LogInMenuItem',
      label: 'Sign In',
      key: 'in',
      onClick: () => {
        navigate('/signin');
      },
    },
    {
      className: 'LogInMenuItem',
      label: 'Sign Up',
      key: 'up',
      onClick: () => {
        navigate('/signup');
      },
    },
  ];

  const [current, setCurrent] = useState('in');

  const onClick = (e) => {
    setCurrent(e.key);
  };

  return (
    <Menu
      selectedKeys={[current]}
      items={items}
      onClick={onClick}
      mode="horizontal"
      theme={'light'}
    />
  );
}

// The fixed navigation menu that won't change with the change of log in state
// use a state to track which page is in.
// Home, Player Search, Club Search, FAQs, About Us

function FixMenue({ navigate }) {
  const items = [
    // home menu
    {
      className: 'MenuItem',
      label: 'Home',
      key: 'home',
      icon: <HomeOutlined />,
      onClick: () => {
        navigate('/');
      },
    },
    // player search menu
    {
      className: 'MenuItem',
      label: 'Player Search',
      key: 'player',
      icon: <TeamOutlined />,
      onClick: () => {
        navigate('/playersearch');
      },
    },
    // club search meun
    {
      className: 'MenuItem',
      label: 'Club Search',
      key: 'club',
      icon: <EnvironmentOutlined />,
      onClick: () => {
        navigate('/clubsearch');
      },
    },
    // FAQs menu
    {
      className: 'MenuItem',
      label: 'FQAs',
      ley: 'fqas',
      icon: <QuestionCircleOutlined />,
      onClick: () => {
        navigate('/faqs');
      },
    },
    // ABout us menu
    {
      className: 'MenuItem',
      label: 'About Us',
      key: 'about',
      onClick: () => {
        navigate('/aboutus');
      },
    },
  ];

  const [current, setCurrent] = useState('home');

  const onClick = (e) => {
    setCurrent(e.key);
  };

  return (
    <Menu
      className="Menu"
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={items}
      theme={'light'}
    />
  );
}

FixMenue.propTypes = {
  navigate: PropTypes.func.isRequired,
};
