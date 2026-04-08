/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import { ChatLayout } from './components/ChatLayout';

function AppContent() {
  const { user } = useAuth();
  return user ? <ChatLayout /> : <Auth />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
