
import React from 'react';

interface SecureIframeProps {
  src: string;
  title: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  allowedFeatures?: string[];
}

const SecureIframe: React.FC<SecureIframeProps> = ({
  src,
  title,
  width = '100%',
  height = '400',
  className,
  allowedFeatures = []
}) => {
  // Validate URL to prevent javascript: or data: URLs
  const isValidUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  };

  if (!isValidUrl(src)) {
    return (
      <div className={`border border-red-300 bg-red-50 p-4 rounded ${className}`}>
        <p className="text-red-600">Invalid or unsafe URL provided</p>
      </div>
    );
  }

  const sandboxAttributes = [
    'allow-same-origin',
    'allow-scripts',
    ...allowedFeatures
  ].join(' ');

  return (
    <iframe
      src={src}
      title={title}
      width={width}
      height={height}
      className={className}
      sandbox={sandboxAttributes}
      referrerPolicy="strict-origin-when-cross-origin"
      loading="lazy"
    />
  );
};

export default SecureIframe;
