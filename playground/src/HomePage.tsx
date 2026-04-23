import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <main
      style={{
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '40rem',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
        Theodore playground
      </h1>
      <p style={{ color: '#555', marginBottom: '1.25rem' }}>
        Pick a demo route below.
      </p>
      <ul style={{ lineHeight: 1.8 }}>
        <li>
          <Link to="/">Editor (minimal)</Link>
        </li>
        <li>
          <Link to="/chat">Chat</Link>
        </li>
      </ul>
    </main>
  );
};

export default HomePage;
