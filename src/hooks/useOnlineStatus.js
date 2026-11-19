// src/hooks/useOnlineStatus.js
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [connectionType, setConnectionType] = useState('4g');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const conn =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const updateConnectionInfo = () => {
      if (conn && conn.effectiveType) {
        setConnectionType(conn.effectiveType); // 'slow-2g', '2g', '3g', or '4g'
      }
    };

    if (conn) {
      updateConnectionInfo();
      conn.addEventListener('change', updateConnectionInfo);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (conn) conn.removeEventListener('change', updateConnectionInfo);
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowNetwork: connectionType === '2g' || connectionType === 'slow-2g',
  };
}