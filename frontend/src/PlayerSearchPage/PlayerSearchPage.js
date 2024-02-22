import React, { Component } from 'react';
import { Input, Select, Space, Table } from 'antd';
import axios from 'axios';

import './PlayerSearchPage.css';
import { Link } from 'react-router-dom';

const { Search } = Input;

// TODO: click username to navigate to user profile
export default class PlayerSearchPage extends Component {
  state = {
    players: [],
    searchBy: 'username',
    searchTerm: '',
    currentPage: 1,
  };

  config = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  };

  columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      // TODO: click the name link to view the profile
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
      dataIndex: 'country',
      key: 'country',
      render: (text) => <text>{text ?? 'Unknown'}</text>,
    },
  ];

  componentDidMount() {
    this.fetchPlayers('');
  }

  getSearchAPI(searchTerm) {
    const { searchBy } = this.state;
    return `https://game.norgannon.cn:8848/api/user/search?keyword=${searchTerm}&search_by=${searchBy}`;
  }

  fetchPlayers(searchTerm) {
    const searchAPI = this.getSearchAPI(searchTerm);
    axios
      .get(searchAPI, this.config)
      .then((response) => {
        this.setState({ players: response.data.data });
      })
      .catch((error) => {
        console.error('Error fetching users: ', error);
      });
  }

  handleSearchBy = (value) => {
    this.setState({ searchBy: value });
  };

  handleSearch = (value) => {
    this.fetchPlayers(value);
  };

  handlePageChange = (currentPage) => {
    this.setState({ currentPage });
  };

  render() {
    const { players, currentPage } = this.state;

    const pagination = {
      current: currentPage,
      pageSize: 20,
      defaultPageSize: 20,
      showSizeChanger: false,
      onChange: this.handlePageChange,
    };

    return (
      <div className="content-container">
        <h1>Search Players</h1>
        <Space
          className="playersearch-content"
          direction="vertical"
          size="middle"
        >
          <Space className="search-row" size="middle">
            Search By
            <Select
              defaultValue="username"
              style={{ width: 120 }}
              onChange={this.handleSearchBy}
              options={[
                {
                  value: 'username',
                  label: 'Username',
                },
                {
                  value: 'city',
                  label: 'City',
                },
                {
                  value: 'country',
                  label: 'Country',
                },
              ]}
            />
            <Search onSearch={this.handleSearch} allowClear enterButton />
          </Space>
          <Table
            columns={this.columns}
            dataSource={players}
            tableLayout="fixed"
            pagination={pagination}
          />
        </Space>
      </div>
    );
  }
}
