import React from 'react';

interface CollapsibleFieldsetProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleFieldset: React.FC<CollapsibleFieldsetProps> = ({ title, isOpen, onToggle, children }) => {
  return (
    <fieldset className="overflow-hidden">
      <legend 
        className="w-full text-xl font-semibold text-gray-800 border-b-2 border-pink-200 pb-2 mb-6 flex justify-between items-center cursor-pointer select-none"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <svg
          className={`w-6 h-6 text-pink-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </legend>
      <div 
        className={`transition-all duration-500 ease-in-out grid ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
         {children}
        </div>
      </div>
    </fieldset>
  );
};

export default CollapsibleFieldset;
