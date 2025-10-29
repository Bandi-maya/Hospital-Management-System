import { useState } from "react";
import { Card, CardContent } from "../UI/Card";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: any) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Register data:", formData);
    // 📝 Call your API to create user account
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardContent>
          <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Full Name</label>
              <input
                type="text"
                name="name"
                className="w-full p-2 border rounded"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Email</label>
              <input
                type="email"
                name="email"
                className="w-full p-2 border rounded"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Password</label>
              <input
                type="password"
                name="password"
                className="w-full p-2 border rounded"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="w-full p-2 border rounded"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
            >
              Register
            </button>

            <div className="text-center mt-2 text-sm">
              <a href="/login" className="text-blue-500 hover:underline">
                Already have an account? Login
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
