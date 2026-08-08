import { useLang } from '../context/LanguageContext';
import './StatusStates.css';

export function LoadingState({ message }) {
  const { lang } = useLang();
  const defaultMsg = lang === 'mr' ? 'आकाश वाचत आहे…' : 'Reading the sky…';
  return (
    <div className="status-state status-state--loading" role="status" aria-live="polite">
      <span className="status-state__ring" aria-hidden="true" />
      <p>{message || defaultMsg}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  const { lang } = useLang();
  const title = lang === 'mr' ? 'गणना पूर्ण होऊ शकली नाही' : "Couldn't complete the calculation";
  const retryLabel = lang === 'mr' ? 'पुन्हा प्रयत्न करा' : 'Try again';
  return (
    <div className="status-state status-state--error" role="alert">
      <p className="status-state__title">{title}</p>
      <p className="status-state__message">{message}</p>
      {onRetry && (
        <button className="status-state__retry" onClick={onRetry} type="button">
          {retryLabel}
        </button>
      )}
    </div>
  );
}
