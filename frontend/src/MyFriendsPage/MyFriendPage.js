import React, { Component } from 'react';
import axios from 'axios';
import { Space, Table } from 'antd';
import { Link } from 'react-router-dom';

import './MyFriendPage.css';

// TODO: add SearchFriends feature
export default class MyFriendPage extends Component {
  state = { friends: [] };

  config = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  };

  columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => {
        const user_id = record.id;
        return <Link to={`/userprofile/${user_id}`}>{text}</Link>;
      },
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: (text) => <text>{text ?? 'Unknown'}</text>,
    },
    {
      title: 'Country',
      dataIndex: 'coutry',
      key: 'country',
      render: (text) => <text>{text ?? 'Unknown'}</text>,
    },
  ];

  componentDidMount() {
    this.fetchFriends();
  }

  fetchFriends() {
    axios
      .get('https://game.norgannon.cn:8848/api/user/friend/list', this.config)
      .then((response) => {
        this.setState({ friends: response.data.data });
      })
      .catch((error) => {
        console.error('Error fetching friends: ', error);
      });
  }

  // handleSearchChange = (value) => {
  //   console.log(value);
  // };

  render() {
    const { friends } = this.state;

    return (
      <div className="content-container">
        <h1>My Friends</h1>
        <Space
          className="myfriend-contaner"
          direction="vertical"
          size="large"
          style={{
            width: '90%',
            justifyContent: 'space-between',
          }}
        >
          <Table
            columns={this.columns}
            dataSource={friends}
            tableLayout="fixed"
            style={{
              width: '100%',
            }}
            locale={{
              emptyText: 'You have no friends, add others as your friends now~',
            }}
          />
        </Space>
      </div>
    );
  }
}
