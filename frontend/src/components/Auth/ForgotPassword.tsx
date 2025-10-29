import { useState } from "react";
import { Card, CardContent } from "../UI/Card";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log("Password reset for:", email);
    // 🔄 Call API to send reset email
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardContent>
          <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                name="email"
                className="w-full p-2 border rounded"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition"
            >
              Send Reset Link
            </button>

            <div className="text-center mt-2 text-sm">
              <a href="/login" className="text-blue-500 hover:underline">
                Back to Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
