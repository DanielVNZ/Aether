import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTVNavigation } from '../hooks/useTVNavigation';
import { useNavigate } from 'react-router-dom';
import { embyApi } from '../services/embyApi';
import type { LoginCredentials } from '../types/emby.types';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  // Enable D-Pad navigation between form fields on TV
  useTVNavigation();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    serverUrl: localStorage.getItem('emby_server_url') || '',
    username: localStorage.getItem('emby_username') || '',
    password: '',
  });
  const [connectCredentials, setConnectCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMode, setLoginMode] = useState<'direct' | 'connect'>('direct');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (loginMode === 'direct') {
        // Save server URL and username for next time
        localStorage.setItem('emby_server_url', credentials.serverUrl);
        localStorage.setItem('emby_username', credentials.username);

        await login(credentials);
        return;
      }

      const auth = await embyApi.connectAuthenticate(
        connectCredentials.username,
        connectCredentials.password
      );

      const connectUserId =
        auth.ConnectUserId ||
        auth.UserId ||
        (auth.User && typeof auth.User === 'object' ? (auth.User as { Id?: string }).Id : '') ||
        (auth as { connectUserId?: string }).connectUserId ||
        '';
      const connectAccessToken =
        auth.ConnectAccessToken ||
        auth.AccessToken ||
        (auth as { connectAccessToken?: string }).connectAccessToken ||
        '';

      if (!connectUserId || !connectAccessToken) {
        console.error('Connect auth response missing tokens:', auth);
        setError('Emby Connect did not return a valid user token. Please try again.');
        return;
      }

      const servers = await embyApi.connectGetServers(connectUserId, connectAccessToken);
      if (servers.length === 0) {
        setError('No servers found for this Emby Connect account.');
        return;
      }

      sessionStorage.setItem(
        'emby_connect_auth',
        JSON.stringify({ userId: connectUserId, username: connectCredentials.username })
      );
      sessionStorage.setItem('emby_connect_servers', JSON.stringify(servers));
      navigate('/connect');
    } catch (err) {
      setError(
        loginMode === 'direct'
          ? 'Login failed. Please check your credentials and server URL.'
          : 'Emby Connect login failed. Please check your credentials and try again.'
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="max-w-md w-full">
        <div className="bg-dark-card rounded-lg shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <img src="/Logo.png" alt="Aether" className="h-32 object-contain rounded-2xl" />
          </div>
          <p className="text-gray-400 text-center mb-8">
            Sign in to your Emby server
          </p>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode('direct');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                loginMode === 'direct'
                  ? 'bg-blue-600 text-white'
                  : 'bg-dark-bg text-gray-300 border border-gray-700'
              }`}
            >
              IP Address
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('connect');
                setError('');
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                loginMode === 'connect'
                  ? 'bg-blue-600 text-white'
                  : 'bg-dark-bg text-gray-300 border border-gray-700'
              }`}
            >
              Emby Connect
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {loginMode === 'direct' ? (
              <>
                <div>
                  <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-300 mb-2">
                    Server URL
                  </label>
                  <input
                    id="serverUrl"
                    type="text"
                    placeholder="http://192.168.1.100:8096"
                    value={credentials.serverUrl}
                    onChange={(e) => setCredentials({ ...credentials, serverUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include http:// or https:// and port number (Example: http://192.168.1.100:8096 or https://myserver.com:443)
                  </p>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="connectUsername" className="block text-sm font-medium text-gray-300 mb-2">
                    Emby Connect Email
                  </label>
                  <input
                    id="connectUsername"
                    type="text"
                    value={connectCredentials.username}
                    onChange={(e) =>
                      setConnectCredentials({ ...connectCredentials, username: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="connectPassword" className="block text-sm font-medium text-gray-300 mb-2">
                    Emby Connect Password
                  </label>
                  <input
                    id="connectPassword"
                    type="password"
                    value={connectCredentials.password}
                    onChange={(e) =>
                      setConnectCredentials({ ...connectCredentials, password: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-dark-bg border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

              </>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              {isLoading
                ? 'Signing in...'
                : loginMode === 'direct'
                ? 'Sign In'
                : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
