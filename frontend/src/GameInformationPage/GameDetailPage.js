import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, List } from 'antd';

export default function GameDetailPage({ gameID }) {
  const [publishers, setPublishers] = useState([]);

  useEffect(() => {
    fetchPublishers();
  }, [gameID]);

  const fetchPublishers = () => {
    const api = `https://game.norgannon.cn:8848/api/publisher/list?game_id=${gameID}`;
    axios
      .get(api)
      .then((response) => {
        setPublishers(response.data.data);
      })
      .catch((error) => {
        console.error('Error fetching reviews: ', error.response ?? error);
      });
  };

  return (
    <>
      <h2>Publisher</h2>
      {publishers[0] === null || publishers[0] === undefined ? (
        <text>Sorry, no publisher information.</text>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={publishers}
          split={true}
          renderItem={(item) => (
            <Card title={item.name}>
              <p
                dangerouslySetInnerHTML={{
                  __html:
                    item.description ==
                    'This page does not exist. You can edit this page to create it.'
                      ? 'Sorry, no detailed publisher information for now'
                      : item.description,
                }}
              />
            </Card>
          )}
        />
      )}
    </>
  );
}
