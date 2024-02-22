import React, { Component } from 'react';
import { Input, Select, Space, Table } from 'antd';
import axios from 'axios';

const { Search } = Input;

export default class ClubSearchPage extends Component {
  state = {
    clubs: [],
    searchBy: '',
    searchTerm: 'clubname',
  };

  config = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  };

  columns = [
    {
      title: 'Clubname',
      dataIndex: 'clubname',
      key: 'clubname',
      // TODO: click the name link to view the profile
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: (text) => <text>{text}</text>,
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      render: (text) => <text>{text}</text>,
    },
  ];

  componentDidMount() {
    this.fetchClubs('');
  }

  getSearchAPI(searchTerm) {
    const { searchBy } = this.state;
    return `https://game.norgannon.cn:8848/api/user/search?keyword=${searchTerm}&search_by=${searchBy}`;
  }

  fetchClubs(searchTerm) {
    const searchAPI = this.getSearchAPI(searchTerm);
    axios
      .get(searchAPI, this.config)
      .then((response) => {
        this.setState({ clubs: response.data.data });
      })
      .catch((error) => {
        console.error('Error fetching clubs: ', error);
      });
  }

  handleSearchBy = (value) => {
    this.setState({ searchBy: value });
  };

  handleSearch = (value) => {
    console.log(`Searching clubs of: ${value}`);
  };

  render() {
    const { clubs } = this.state;
    return (
      <div className="content-container">
        <h1>Search Clubs</h1>
        <Space
          direction="vertical"
          size="middle"
          style={{
            width: '90%',
            justifyContent: 'space-between',
          }}
        >
          <Space className="search-row" size="middle">
            Search By
            <Select
              defaultValue="clubname"
              style={{ width: 120 }}
              onChange={this.handleSearchBy}
              options={[
                {
                  value: 'clubname',
                  label: 'Clubname',
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
            className="clubsearch-table"
            columns={this.columns}
            dataSource={clubs}
            locale={{ emptyText: 'No clubs' }}
          />
        </Space>
      </div>
    );
  }
}
