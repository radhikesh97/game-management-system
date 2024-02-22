/* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Space,
  Typography,
  Upload,
  Skeleton,
  Button,
  message,
  Col,
  Row,
  Select,
  Image,
  Divider,
  Descriptions,
} from 'antd';
import axios from 'axios';
import './UserProfilePage.css';
import { useParams } from 'react-router-dom';
const { Title, Paragraph, Text, Link } = Typography;

export default function UserProfilePage({ logInState, naviagte }) {
  const [userID, setUserID] = useState(useParams().id);
  let temp;

  if (!logInState) {
    temp = false;
  } else {
    if (userID == localStorage.getItem('user_id')) {
      temp = true;
    } else {
      temp = false;
    }
  }

  const [isViewSelf, setIsViewSelf] = useState(temp);
  return (
    <LoggedUserProfilePage
      userID={userID}
      logInState={logInState}
      isViewSelf={isViewSelf}
    />
  );
}

function LoggedUserProfilePage({ userID, logInState, isViewSelf }) {
  const config = {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  };
  const [profile, setProfile] = useState(null);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const response = await getUserProfile(userID);
      setProfile(response);
      setIsFriend(response.is_friend);
    };
    fetchData();
  }, [userID]);

  const addFriend = () => {
    const api = 'https://game.norgannon.cn:8848/api/user/friend/';
    axios
      .post(
        api,
        {
          user_id: userID,
        },
        config
      )
      .then(() => {
        setIsFriend(true);
      })
      .catch((error) => {
        console.error('Error adding friend: ', error.response ?? error);
      });
  };

  const removeFriend = () => {
    const api = 'https://game.norgannon.cn:8848/api/user/friend/';
    axios
      .delete(api, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        data: {
          user_id: userID,
        },
      })
      .then(() => {
        setIsFriend(false);
      })
      .catch((error) => {
        console.error('Error removing friend: ', error.response ?? error);
      });
  };

  if (profile == null) {
    return (
      <div className="loadingStyle">
        <Skeleton active={true} avatar paragraph={{ rows: 15 }} />
      </div>
    );
  } else {
    // logged in and view self profile
    if (logInState && isViewSelf) {
      return (
        <Space style={{ width: '100%' }} direction="vertical" size={40}>
          <EditableAvatar
            imageBase64={profile.image}
            userName={profile.username}
          />
          <EditableProfileBody
            profile={profile}
            logInState={logInState}
            isViewSelf={isViewSelf}
          />
        </Space>
      );
    } //not logged in or logged in but view other's profile
    else {
      return (
        <Space style={{ width: '100%' }} direction="vertical" size={40}>
          <EditableProfileBody
            profile={profile}
            logInState={logInState}
            isViewSelf={isViewSelf}
          />
          {isFriend ? (
            <Button type="primary" onClick={removeFriend}>
              Remove Friend
            </Button>
          ) : (
            <Button type="primary" onClick={addFriend}>
              Add Friend
            </Button>
          )}
        </Space>
      );
    }
  }
}

//
function EditableProfileBody({ profile, logInState, isViewSelf }) {
  const [country, setCountry] = useState(
    profile.country != null ? profile.country : 'Unknown'
  );
  const [city, setCity] = useState(
    profile.city != null ? profile.city : 'Unknown'
  );

  console.log(profile);

  const options = [
    {
      value: 'Unkonwn',
    },
    {
      value: 'Male',
    },
    {
      value: 'Female',
    },
  ];

  const onCountryChange = (text) => {
    setCountry(text);
    const url = 'https://game.norgannon.cn:8848/api/user/profile';
    const config = {
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    };
    const data = {
      country: text,
    };
    axios
      .patch(url, data, config)
      .then((response) => {})
      .catch((error) => {
        console.log('error', error);
      });
  };

  const onCityChange = (text) => {
    setCity(text);
    const url = 'https://game.norgannon.cn:8848/api/user/profile';
    const config = {
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    };
    const data = {
      city: text,
    };
    axios
      .patch(url, data, config)
      .then((response) => {})
      .catch((error) => {
        console.log('error', error);
      });
  };

  const onGenderChange = (value, option) => {
    var gender;
    switch (value) {
      case 'Male':
        gender = 1;
        break;
      case 'Female':
        gender = 2;
        break;
      case 'Unkonwn':
        gender = null;
        break;
    }
    const url = 'https://game.norgannon.cn:8848/api/user/profile';
    const config = {
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    };
    const data = {
      gender: gender,
    };
    axios
      .patch(url, data, config)
      .then((response) => {})
      .catch((error) => {
        console.log('error', error);
      });
  };

  if (logInState && isViewSelf) {
    return (
      <div>
        <Descriptions title="Profile" bordered>
          <Descriptions.Item label="Email" span={2}>
            {' '}
            <Typography.Text>
              {profile.email != null ? profile.email : 'Unkonwn'}
            </Typography.Text>{' '}
          </Descriptions.Item>
          <Descriptions.Item label="Country" span={1}>
            <Typography.Text
              id="userprofilecountry"
              editable={logInState ? { onChange: onCountryChange } : false}
            >
              {country}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="City" span={1}>
            <Typography.Text
              id="userprofilecity"
              editable={logInState ? { onChange: onCityChange } : false}
            >
              {city}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Gener" span={1}>
            <Select
              id="userprofilegender"
              onChange={onGenderChange}
              options={options}
              defaultValue={
                profile.gender != null
                  ? profile.gender == 1
                    ? 'Male'
                    : 'Female'
                  : 'Unknown'
              }
            ></Select>{' '}
          </Descriptions.Item>
          <Descriptions.Item label="Collection Count" span={1}>
            <Typography.Text>{profile.collection_count}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Active Status">
            <Typography.Text strong={true} mark={true}>
              {profile.is_active
                ? 'Enjoy your game!'
                : 'You are banned becasue of violation behavior'}
            </Typography.Text>
          </Descriptions.Item>
        </Descriptions>
        <Row>
          <Col span={24} style={profile.is_admin ? {} : { display: 'none' }}>
            <Typography.Text strong={true}>
              As an Administrator, you can access Admin Page by type the url:
              <Typography.Text code={true}>/adminpage</Typography.Text>
            </Typography.Text>{' '}
          </Col>
        </Row>
      </div>
    );
  } else {
    return (
      <div>
        <Descriptions title="profile" bordered>
          <Descriptions.Item label="User Name" span={2}>
            <Typography.Text>{profile.username}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Email" span={2}>
            {' '}
            <Typography.Text>
              {profile.email != null ? profile.email : 'Unkonwn'}
            </Typography.Text>{' '}
          </Descriptions.Item>
          <Descriptions.Item label="Country" span={1}>
            <Typography.Text id="userprofilecountry" editable={false}>
              {country}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="City" span={1}>
            <Typography.Text id="userprofilecity" editable={false}>
              {city}
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Gener" span={1}>
            <Typography.Text>
              {profile.gender != null
                ? profile.gender == 1
                  ? 'Male'
                  : 'Female'
                : 'Unknown'}
            </Typography.Text>{' '}
          </Descriptions.Item>
          <Descriptions.Item label="Collection Count" span={1}>
            <Typography.Text>{profile.collection_count}</Typography.Text>
          </Descriptions.Item>
        </Descriptions>
      </div>
    );
  }
}

function EditableAvatar({ imageBase64, userName }) {
  const [image, setImage] = useState(imageBase64);

  //check the upload file type and size
  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }

    return isJpgOrPng && isLt2M;
  };

  // update the image to backend
  const updateAvatar = async ({ file, onSuccess, onError }) => {
    const base64 = await getBase64(file);
    setImage(base64);
    const config = {
      method: 'patch',
      url: 'https://game.norgannon.cn:8848/api/user/profile',
      headers: {
        Authorization: localStorage.getItem('token'),
      },
      data: {
        image: base64,
      },
    };

    try {
      await axios(config);
      onSuccess();
    } catch (err) {
      alert('unexpected error occur when updating avatar');
      console.log(err);
      onError();
    }
  };

  return (
    <div>
      <Space
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
        direction="vertical"
        size={0}
      >
        <Upload
          beforeUpload={beforeUpload}
          listType={'picture-card'}
          customRequest={updateAvatar}
          showUploadList={false}
        >
          <Image src={image} width={100} height={100} preview={false} />
        </Upload>
        <Typography.Title level={2} code>
          {userName}
        </Typography.Title>
      </Space>
      <Divider style={{ width: '2px' }} />
    </div>
  );
}

async function updateUserAvatar(userID, image) {
  const config = {
    method: 'patch',
    url: 'https://game.norgannon.cn:8848/api/user/profile',
    headers: {
      Authorization: localStorage.getItem('token'),
    },
    data: {
      image: image,
    },
  };

  try {
    response = await axios(config);
  } catch (err) {
    alert('unexpected error occur when updating avatar');
    console.log(err);
  }
}

async function getUserProfile(userID) {
  const config = {
    method: 'get',
    url: 'https://game.norgannon.cn:8848/api/user/profile',
    params: {
      user_id: userID,
    },
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  };

  try {
    const response = await axios(config);
    return response.data.data;
  } catch (err) {
    alert('an unexpected error occurs when getting user profile');
    console.log(err);
  }
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
