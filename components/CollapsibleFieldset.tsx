import React from "react";

interface CollapsibleFieldsetProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleFieldset: React.FC<CollapsibleFieldsetProps> = ({
  title,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <fieldset className="border border-pink-100 rounded-xl overflow-hidden bg-pink-50/40">
      {/* Cabecera clickable */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-pink-50 hover:bg-pink-100 transition-colors"
        aria-expanded={isOpen}
      >
        <legend className="m-0 text-left text-base sm:text-lg font-semibold text-gray-800">
          {title}
        </legend>

        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-pink-300 text-pink-600 bg-white text-sm font-bold"
          aria-hidden="true"
        >
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {/* Contenido colapsable */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2 sm:pt-3">
          {children}
        </div>
      </div>
    </fieldset>
  );
};

export default CollapsibleFieldset;

