import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      // setError(err.response?.data?.message || 'Registration failed. Please try again.');
      if (err.response) {
        // Server actually responded (e.g. email already in use) — show its message.
        setError(err.response.data?.message || 'Registration failed. Please try again.');
      } else {
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
          <p className="text-household-muted text-sm mt-1">Create your household account</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {error && <p className="text-household-danger text-sm font-semibold">{error}</p>}
          <div>
            <label className="text-sm font-semibold text-household-text">Name</label>
            <input required className="input-field mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
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
              minLength={6}
              className="input-field mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-household-muted mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-household-primary font-bold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
