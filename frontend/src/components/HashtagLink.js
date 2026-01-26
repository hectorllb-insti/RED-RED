import { useNavigate } from "react-router-dom";
import "./HashtagLink.css";

/**
 * Componente para renderizar un hashtag como enlace
 */
const HashtagLink = ({ hashtag, className = "" }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/hashtags/${hashtag}`);
  };

  return (
    <span
      className={`hashtag-link ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      #{hashtag}
    </span>
  );
};

/**
 * Componente para renderizar texto con hashtags interactivos
 */
export const TextWithHashtags = ({ text, className = "" }) => {
  if (!text) return null;

  const pattern = /#([a-zA-Z0-9]\w*)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    // Texto antes del hashtag
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${key++}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }

    // Hashtag
    parts.push(
      <HashtagLink key={`hashtag-${key++}`} hashtag={match[1].toLowerCase()} />
    );

    lastIndex = pattern.lastIndex;
  }

  // Texto final
  if (lastIndex < text.length) {
    parts.push(<span key={`text-${key++}`}>{text.substring(lastIndex)}</span>);
  }

  return <span className={className}>{parts}</span>;
};

export default HashtagLink;
