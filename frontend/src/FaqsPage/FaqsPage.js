import React from 'react';
import { Typography } from 'antd';

import './FaqsPage.css';

const { Paragraph } = Typography;

// this page gives answers to commonly asked question
export default function FaqsPage() {
  return (
    <div className="content-container">
      <h1>Frequently Asked Questions</h1>
      <section className="faq-question">
        <h3>What types of games can I manage using your product?</h3>
        <Paragraph className="paragraph">
          Our website is designed to manage board games, card games, and
          role-playing games. You can add, remove, and update items in your
          collection, and also search for new games.
        </Paragraph>
      </section>
      <section className="faq-question">
        <h3>Do I have the option to rate and review games?</h3>
        <Paragraph className="paragraph">
          Yes, our product enables you to rate and review games. You can also
          post your own house rules or rule clarifications, as well as view
          reviews and ratings from other individuals and websites.
        </Paragraph>
      </section>
      <section className="faq-question">
        <h3>Can I search for other players in the community?</h3>
        <Paragraph className="paragraph">
          Yes, our website enables users to search for other users in the
          community. There is even an option to add other users as friends in
          our website.
        </Paragraph>
      </section>
      <section className="faq-question">
        <h3>
          Can I add additional personized information about a particular game
          which I hold in my collection?
        </h3>
        <Paragraph className="paragraph">
          Yes, you can add game notes, your playing time and component as
          additional information to a particular game in your collection
        </Paragraph>
      </section>
      <section className="faq-question">
        <h3>How can I contact your team for support or feedback?</h3>
        <Paragraph className="paragraph">
          You can contact us at radhikesh1997@gmail.com for support or feedback.
          We are dedicated to providing a quality user experience and improving
          our product based on user feedback.
        </Paragraph>
      </section>
    </div>
  );
}
