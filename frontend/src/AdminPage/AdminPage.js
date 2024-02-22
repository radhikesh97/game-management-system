import React, { Component } from 'react';
import axios from 'axios';
import { Button, Input, Space, Table } from 'antd';

import './AdminPage.css';

const { Search } = Input;

export default class AdminPage extends Component {
  state = {
    isAdmin: false,
    users: [],
    totalUser: 0,
    currentPage: 1,
    searchTerm: '',
  };

  config = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  };

  columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <text>{text}</text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <text>{text}</text>,
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: (text) => <text>{text ?? 'Unknown'}</text>,
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      render: (text) => <text>{text ?? 'Unknown'}</text>,
    },
    {
      title: 'Join date',
      dataIndex: 'date_join',
      key: 'date_join',
      render: (text) => {
        const parsedDate = new Date(text);
        const formattedDate = `${parsedDate.getFullYear()}-${String(
          parsedDate.getMonth() + 1
        ).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}`;
        return <text>{formattedDate}</text>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          {record.is_active ? (
            <Button type="primary" onClick={this.banUser(record.id)}>
              Ban
            </Button>
          ) : (
            <Button type="primary" onClick={this.restoreUser(record.id)}>
              Restore
            </Button>
          )}
        </Space>
      ),
    },
  ];

  componentDidMount() {
    const user_id = localStorage.getItem('user_id');
    axios
      .get(
        `https://game.norgannon.cn:8848/api/user/profile?user_id=${user_id}`,
        this.config
      )
      .then((response) => {
        const { is_admin } = response.data.data;
        this.setState({ isAdmin: is_admin });
        if (is_admin) this.fetchUsers(1);
      })
      .catch((error) => {
        console.error('Error fetching users: ', error);
      });
  }

  // Fetch users data based on username, and store it in this.state
  fetchUsers(currentPage) {
    const { searchTerm } = this.state;
    axios
      .get(
        `https://game.norgannon.cn:8848/api/user/list?keyword=${searchTerm}&page=${currentPage}&page_size=20&is_DESC=false&sort_by=username`,
        this.config
      )
      .then((response) => {
        this.setState({ users: response.data.data });
      })
      .catch((error) => {
        console.error('Error fetching users: ', error);
      });
  }

  /* ----------- callback functions --------------*/
  handleSearchTermChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  handleSearchButtonClick = () => {
    this.fetchUsers();
  };

  handlePageChange = (currentPage) => {
    this.setState({ currentPage });
    this.fetchUsers(currentPage);
  };

  banUser = (userid) => {
    return () => {
      axios
        .post(
          `https://game.norgannon.cn:8848/api/user/ban?user_id=${userid}`,
          null,
          this.config
        )
        .then(() => {
          this.fetchUsers();
        })
        .catch((error) => {
          console.error('Error banning users: ', error);
        });
    };
  };

  restoreUser = (userid) => {
    return () => {
      axios
        .delete(
          `https://game.norgannon.cn:8848/api/user/ban?user_id=${userid}`,
          this.config
        )
        .then(() => {
          this.fetchUsers();
        })
        .catch((error) => {
          console.error('Error restoring users: ', error);
        });
    };
  };

  render() {
    const { isAdmin } = this.state;
    if (!isAdmin) {
      return <h1>Only Admin can use this page!</h1>;
    }

    const { users, currentPage, totalUser } = this.state;

    const pagination = {
      current: currentPage,
      pageSize: 20,
      defaultPageSize: 20,
      total: totalUser,
      showSizeChanger: false,
      onChange: this.handlePageChange,
    };

    return (
      <div className="content-container">
        <h1>Admin Page</h1>
        <Space
          direction="vertical"
          style={{
            width: '90%',
            marginBottom: 3,
          }}
        >
          <Search
            className="search-row"
            placeholder="Input Username"
            style={{ width: 300, marginBottom: 10 }}
            enterButton
            onSearch={this.handleSearchButtonClick}
            onChange={this.handleSearchTermChange}
          />
          <Table
            className="user-table"
            tableLayout="fixed"
            columns={this.columns}
            dataSource={users}
            pagination={pagination}
          />
        </Space>
      </div>
    );
  }
}
