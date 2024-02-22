import React from 'react';
import { Empty, Typography } from 'antd';
import './NotFoundPage.css';

export default function NotFoundPage({ promotion }) {
  return (
    <Empty
      className="empty"
      description={
        <Typography.Title type="warning" level={1}>
          {promotion == null ? 'The Resources Are Not Found' : promotion}
        </Typography.Title>
      }
      imageStyle={{ marginLeft: 750, height: 400, width: 400 }}
    ></Empty>
  );
}
