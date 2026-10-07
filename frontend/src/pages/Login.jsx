import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // setError(err.response?.data?.message || 'Login failed. Please try again.');
       if (err.response) {
        // Server actually responded (e.g. wrong password) — show its message.
        setError(err.response.data?.message || 'Login failed. Please try again.');
      } else {
        // No response at all means the request never completed — most commonly a
        // CORS rejection or no network/wrong API URL, NOT bad credentials. Surfacing
        // this distinction matters: "wrong password" and "can't reach the server"
        // need completely different fixes.
        setError('Could not reach the server. Check your internet connection and that the app is pointed at the right API URL.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏡</div>
          <h1 className="text-2xl font-extrabold text-household-primaryDark">Ghar Ka Hisaab</h1>
          <p className="text-household-muted text-sm mt-1">Welcome back! Let's see how the home is doing.</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <p className="text-household-danger text-sm font-semibold">{error}</p>}
          <div>
            <label className="text-sm font-semibold text-household-text">Email</label>
            <input
              type="email"
              required
              className="input-field mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-household-text">Password</label>
            <input
              type="password"
              required
              className="input-field mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-sm text-household-muted mt-4">
          New here?{' '}
          <Link to="/register" className="text-household-primary font-bold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
