import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  rating = 0,
  max = 5,
  interactive = false,
  onRate = () => {},
  size = 18,
  showValue = false
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div className="rating-stars" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;

        return (
          <span
            key={starValue}
            className={`star-icon ${interactive ? 'star-interactive' : ''} ${isFilled ? 'filled' : 'empty'}`}
            style={{ cursor: interactive ? 'pointer' : 'default', lineHeight: 1 }}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onRate(starValue)}
            title={interactive ? `Rate ${starValue} star${starValue > 1 ? 's' : ''}` : `${rating} out of ${max}`}
          >
            <Star
              size={size}
              strokeWidth={1.8}
              fill={isFilled ? 'currentColor' : 'none'}
            />
          </span>
        );
      })}

      {showValue && (
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginLeft: '6px' }}>
          {rating ? Number(rating).toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
}
