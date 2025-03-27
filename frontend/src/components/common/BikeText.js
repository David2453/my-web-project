// src/components/common/BikeText.js
import React from 'react';
import { DirectionsBike as BikeIcon } from '@mui/icons-material';

const BikeText = ({ children, ...props }) => {
  if (typeof children !== 'string') return <span {...props}>{children}</span>;
  
  // Split text by 'B' character and insert bike icons between parts
  const parts = children.split('B');
  
  if (parts.length === 1) return <span {...props}>{children}</span>;
  
  return (
    <span {...props}>
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {index > 0 && <BikeIcon fontSize="inherit" style={{ verticalAlign: 'middle' }} />}
          {part}
        </React.Fragment>
      ))}
    </span>
  );
};

export default BikeText;