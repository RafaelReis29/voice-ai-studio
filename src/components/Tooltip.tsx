import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delayMs?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
  delayMs = 400
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const show = () => {
    timerRef.current = setTimeout(() => {
      setIsRendered(true);
      // Small tick for CSS opacity transition
      requestAnimationFrame(() => setIsVisible(true));
    }, delayMs);
  };

  const hide = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsVisible(false);
    setTimeout(() => {
      setIsRendered(false);
    }, 150);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  if (!content) {
    return <>{children}</>;
  }

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {isRendered && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none max-w-[280px] w-max bg-[#1F1830] text-[#F5F3FF] border border-[#2E2545] rounded-lg px-3 py-2 text-xs font-normal leading-relaxed shadow-2xl transition-opacity duration-150 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          } ${getPositionClasses()}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
