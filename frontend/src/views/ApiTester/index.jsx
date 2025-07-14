import React, { useState } from "react";
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
import { Textarea } from "@/components/components/ui/textarea";
import { AlertCircle, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/components/ui/alert";
import api from "../../core/api";

const ApiTester = () => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [body, setBody] = useState("{\n\n}");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let parsedBody;
      if (method !== "GET" && method !== "HEAD") {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          throw new Error("Invalid request body JSON");
        }
      }

      let result;
      switch (method) {
        case "GET":
          result = await api.get(url);
          break;
        case "POST":
          result = await api.post(url, parsedBody);
          break;
        case "PUT":
          result = await api.put(url, parsedBody);
          break;
        case "PATCH":
          result = await api.patch(url, parsedBody);
          break;
        case "DELETE":
          result = await api.delete(url, { data: parsedBody });
          break;
        default:
          throw new Error("Unsupported method");
      }

      setResponse({
        status: result?.status,
        statusText: result?.statusText,
        data: result?.data,
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>API Tester</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-32">
                <SelectValue>{method}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={loading || !url}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>

          {method !== "GET" && method !== "HEAD" && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                Request Body
              </label>
              <Textarea
                placeholder="Enter request body as JSON"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="font-mono h-32"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <span className="font-semibold">Status:</span>
                <span>
                  {response.status} {response.statusText}
                </span>
              </div>
              <div>
                <span className="font-semibold">Body:</span>
                <pre className="mt-2 p-2 bg-slate-100 rounded overflow-auto">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiTester;
