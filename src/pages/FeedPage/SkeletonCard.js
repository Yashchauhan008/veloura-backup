import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="flex flex-col gap-2">
      {/* Skeleton for the thumbnail */}
      <div className="w-full aspect-video bg-gray-700 rounded-xl animate-pulse"></div>
      <div className="flex gap-3 items-start">
        {/* Skeleton for the channel avatar */}
        <div className="w-10 h-10 bg-gray-700 rounded-full shrink-0 animate-pulse"></div>
        <div className="flex flex-col gap-2 w-full">
          {/* Skeleton for the title */}
          <div className="w-full h-5 bg-gray-700 rounded-md animate-pulse"></div>
          {/* Skeleton for the channel name */}
          <div className="w-3/4 h-4 bg-gray-700 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
