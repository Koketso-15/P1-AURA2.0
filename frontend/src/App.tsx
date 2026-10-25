import { useEffect, useState } from 'react';

const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

function App() {
  const [tab, setTab] = useState<'chat' | 'trading' | 'profile'>('chat');
  const [prompt, setPrompt] = useState('Help me plan a productive day for my AI startup work.');
  const [symbol, setSymbol] = useState('AAPL');
  const [market, setMarket] = useState('NASDAQ');
  const [response, setResponse] = useState('');
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('AURA User');
  const [email, setEmail] = useState('user@example.com');
  const [password, setPassword] = useState('demo123');

  const fetchWatchlist = async () => {
    const res = await fetch(`${apiBase}/api/trading/watchlist`);
    const data = await res.json();
    setWatchlist(data);
  };

  const fetchSignals = async () => {
    const res = await fetch(`${apiBase}/api/trading/signals`);
    const data = await res.json();
    setSignals(data);
  };

  const fetchProfile = async () => {
    const token = localStorage.getItem('aura-token');
    if (!token) return;

    const res = await fetch(`${apiBase}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      setUser(data);
    }
  };

  useEffect(() => {
    fetchWatchlist();
    fetchSignals();
    fetchProfile();
  }, []);

  const sendChat = async (customPrompt?: string) => {
    const nextPrompt = customPrompt ?? prompt;
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch(`${apiBase}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: nextPrompt }),
      });

      const data = await res.json();
      setResponse(data.reply ?? data.error ?? 'No response returned.');
    } catch (error) {
      setResponse(error instanceof Error ? error.message : 'Could not reach the backend. Make sure it is running.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeMarket = async () => {
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch(`${apiBase}/api/trading/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          market,
          commentary: 'Momentum is improving after a strong breakout and buyers are defending the trend.',
          prices: [100, 101, 102, 104, 107, 110, 109, 112, 113, 116],
        }),
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(error instanceof Error ? error.message : 'Market analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const authAction = async () => {
    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const body = authMode === 'register'
      ? { name, email, password }
      : { email, password };

    const res = await fetch(`${apiBase}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem('aura-token', data.token);
      setUser(data.user ?? null);
      setTab('profile');
    }

    setResponse(JSON.stringify(data, null, 2));
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Personal AI assistant</p>
          <h1>AURA 2.0</h1>
        </div>

        <nav className="nav">
          <button onClick={() => setTab('chat')}>Chat</button>
          <button onClick={() => setTab('trading')}>Trading</button>
          <button onClick={() => setTab('profile')}>Profile</button>
          <button onClick={() => sendChat('Create a trading thesis for a breakout strategy.')}>Strategy</button>
          <button onClick={() => sendChat('Review this code for risk and security issues.')}>Code Review</button>
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">AI workspace</p>
            <h2>
              {tab === 'chat' && 'Assistant Console'}
              {tab === 'trading' && 'Trading Intelligence'}
              {tab === 'profile' && 'User Profile'}
            </h2>
          </div>
        </header>

        {tab === 'chat' && (
          <>
            <section className="panel">
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={6}
                placeholder="Ask AURA anything..."
              />

              <div className="actions">
                <button className="primary" onClick={() => sendChat()} disabled={loading}>
                  {loading ? 'Thinking...' : 'Send to AURA'}
                </button>
              </div>
            </section>
          </>
        )}

        {tab === 'trading' && (
          <>
            <section className="panel trading-panel">
              <div className="trading-grid">
                <label>
                  Symbol
                  <input value={symbol} onChange={(event) => setSymbol(event.target.value)} />
                </label>

                <label>
                  Market
                  <input value={market} onChange={(event) => setMarket(event.target.value)} />
                </label>
              </div>

              <div className="actions">
                <button className="primary" onClick={analyzeMarket} disabled={loading}>
                  {loading ? 'Analyzing...' : 'Analyze Market'}
                </button>
              </div>
            </section>

            <section className="panel dashboard-grid">
              <div className="mini-panel">
                <h3>Watchlist</h3>
                {watchlist.map((item) => (
                  <div key={item.symbol} className="list-row">
                    <span>{item.symbol}</span>
                    <span>{item.trend}</span>
                    <strong>{item.score}</strong>
                  </div>
                ))}
              </div>

              <div className="mini-panel">
                <h3>Live Signals</h3>
                {signals.map((item) => (
                  <div key={item.symbol} className="list-row">
                    <span>{item.symbol}</span>
                    <span>{item.signal}</span>
                    <strong>{item.score}</strong>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === 'profile' && (
          <section className="panel profile-panel">
            <div className="auth-toggle">
              <button className={authMode === 'register' ? 'primary' : ''} onClick={() => setAuthMode('register')}>Register</button>
              <button className={authMode === 'login' ? 'primary' : ''} onClick={() => setAuthMode('login')}>Login</button>
            </div>

            <div className="trading-grid">
              {authMode === 'register' && (
                <label>
                  Name
                  <input value={name} onChange={(event) => setName(event.target.value)} />
                </label>
              )}

              <label>
                Email
                <input value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>

              <label>
                Password
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </label>
            </div>

            <div className="actions">
              <button className="primary" onClick={authAction}>{authMode === 'register' ? 'Create Account' : 'Login'}</button>
            </div>

            {user && (
              <div className="user-box">
                <h3>Profile</h3>
                <p>Name: {user.name}</p>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
              </div>
            )}
          </section>
        )}

        <section className="panel response-panel">
          <h3>Response</h3>
          <div className="response-box">
            {response ? (
              <pre>{response}</pre>
            ) : (
              <p className="placeholder">Your AI response will appear here.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
