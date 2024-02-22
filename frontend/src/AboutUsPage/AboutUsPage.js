import React from 'react';
import { Typography } from 'antd';

import './AboutUsPage.css';

const { Paragraph } = Typography;

// this page gives a summary of the website
export default function AboutUsPage() {
  return (
    <div className="content-container">
      <h1>About Us</h1>
      <div className="container">
        <Paragraph className="paragraph">
          We are a group of gamers that are aware of the difficulties in
          sourcing and managing various game genres. We were motivated to
          develop a system that may assist users in managing their collections,
          discovering new games, and interacting with other players by our love
          of offline games.
        </Paragraph>
        <Paragraph className="paragraph">
          With features that let users manage their collections across many game
          genres, look for new games, and interact with other players, our
          solution is made to be simple to use and adaptable. Along with forum
          discussions, we also offer game reviews and ratings.
        </Paragraph>
        <Paragraph className="paragraph">
          Our staff is committed to making our product better every day, and we
          value customer feedback to make sure we are meeting their needs. We
          are dedicated to giving our consumers a top-notch gaming experience
          and enabling them to get the most out of their pastimes.
        </Paragraph>
        <Paragraph className="paragraph">
          We appreciate you using our product and joining our community. Please
          feel free to contact us at radhikesh1997@gmail.com if you have any
          inquiries or suggestions.
        </Paragraph>
      </div>
    </div>
  );
}
