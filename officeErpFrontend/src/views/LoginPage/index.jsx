import { GalleryVerticalEnd } from "lucide-react";

import LoginForm from "@/components/components/login-form";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
    navigate("/");
  };
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10 w-screen">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          High Court Housing Society
        </a>
        <LoginForm handleSubmit={handleSubmit} />
      </div>
    </div>
  );
}
