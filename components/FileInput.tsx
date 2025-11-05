
import React from 'react';

interface FileInputProps {
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileName: string | null;
  required?: boolean;
}

const FileInput: React.FC<FileInputProps> = ({ label, name, onChange, fileName, required = false }) => {
  return (
    <div className="w-full">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="flex text-sm text-gray-600">
            <label htmlFor={name} className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500">
              <span>Sube un archivo</span>
              <input id={name} name={name} type="file" className="sr-only" onChange={onChange} required={required} accept=".pdf,.doc,.docx" />
            </label>
            <p className="pl-1">o arrástralo aquí</p>
          </div>
          <p className="text-xs text-gray-500">PDF, DOC, DOCX hasta 10MB</p>
          {fileName && <p className="text-sm text-green-600 mt-2 font-semibold">{fileName}</p>}
        </div>
      </div>
    </div>
  );
};

export default FileInput;
