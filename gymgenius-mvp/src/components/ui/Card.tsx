'use client';

import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
}

/**
 * Reusable Card komponenta za prikaz grupisanih informacija
 * 
 * @example
 * <Card
 *   title="Bench Press"
 *   subtitle="Chest Exercise"
 *   image="/exercises/bench-press.jpg"
 *   hoverable
 *   onClick={() => console.log('Card clicked')}
 * >
 *   <p>Description of the exercise...</p>
 * </Card>
 */
export default function Card({
  title,
  subtitle,
  image,
  imageAlt = '',
  children,
  footer,
  onClick,
  className = '',
  hoverable = false,
}: CardProps) {
  
  // Base stilovi
  const baseStyles = 'bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200';

  // Hover stilovi
  const hoverStyles = hoverable || onClick
    ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer'
    : '';

  // Kombinuj stilove
  const cardStyles = `${baseStyles} ${hoverStyles} ${className}`;

  return (
    <div className={cardStyles} onClick={onClick}>
      {/* Image */}
      {image && (
        <div className="relative h-48 w-full overflow-hidden bg-gray-200">
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        {(title || subtitle) && (
          <div className="mb-3">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        )}

        {/* Body */}
        {children && (
          <div className="text-gray-700">{children}</div>
        )}
      </div>

      {/* Footer */}
      {footer && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}