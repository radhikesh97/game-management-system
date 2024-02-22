// /* eslint-disable */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Card,
  Divider,
  Input,
  List,
  Select,
  Space,
  Typography,
} from 'antd';
import {
  LikeOutlined,
  LikeTwoTone,
  MessageOutlined,
  // MessageTwoTone,
} from '@ant-design/icons';

import './ForumPage.css';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const config = {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
};

export default function ForumPage({ gameID }) {
  return (
    <>
      <h2>Forum</h2>
      <ForumList gameID={gameID} />
    </>
  );
}

function ForumList({ gameID }) {
  const [forums, setForums] = useState([]);
  const [totalForum, setTotalForum] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchForums();
  }, [gameID, currentPage]);

  // callback function for Pagination onChange
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchForums = () => {
    const getForumsAPI = `https://game.norgannon.cn:8848/api/forum/list?game_id=${gameID}&page=${currentPage}&page_size=5&is_DESC=True&sort_by=like`;
    axios
      .get(getForumsAPI, config)
      .then((response) => {
        setForums(response.data.data);
        setTotalForum(5 * response.data.max_page);
      })
      .catch((error) => {
        console.error('Error fetching reviews: ', error.response ?? error);
      });
  };

  // empty reviews tips
  const emptyReviewsMessage = (
    <div>
      <p>No posts yet, please fill in your one!</p>
    </div>
  );

  const pagination = {
    current: currentPage,
    pageSize: 5,
    defaultPageSize: 5,
    total: totalForum,
    showSizeChanger: false,
    onChange: handlePageChange,
    align: 'start',
    style: { marginBottom: 30 },
  };

  return (
    <div>
      {forums.length === 0 ? (
        emptyReviewsMessage
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={forums}
          renderItem={(item) => <PostBox postData={item} />}
          pagination={pagination}
        />
      )}
      <Divider />
      <PostForm gameID={gameID} onUpdate={fetchForums} />
    </div>
  );
}

function PostBox({ postData }) {
  const [hasLiked, setHasLiked] = useState(postData.my_like);

  useEffect(() => {
    setHasLiked(postData.my_like);
  }, [postData]);

  const likeForum = () => {
    const likeForumAPI = 'https://game.norgannon.cn:8848/api/forum/like';
    axios
      .post(
        likeForumAPI,
        {
          forum_id: postData.id,
        },
        config
      )
      .then(() => {
        setHasLiked(true);
      })
      .catch((error) => {
        console.error('Error liking post: ', error.response ?? error);
      });
  };

  const dislikeForum = () => {
    const dislikeAPI = `https://game.norgannon.cn:8848/api/forum/like?forum_id=${postData.id}`;
    axios
      .delete(dislikeAPI, config)
      .then(() => {
        setHasLiked(false);
      })
      .catch((error) => {
        console.error('Error unliking post: ', error.response ?? error);
      });
  };

  return (
    <Card className="forum-box" title={postData.title}>
      <div>
        <p className="forum-content">{postData.text}</p>
        <div className="forum-username">{postData.username}</div>
      </div>
      <Space>
        {hasLiked ? (
          <Button icon={<LikeTwoTone />} onClick={dislikeForum} />
        ) : (
          <Button icon={<LikeOutlined />} onClick={likeForum} />
        )}
        <Button icon={<MessageOutlined />} disabled={true} />
      </Space>
    </Card>
  );
}

const PostForm = ({ gameID, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState(0);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleTextChange = (e) => {
    setDescription(e.target.value);
  };

  const onVisSelect = (value) => {
    setVisibility(value);
  };

  const submitPost = () => {
    const api = 'https://game.norgannon.cn:8848/api/forum/';
    axios
      .post(
        api,
        {
          game_id: gameID,
          title: title,
          text: description,
          visibility: visibility,
        },
        config
      )
      .then(() => {
        onUpdate();
      })
      .catch((error) => {
        console.error('Error submitting review: ', error.response ?? error);
      });
  };

  return (
    <Card
      title={
        <Space>
          <Text strong style={{ fontSize: 21, marginLeft: 20 }}>
            Title
          </Text>
          <Input onChange={handleTitleChange} style={{ width: 420 }} />
        </Space>
      }
      style={{
        width: '80%',
      }}
    >
      <TextArea
        placeholder="Write your post here"
        value={description}
        onChange={handleTextChange}
        rows={5}
      />
      <br />
      <Select
        value={visibility}
        onChange={onVisSelect}
        style={{ width: 200, marginTop: 10, marginRight: 10 }}
      >
        <Option value={0}>Public</Option>
        <Option value={2}>Friends</Option>
        <Option value={3}>Community</Option>
      </Select>
      <Button type="primary" onClick={submitPost}>
        Submit
      </Button>
    </Card>
  );
};
