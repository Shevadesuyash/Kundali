import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AstroTooltip.css';

/**
 * AstroTooltip — Interactive question mark info badge (ⓘ) that reveals
 * beginner-friendly Vedic explanations for astrological concepts.
 */
export default function AstroTooltip({ title, content, learnMoreId }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <span className="astro-tooltip-wrap" ref={wrapperRef}>
      <button
        type="button"
        className="astro-tooltip-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Learn about ${title || 'astrological term'}`}
        title={`What is ${title || 'this'}? Click for explanation`}
      >
        ?
      </button>

      {isOpen && (
        <div className="astro-tooltip-popover" role="tooltip">
          {title && <h5 className="astro-tooltip-title">✦ {title}</h5>}
          <p className="astro-tooltip-text">{content}</p>
          {learnMoreId && (
            <Link
              to={`/guide#${learnMoreId}`}
              className="astro-tooltip-link"
              onClick={() => setIsOpen(false)}
            >
              Learn more in Astro Guide →
            </Link>
          )}
        </div>
      )}
    </span>
  );
}
