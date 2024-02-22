import React from 'react';

export default function ShopPage({ shopLink }) {
  return (
    <>
      <h2>Shop</h2>
      {shopLink === null || shopLink === undefined ? (
        <text>Sorry, no shop information for now</text>
      ) : (
        <a href={shopLink} target="_blank" rel="noopener noreferrer">
          BGG Shop
        </a>
      )}
    </>
  );
}
