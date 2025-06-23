'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ExtensionConnectPage() {
  const { data: session } = useSession();
  const [status, setStatus] = useState('Checking authentication...');
  const router = useRouter();

  useEffect(() => {
    const connectExtension = async () => {
      if (!session?.user) {
        setStatus('Please sign in first...');
        setTimeout(() => {
          router.push('/auth/signin?callbackUrl=/auth/extension-connect');
        }, 2000);
        return;
      }

      try {
        setStatus('Connecting extension...');
        
        // Generate proper JWT token using the extension OAuth API
        const response = await fetch('/api/auth/extension-oauth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            directAuth: true,
            userId: session.user.id
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to generate extension token: ${response.status}`);
        }

        const tokenData = await response.json();
        
        // Send data to extension
        const extensionData = {
          carbonwise_token: tokenData.accessToken,
          carbonwise_user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            accountType: session.user.accountType || 'INDIVIDUAL'
          }
        };

        // Send authentication data to extension via message passing
        console.log('🔗 Sending auth data to extension:', extensionData);
        
        // Method 1: Direct message to extension
        window.postMessage({
          type: 'CARBONWISE_AUTH_SUCCESS',
          data: extensionData,
          source: 'carbonwise_web_app'
        }, '*');
        
        // Method 2: Try Chrome extension API if available
        if (typeof chrome !== 'undefined' && chrome.runtime) {
          try {
            await chrome.runtime.sendMessage({
              type: 'WEB_AUTH_SUCCESS',
              data: extensionData
            });
            console.log('✅ Sent auth data via Chrome runtime API');
          } catch (error) {
            console.log('Chrome runtime API not available:', error.message);
          }
        }
        
        // Method 3: Store in localStorage as backup
        try {
          localStorage.setItem('carbonwise_auth_data', JSON.stringify(extensionData));
          console.log('💾 Stored auth data in localStorage as backup');
        } catch (error) {
          console.log('localStorage not available:', error.message);
        }
        
        setStatus('✅ Authentication complete! Extension should connect shortly...');
        
        // Listen for confirmation from extension
        const handleConfirmation = (event) => {
          if (event.data.type === 'CARBONWISE_EXTENSION_AUTH_COMPLETE') {
            console.log('📬 Received confirmation from extension:', event.data);
            if (event.data.success) {
              setStatus('🎉 Extension connected successfully! Redirecting...');
            } else {
              setStatus(`❌ Extension connection failed: ${event.data.error}`);
            }
          }
        };
        
        window.addEventListener('message', handleConfirmation);
        
        // Wait a bit longer before redirecting to allow extension to process
        setTimeout(() => {
          window.removeEventListener('message', handleConfirmation);
          router.push('/dashboard');
        }, 4000);
        
      } catch (error) {
        console.error('Extension connection failed:', error);
        setStatus('❌ Connection failed. Please try again.');
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    };

    connectExtension();
  }, [session, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-carbon-dark to-carbon-darker flex items-center justify-center">
      <div className="max-w-md w-full bg-carbon-card border border-carbon-border rounded-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            🔗
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Connecting Extension
          </h1>
          <p className="text-carbon-muted">
            Linking your CarbonWise account with the browser extension...
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-primary-green rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-primary-green rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-primary-green rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-white font-medium">{status}</p>
        </div>

        {session?.user && (
          <div className="bg-carbon-dark rounded-lg p-4 mb-6">
            <p className="text-sm text-carbon-muted mb-2">Connecting as:</p>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-green/20 rounded-full flex items-center justify-center">
                👤
              </div>
              <div className="text-left">
                <p className="text-white font-medium">{session.user.name}</p>
                <p className="text-carbon-muted text-sm">{session.user.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 text-sm text-carbon-muted">
          <p>✓ Secure authentication</p>
          <p>✓ Real-time carbon tracking</p>
          <p>✓ Automatic data sync</p>
        </div>
      </div>
    </div>
  );
} 