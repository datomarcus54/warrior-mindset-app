import React from 'react';

interface EmptyStateProps {
  heading: string;
  message: string;
  buttonLabel: string;
  onButtonClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ heading, message, buttonLabel, onButtonClick }) => {
  return (
    <div className="border border-orange-400 border-opacity-50 bg-gray-900 rounded-xl p-6 text-center w-full">
      <h3 className="text-white font-bold text-lg mb-2">{heading}</h3>
      <p className="text-teal-400 text-sm mb-5">{message}</p>
      <button
        onClick={onButtonClick}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
      >
        {buttonLabel}
      </button>
    </div>
  );
};

export default EmptyState;
