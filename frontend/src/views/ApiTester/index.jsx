import { useCallback, useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/components/ui/select";
import { Button } from "@/components/components/ui/button";
import { Input } from "@/components/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/components/ui/card";
import { Textarea } from "@/components/components/ui/textareas";
import { AlertCircle, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/components/ui/alert";
import { useToast } from "@/components/hooks/use-toast";
import api from "@/core/api";

// Constants
const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const BODYLESS_METHODS = ["GET", "HEAD"];
const INITIAL_BODY = "{\n  \n}";

const ApiTester = () => {
  const { toast } = useToast();
  const [method, setMethod] = useState(HTTP_METHODS[0]);
  const [url, setUrl] = useState("");
  const [body, setBody] = useState(INITIAL_BODY);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle API request
  const handleSend = useCallback(async () => {
    if (!url) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      let parsedBody;
      if (!BODYLESS_METHODS.includes(method) && body.trim()) {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          throw new Error("Invalid JSON in request body.");
        }
      }

      const requestConfig = BODYLESS_METHODS.includes(method)
        ? { method: method.toLowerCase(), url }
        : { method: method.toLowerCase(), url, data: parsedBody };

      const result = await api(requestConfig);

      setResponse({
        status: result?.status,
        statusText: result?.statusText,
        data: result?.data,
      });
    } catch (error) {
      console.error("API request failed:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred."
      );
      toast({
        title: "Request Failed",
        description:
          error.response?.data?.message ||
          error.message ||
          "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [method, url, body, toast]);

  // Memoized method options
  const methodOptions = useMemo(
    () => HTTP_METHODS.map((m) => ({ value: m, label: m })),
    []
  );

  return (
    <div className="w-full p-4 space-y-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>API Tester</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                {methodOptions.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Enter API URL (e.g., /api/resource)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !url.trim()}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>

          {!BODYLESS_METHODS.includes(method) && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Request Body (JSON)
              </label>
              <Textarea
                placeholder="Enter request body as JSON"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="font-mono h-32 resize-y"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="shadow-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {response && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <span className="font-semibold">Status:</span>
              <span>
                {response.status} {response.statusText}
              </span>
            </div>
            <div className="space-y-2">
              <span className="font-semibold">Body:</span>
              <pre className="mt-2 p-3 bg-slate-100 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(response.data, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiTester;
