import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './components/auth/AuthProvider';
import AppRoutes from './routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;