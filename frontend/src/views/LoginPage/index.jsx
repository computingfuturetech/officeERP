import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/hooks/use-toast";
import { login } from "../../services/authentication";
import LoginForm from "@/components/components/login-form";
import images from "../../assets";

// Constants
const APP_NAME = "High Court Housing Society";

const LoginPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle login submission
  const handleSubmit = useCallback(
    async ({ email, password }) => {
      setIsSubmitting(true);
      try {
        const response = await login(email, password);
        if (response.status === 200) {
          toast({
            title: "Login Successful",
            description: "You have been successfully logged in.",
          });
          navigate("/");
        } else {
          throw new Error(response?.data?.message || "Login failed.");
        }
      } catch (error) {
        console.error("Login failed:", error);
        toast({
          title: "Login Failed",
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate, toast]
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10 w-full">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a
          href="/"
          className="flex items-center gap-2 self-center font-medium text-lg"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md">
            <img
              src={images.logo}
              alt={`${APP_NAME} logo`}
              className="h-full w-full object-contain"
            />
          </div>
          {APP_NAME}
        </a>
        <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
};

export default LoginPage;
