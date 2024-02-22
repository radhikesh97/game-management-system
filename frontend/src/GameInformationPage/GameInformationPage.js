import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  Button,
  Input,
  List,
  Menu,
  Pagination,
  Rate,
  Space,
  Select,
  Typography,
  Divider,
} from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';

import ForumPage from './ForumPage';
import GameDetailPage from './GameDetailPage';
import ShopPage from './ShopPage';

import './GameInformationPage.css';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const config = {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
};

export default function GameInformationPage() {
  const { id } = useParams();

  const [name, setName] = useState('Loading game info ...');
  const [year, setYear] = useState(null);
  const [rate, setRate] = useState(8.0);
  const [myRate, setMyRate] = useState(0);
  const [shopLink, setShopLink] = useState('');
  const [isInCollection, setInCollection] = useState(false);
  const [collectionID, setCollectionID] = useState(-1);
  const [description, setDescription] = useState('');

  const tabItems = [
    {
      label: 'General',
      key: 'general',
    },
    {
      label: 'Details',
      key: 'details',
    },
    {
      label: 'Forum',
      key: 'forum',
    },
    {
      label: 'Shop',
      key: 'shop',
    },
  ];
  const [selectedTab, setSelectedTab] = useState('general');

  useEffect(() => {
    const getGameInfoAPI = `https://game.norgannon.cn:8848/api/game/?game_id=${id}`;
    axios
      .get(getGameInfoAPI, config)
      .then((response) => {
        const { data } = response.data;
        setName(data.name);
        setYear(data.published_year);
        setRate(data.rate);
        setInCollection(data.has_collection ?? false);
        setCollectionID(data.collection_id);
        setDescription(data.description);
        setShopLink(data.link);
      })
      .catch((error) => {
        console.error('Error fetching game info: ', error.response ?? error);
      });

    const getMyRateAPI = `https://game.norgannon.cn:8848/api/game/rate?game_id=${id}`;
    axios
      .get(getMyRateAPI, config)
      .then((response) => {
        setMyRate(response.data.data ? response.data.data.rate : 0.0);
      })
      .catch((error) => {
        console.error('Error fetching my rate: ', error.response ?? error);
      });
  }, [id, isInCollection]);

  /* callback functions */
  const changeMyRate = (value) => {
    const rate = value * 2;
    const api = `https://game.norgannon.cn:8848/api/game/rate?game_id=${id}`;
    axios
      .patch(
        api,
        {
          rate: rate,
        },
        config
      )
      .then(() => {
        setMyRate(rate);
      })
      .catch((error) => {
        console.error(
          'Error fetching change my rate: ',
          error.response ?? error
        );
      });
  };

  const addCollection = () => {
    const api = `https://game.norgannon.cn:8848/api/collection/`;
    axios
      .post(
        api,
        {
          game_id: id,
        },
        config
      )
      .then(() => {
        setInCollection(true);
      })
      .catch((error) => {
        console.error('Error adding collection: ', error.response ?? error);
      });
  };

  const removeCollection = () => {
    const api = `https://game.norgannon.cn:8848/api/collection/?collection_id=${collectionID}`;
    axios
      .delete(api, config)
      .then(() => {
        setInCollection(false);
      })
      .catch((error) => {
        console.error('Error removing collection: ', error.response ?? error);
      });
  };

  const selectTab = (e) => {
    setSelectedTab(e.key);
  };

  const switchTab = (selectedTab) => {
    const generalTab = (
      <>
        <h2>Description</h2>
        <text>{description}</text>
        <h2>Reviews</h2>
        <ReviewList className="review-list" gameID={id} />
      </>
    );
    switch (selectedTab) {
      case 'general':
        return generalTab;
      case 'forum':
        return <ForumPage gameID={id} />;
      case 'details':
        return <GameDetailPage gameID={id} />;
      case 'shop':
        return <ShopPage shopLink={shopLink} />;
      default:
        return generalTab;
    }
  };

  return (
    <div className="content-container">
      <h1>{`${name}${year === null || year == 0 ? '' : ` (${year})`}`}</h1>
      <Space className="gameinfo-container" direction="vertical">
        <Space className="rate-container" size="large">
          <text>{`Rating: ${rate}`}</text>
          <Space>
            <span> Your Rating: </span>
            <Rate value={myRate / 2} allowHalf onChange={changeMyRate} />
          </Space>
          {isInCollection ? (
            <Button
              type="primary"
              icon={<MinusOutlined />}
              onClick={removeCollection}
            >
              Remove from Collection
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addCollection}
            >
              Add to Collection
            </Button>
          )}
        </Space>
        <Menu
          selectedKeys={[selectedTab]}
          mode="horizontal"
          items={tabItems}
          onClick={selectTab}
        />
        {switchTab(selectedTab)}
      </Space>
    </div>
  );
}

/*
ReviewList funcion component
*/
const ReviewList = ({ gameID }) => {
  const [reviews, setReviews] = useState([]);
  const [myReviewData, setMyReviewData] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    const getReviewsAPI = `https://game.norgannon.cn:8848/api/game/review/list?game_id=${gameID}&page=1&page_size=20&is_DESC=True&sort_by=time`;
    axios
      .get(getReviewsAPI, config)
      .then((response) => {
        setReviews(response.data.data);
      })
      .catch((error) => {
        console.error('Error fetching reviews: ', error.response ?? error);
      });

    const getMyReviewAPI = `https://game.norgannon.cn:8848/api/game/review/my?game_id=${gameID}`;
    axios
      .get(getMyReviewAPI, config)
      .then((response) => {
        setMyReviewData(response.data.data);
      })
      .catch((error) => {
        console.error('Error fetching my review: ', error.response ?? error);
      });
  }, [gameID]);

  // callback function for Pagination onChange
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const onMyReviewUpdate = () => {
    const getReviewsAPI = `https://game.norgannon.cn:8848/api/game/review/list?game_id=${gameID}&page=1&page_size=20&is_DESC=True&sort_by=time`;
    axios
      .get(getReviewsAPI, config)
      .then((response) => {
        setReviews(response.data.data);
      })
      .catch((error) => {
        console.error('Error fetching reviews: ', error.response ?? error);
      });
  };

  // empty reviews tips
  const emptyReviewsMessage = (
    <div>
      <p>No comments yet, please fill in your comments!</p>
    </div>
  );

  return (
    <div>
      {reviews.length === 0 ? (
        emptyReviewsMessage
      ) : (
        <>
          <List
            itemLayout="horizontal"
            dataSource={reviews.slice(
              (currentPage - 1) * pageSize,
              currentPage * pageSize
            )}
            renderItem={(item) => (
              <Card className="review-box">
                <p className="review-content">{item.comment}</p>
                <div className="username">{item.username}</div>
              </Card>
            )}
          />
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={reviews.length}
            onChange={handlePageChange}
            hideOnSinglePage={true}
          />
        </>
      )}
      <Divider />
      <MyReview
        gameID={gameID}
        myReviewData={myReviewData}
        onUpdate={onMyReviewUpdate}
      />
    </div>
  );
};

const MyReview = ({ gameID, myReviewData, onUpdate }) => {
  const [review, setReview] = useState('');
  useEffect(() => {
    setReview(
      myReviewData === null || myReviewData.comment === undefined
        ? ''
        : myReviewData.comment
    );
  }, [myReviewData]);

  const [reviewID, setReviewID] = useState(-1);
  useEffect(() => {
    setReviewID(
      myReviewData === null || myReviewData.id === undefined
        ? -1
        : myReviewData.id
    );
  }, [myReviewData]);

  const [hasReview, setHasReview] = useState(review.length > 0);
  useEffect(() => {
    const comment =
      myReviewData === null || myReviewData.comment === undefined
        ? ''
        : myReviewData.comment;
    setHasReview(comment.length > 0);
  }, [myReviewData]);

  const [visibility, setVisibility] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleReviewChange = (e) => {
    setReview(e.target.value);
  };

  const onVisSelect = (value) => {
    setVisibility(value);
  };

  const submitReview = () => {
    if (isUpdating) {
      const api = `https://game.norgannon.cn:8848/api/game/review/?review_id=${reviewID}`;
      axios
        .patch(
          api,
          {
            comment: review,
            visibility: visibility,
          },
          config
        )
        .then(() => {
          setIsUpdating(false);
          onUpdate();
        })
        .catch((error) => {
          console.error(
            'Error fetching change my rate: ',
            error.response ?? error
          );
        });
    } else {
      const api = 'https://game.norgannon.cn:8848/api/game/review/';
      axios
        .post(
          api,
          {
            game_id: gameID,
            comment: review,
            visibility: visibility,
          },
          config
        )
        .then(() => {
          setHasReview(true);
          onUpdate();
        })
        .catch((error) => {
          console.error('Error submitting review: ', error.response ?? error);
        });
    }
  };

  const updateReview = () => {
    setIsUpdating(true);
  };

  function getVisString(visibility) {
    switch (visibility) {
      case 0:
        return 'Public';
      case 2:
        return 'Friends';
      case 3:
        return 'Private';
      default:
        return 'Public';
    }
  }

  return (
    <div>
      {!hasReview || isUpdating ? (
        <>
          <TextArea
            placeholder="Write your review here"
            value={review}
            onChange={handleReviewChange}
            rows={4}
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
          <Button type="primary" onClick={submitReview}>
            Submit
          </Button>
        </>
      ) : (
        <Card
          className="review-box"
          title="Your Review"
          extra={<Text>Visibility: {getVisString(visibility)}</Text>}
        >
          <p className="review-content">{review}</p>
          <Button
            className="update-button"
            type="primary"
            onClick={updateReview}
            style={{ marginTop: 10 }}
          >
            Update
          </Button>
        </Card>
      )}
    </div>
  );
};
