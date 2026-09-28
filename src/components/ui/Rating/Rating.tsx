import React from 'react';

interface RatingProps {
  value: number;
}

export const Rating: React.FC<RatingProps> = ({ value }) => {
  return <div className="rating">Rating: {value}/5</div>;
};
