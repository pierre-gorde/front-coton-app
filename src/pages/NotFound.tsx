import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-7xl font-bold text-primary">404</h1>
          <p className="text-xl text-muted-foreground">Page introuvable</p>
        </div>
        <p className="text-muted-foreground max-w-md">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link to="/dashboard">
          <Button className="gradient-accent text-accent-foreground">
            <Home className="h-4 w-4 mr-2" />
            Retour au dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
