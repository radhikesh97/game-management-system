/* eslint-disable */
import React, { Component } from 'react';
import { Input, Select, Space, Table } from 'antd';
import axios from 'axios';

import './HomePage.css';
import { Link } from 'react-router-dom';

const { Search } = Input;

export default class HomePage extends Component {
  state = {
    games: [],
    totalGame: 0,
    searchTerm: '',
    gameType: 'all',
    currentPage: 1,
  };

  componentDidMount() {
    this.fetchGames();
  }

  getAPI(searchTerm, currentPage, gameType) {
    console.log(
      `Searching for games: keyword ${searchTerm}, page ${currentPage}, game type ${gameType}`
    );
    return `https://game.norgannon.cn:8848/api/game/list?page=${currentPage}&page_size=20&is_DESC=True&sort_by=rate&keyword=${searchTerm}&type=${gameType}`;
  }

  fetchGames({ searchTerm, currentPage, gameType } = {}) {
    const { state } = this;
    searchTerm = searchTerm ?? state.searchTerm;
    currentPage = currentPage ?? state.currentPage;
    gameType = gameType ?? state.gameType;
    const api = this.getAPI(searchTerm, currentPage, gameType);
    axios
      .get(api)
      .then((response) => {
        const data = response.data;
        this.setState({
          searchTerm,
          gameType,
          games: data.data,
          totalGame: data.max_page * 20,
          currentPage,
        });
      })
      .catch((error) => {
        console.error('Error fetching users: ', error.response.message);
      });
  }

  handleSearchInputChange = (e) => {
    this.setState({ searchTerm: e.target.value });
  };

  handleSearch = (searchTerm) => {
    this.fetchGames({ searchTerm });
  };

  setGameType = (gameType) => {
    this.fetchGames({ gameType });
  };

  handlePageChange = (currentPage) => {
    this.fetchGames({ currentPage });
  };

  render() {
    const { games, currentPage, totalGame } = this.state;

    const columns = [
      {
        title: 'No.',
        key: 'id',
        width: 120,
        render: (text, record, index) => {
          return (currentPage - 1) * 20 + index + 1;
        },
      },
      {
        title: 'Game',
        dataIndex: 'name',
        key: 'name',
        // TODO: click the name link to view the game information
        render: (text, record) => {
          const gameID = record.id;
          const year = record.published_year;
          return (
            <Link to={`/gameinfo/${gameID}`}>
              {`${text}${year === null || year == 0 ? '' : ` (${year})`}`}
            </Link>
          );
        },
      },
      {
        title: 'Game Type',
        dataIndex: 'type',
        key: 'type',
        width: 360,
        render: (text) => {
          let gameType = '';
          switch (text) {
            case 'Board/Card Game':
              gameType = 'Board/Card';
              break;
            case 'RPG Game':
              gameType = 'RPG';
              break;
            default:
              gameType = 'Board/Card';
          }
          return <text>{gameType}</text>;
        },
      },
      {
        title: 'Rating',
        dataIndex: 'rate',
        key: 'rate',
        width: 180,
        render: (value) => <text>{value}</text>,
      },
    ];

    const pagination = {
      current: currentPage,
      pageSize: 20,
      defaultPageSize: 20,
      total: totalGame,
      showSizeChanger: false,
      onChange: this.handlePageChange,
    };

    // TODO: When user login, show user-based recommendation
    return (
      <div className="content-container">
        <h1>Home</h1>
        <Space className="home-container" direction="vertical" size="large">
          <Space className="search-row" size="middle">
            <Search
              className="search"
              onSearch={this.handleSearch}
              onChange={this.handleSearchInputChange}
              allowClear
              enterButton
            />
            <text>Game Type</text>
            <Select
              className="select"
              defaultValue={'all'}
              options={[
                {
                  value: 'all',
                  label: 'All',
                },
                {
                  value: 'Board/Card Game',
                  label: 'Board/Card',
                },
                {
                  value: 'RPG Game',
                  label: 'RPG',
                },
              ]}
              onChange={this.setGameType}
            />
          </Space>
          <Table
            columns={columns}
            dataSource={games}
            tableLayout="fixed"
            pagination={pagination}
            locale={{ emptyText: 'Loading data ...' }}
          />
        </Space>
      </div>
    );
  }
}
/* eslint-disable */
