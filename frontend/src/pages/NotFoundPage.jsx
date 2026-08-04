import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <>
      <h1>Page not found</h1>
      <p>
        We couldn&apos;t find that page. <Link to="/">Back to the catalog</Link>.
      </p>
    </>
  );
}
