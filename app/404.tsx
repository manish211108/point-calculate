import Link from 'next/link';

export default function Custom404() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ marginBottom: '2rem' }}>
        Oops! The page you are looking for does not exist.<br />
        Try going back to the <Link href="/">homepage</Link> or explore other sections.
      </p>
      <Link href="/">
        <button style={{ padding: '0.75rem 2rem', fontSize: '1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>
          Go Home
        </button>
      </Link>
      <div style={{ marginTop: '2rem', opacity: 0.7 }}>
        <span>ArcadeINDIA &copy; {new Date().getFullYear()}</span>
      </div>
    </div>
  );
} 
