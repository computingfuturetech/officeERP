import { GalleryVerticalEnd } from "lucide-react";
import LoginForm from "@/components/components/login-form";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authentication";
import { toast } from "@/components/hooks/use-toast";
import images from "../../assets";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      const response = await login(formData.email, formData.password);
      if (response.status === 200) {
        toast({
          title: "Login Successful",
          description: "You have been successfully logged in.",
        });
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10 w-screen">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md ">
            <img src={images.logo} alt="logo" />
          </div>
          High Court Housing Society
        </a>
        <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
