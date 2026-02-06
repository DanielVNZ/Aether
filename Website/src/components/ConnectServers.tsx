import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ConnectServer } from '../types/emby.types';

export function ConnectServers() {
  const { loginWithConnect } = useAuth();
  const navigate = useNavigate();

  const [servers, setServers] = useState<ConnectServer[]>([]);
  const [selectedServerId, setSelectedServerId] = useState('');
  const [useLocalAddress, setUseLocalAddress] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectAuth, setConnectAuth] = useState<{ userId: string; username: string } | null>(null);

  useEffect(() => {
    const storedAuth = sessionStorage.getItem('emby_connect_auth');
    const storedServers = sessionStorage.getItem('emby_connect_servers');

    if (!storedAuth || !storedServers) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const auth = JSON.parse(storedAuth) as { userId: string; username: string };
      const parsedServers = JSON.parse(storedServers) as ConnectServer[];
      setConnectAuth(auth);
      setServers(parsedServers);
      if (parsedServers.length === 1) {
        setSelectedServerId(parsedServers[0].SystemId);
      }
    } catch {
      sessionStorage.removeItem('emby_connect_auth');
      sessionStorage.removeItem('emby_connect_servers');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleConnect = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!connectAuth) {
        setError('Connect session expired. Please sign in again.');
        navigate('/login', { replace: true });
        return;
      }

      const selectedServer =
        servers.find((server) => server.SystemId === selectedServerId) || servers[0];

      if (!selectedServer) {
        setError('No servers found for this Emby Connect account.');
        return;
      }

      const serverUrl =
        (useLocalAddress && selectedServer.LocalAddress) ||
        selectedServer.Url ||
        selectedServer.LocalAddress ||
        '';

      if (!serverUrl) {
        setError('Selected server does not provide a reachable URL.');
        return;
      }

      await loginWithConnect({
        serverUrl,
        serverAccessKey: selectedServer.AccessKey,
        connectUserId: connectAuth.userId,
        connectUsername: connectAuth.username,
      });

      sessionStorage.removeItem('emby_connect_auth');
      sessionStorage.removeItem('emby_connect_servers');
    } catch (err) {
      setError('Emby Connect login failed. Please check your server selection and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-6 py-10">
      <div className="w-full max-w-2xl">
        <div className="bg-dark-card rounded-2xl shadow-xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Choose a Server</h1>
              <p className="text-gray-400 text-sm md:text-base">
                Select the Emby server to connect to
              </p>
            </div>
            <img src="/Logo.png" alt="Aether" className="h-16 md:h-20 object-contain rounded-2xl" />
          </div>

          <form onSubmit={handleConnect} className="space-y-5">
            <div>
              <label htmlFor="connectServer" className="block text-sm font-medium text-gray-300 mb-2">
                Server
              </label>
              <select
                id="connectServer"
                value={selectedServerId}
                onChange={(e) => setSelectedServerId(e.target.value)}
                className="w-full px-5 py-4 bg-dark-bg border border-gray-700 rounded-xl text-white text-base focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              >
                <option value="" disabled>
                  Select a server
                </option>
                {servers.map((server) => (
                  <option key={server.SystemId} value={server.SystemId}>
                    {server.Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-gray-700/70 bg-dark-bg/60 p-4">
              <p className="text-xs md:text-sm text-amber-400 mb-3">
                Only enable this if you are on the same local network as your server; otherwise login will fail.
              </p>
              <label className="flex items-center gap-3 text-sm md:text-base text-gray-200">
                <input
                  type="checkbox"
                  checked={useLocalAddress}
                  onChange={(e) => setUseLocalAddress(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-600 bg-dark-bg text-blue-600 focus:ring-blue-500"
                />
                Prefer local network address when available
              </label>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-xl transition-colors duration-200"
              >
                {isLoading ? 'Signing in...' : 'Connect'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full bg-dark-bg border border-gray-700 text-gray-300 font-semibold py-4 px-4 rounded-xl hover:border-gray-500 transition-colors duration-200"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
