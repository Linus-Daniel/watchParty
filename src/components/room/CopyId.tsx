"use client"
import React, { useState } from 'react';
import { FiCopy } from 'react-icons/fi';

interface CopyTextProps {
  text: string;
  className?: string;
}

const CopyText: React.FC<CopyTextProps> = ({ text, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <div className={`flex items-center group rounded-sm ${className}`}>
      <p className="mr-2 text-gray-300">{text}</p>
      <button
        onClick={copyToClipboard}
        className="text-gray-400 hover:text-white transition-colors"
        aria-label="Copy to clipboard"
      >
        <FiCopy className="w-4 h-4" />
      </button>
      {copied && (
        <span className="ml-2 text-xs text-green-500 animate-fade-in-out">
          Copied!
        </span>
      )}
    </div>
  );
};

export default CopyText;