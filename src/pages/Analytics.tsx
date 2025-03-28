
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// This is a redirect component to maintain backward compatibility
export default function Analytics() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/analytics", { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}
