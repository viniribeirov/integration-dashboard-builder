
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { HomeIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <h1 className="text-6xl font-bold mb-6">404</h1>
        <div className="w-16 h-1 bg-primary mx-auto mb-8"></div>
        <h2 className="text-2xl font-medium mb-4">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved. Please check the URL or navigate back to the dashboard.
        </p>
        <Link to="/dashboard">
          <Button className="gap-2">
            <HomeIcon className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
