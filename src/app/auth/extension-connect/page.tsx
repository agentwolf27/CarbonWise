'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ExtensionConnectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      // Redirect to sign in if not authenticated
      router.push('/auth/signin');
      return;
    }

    // Automatically attempt connection when page loads
    connectExtension();
  }, [session, status]);

  const connectExtension = async () => {
    if (!session?.user?.id) return;
    
    console.log('🔑 Starting extension connection for user:', session.user.email);
    setIsConnecting(true);
    setConnectionStatus('connecting');

    try {
      // Generate JWT token for the extension
      const response = await fetch('/api/auth/extension-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id,
          directAuth: true // Flag for direct authentication from web app
        })
      });

      console.log('📡 Extension OAuth response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate extension token: ${errorText}`);
      }

      const { accessToken, user } = await response.json();
      console.log('✅ Extension token generated for user:', user.email);
      
      // Store connection info for the extension to access
      const connectionData = {
        carbonwise_token: accessToken,
        carbonwise_user: user
      };

      console.log('📤 Sending authentication data to extension:', {
        token: accessToken ? 'present' : 'missing',
        user: user.email
      });

      // Try to communicate with extension via postMessage
      window.postMessage({
        type: 'CARBONWISE_AUTH_SUCCESS',
        data: connectionData
      }, '*');

      // Also try Chrome extension API if available
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        try {
          // Send message to extension
          chrome.runtime.sendMessage({
            type: 'WEB_AUTH_SUCCESS',
            data: connectionData
          });
          console.log('📡 Sent auth data via Chrome runtime API');
        } catch (error) {
          console.log('Chrome extension API not available:', error.message);
        }
      }

      setConnectionStatus('success');
      console.log('🎉 Extension connection completed successfully');
      
      // Show success message and redirect after delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);

    } catch (error) {
      console.error('Extension connection failed:', error);
      setConnectionStatus('error');
    } finally {
      setIsConnecting(false);
    }
  };

  // Listen for messages from extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CARBONWISE_EXTENSION_READY') {
        console.log('Extension is ready for authentication');
        connectExtension();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Connect CarbonWise Extension</h1>
          <p className="text-gray-400">Linking your browser extension to your account</p>
        </div>

        {connectionStatus === 'connecting' && (
          <div className="text-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Connecting extension...</p>
            <p className="text-gray-500 text-sm mt-2">Generating secure token...</p>
          </div>
        )}

        {connectionStatus === 'success' && (
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">Connection Successful!</h3>
            <p className="text-gray-300 text-sm mb-4">
              Your Chrome extension is now connected to your CarbonWise account.
            </p>
            <div className="bg-slate-700 rounded-lg p-3 mb-4">
              <p className="text-green-400 text-sm font-medium">✓ Extension authenticated</p>
              <p className="text-green-400 text-sm font-medium">✓ Tracking enabled</p>
              <p className="text-green-400 text-sm font-medium">✓ Ready for carbon monitoring</p>
            </div>
            <p className="text-gray-400 text-sm">
              Redirecting to dashboard...
            </p>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">Connection Failed</h3>
            <p className="text-gray-300 text-sm mb-4">
              Unable to connect your extension. Please try again.
            </p>
            <button
              onClick={connectExtension}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
        )}

        {connectionStatus === 'idle' && (
          <div className="text-center mb-6">
            <p className="text-gray-300 text-sm mb-4">
              Click the button below to connect your CarbonWise Chrome extension.
            </p>
            <button
              onClick={connectExtension}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Connecting...' : 'Connect Extension'}
            </button>
          </div>
        )}

        <div className="border-t border-slate-700 pt-6">
          <h4 className="text-sm font-medium text-gray-300 mb-3">What happens next?</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start">
              <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              Automatic tracking on supported websites
            </li>
            <li className="flex items-start">
              <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              Real-time carbon footprint notifications
            </li>
            <li className="flex items-start">
              <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              Seamless sync with your dashboard
            </li>
          </ul>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700">
          <p className="text-xs text-gray-500 text-center">
            Your privacy is protected. We only track anonymized carbon data.
          </p>
        </div>
      </div>
    </div>
  );
} 