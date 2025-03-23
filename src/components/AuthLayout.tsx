
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from './Header';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If still loading, render a loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-r-transparent animate-spin" />
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the layout
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mt-16 container mx-auto px-4 md:px-6 py-8">
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
