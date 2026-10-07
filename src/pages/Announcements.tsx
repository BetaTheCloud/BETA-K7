import { Navigate, useLocation } from 'react-router-dom';

export default function Announcements() {
  const location = useLocation();
  // Preserve any search parameters (e.g. ?faculty=... or ?dept=...)
  const targetSearch = location.search 
    ? (location.search.includes('view=') ? location.search : `${location.search}&view=announcements`)
    : '?view=announcements';

  return <Navigate to={`/news${targetSearch}`} replace />;
}
