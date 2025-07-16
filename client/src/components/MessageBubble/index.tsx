import React from 'react';
import { Avatar } from 'antd';

interface MessageBubbleProps {
  username: string;
  avatarUrl?: string;
  message: string;
  isSelf?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  username,
  avatarUrl,
  message,
  isSelf = false,
}) => {
  return (
    <div
      className={`flex items-start mb-4 ${
        isSelf ? 'flex-row-reverse text-right' : ''
      }`}
    >
      <Avatar
        src={avatarUrl}
        className={`${isSelf ? 'ml-3 mt-3' : 'mr-3 mt-3'}`}
        size="large"
      >
        {username[0]}
      </Avatar>

      <div className="max-w-[70%]">
        <div className="text-xs text-gray-600 font-semibold mb-1">{username}</div>
        <div
          className={`px-4 py-2 rounded-xl text-sm whitespace-pre-wrap break-words ${
            isSelf
              ? 'bg-blue-500 text-white rounded-tr-none'
              : 'bg-gray-200 text-black rounded-tl-none'
          }`}
        >
          {message}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;