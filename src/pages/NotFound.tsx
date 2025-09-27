import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Stethoscope, Syringe, Thermometer, Ambulance, Clock } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    setIsVisible(true);
  }, [location.pathname]);

  // Floating medical icons data
  const medicalIcons = [
    { icon: Heart, delay: 0, position: "top-10 left-10" },
    { icon: Stethoscope, delay: 200, position: "top-20 right-20" },
    { icon: Syringe, delay: 400, position: "bottom-20 left-20" },
    { icon: Thermometer, delay: 600, position: "bottom-10 right-10" },
    { icon: Ambulance, delay: 800, position: "top-1/3 left-1/4" },
    { icon: Clock, delay: 1000, position: "bottom-1/3 right-1/4" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-100 relative overflow-hidden">
      {/* Animated floating medical icons */}
      {medicalIcons.map((item, index) => (
        <div
          key={index}
          className={`absolute ${item.position} transition-all duration-1000 ${
            isVisible ? "opacity-30 scale-100" : "opacity-0 scale-50"
          }`}
          style={{ transitionDelay: `${item.delay}ms` }}
        >
          <item.icon className="w-8 h-8 text-blue-300 animate-float" />
        </div>
      ))}

      {/* Animated pulse dots */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-blue-200 rounded-full animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-cyan-200 rounded-full animate-pulse delay-300"></div>
      <div className="absolute top-1/2 right-1/3 w-4 h-4 bg-sky-200 rounded-full animate-pulse delay-700"></div>

      <Card className="w-full max-w-md mx-4 backdrop-blur-sm bg-white/90 border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          {/* Animated 404 number */}
          <div className={`relative mb-6 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            <div className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              404
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg blur opacity-20 animate-pulse"></div>
          </div>

          {/* Animated title */}
          <h1 className={`text-2xl font-bold text-gray-800 mb-3 transition-all duration-1000 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            Medical Page Not Found
          </h1>

          {/* Animated description */}
          <p className={`text-gray-600 mb-2 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            The hospital route you're looking for seems to be in recovery.
          </p>
          <p className={`text-gray-500 text-sm mb-6 transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            Our medical team is working to diagnose this issue.
          </p>

          {/* Animated button */}
          <div className={`transition-all duration-1000 delay-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}>
            <Button 
              onClick={() => window.location.href = "/"}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Heart className="w-4 h-4 mr-2" />
              Return to Medical Dashboard
            </Button>
          </div>

          {/* Emergency contact info */}
          <div className={`mt-6 p-3 bg-blue-50 rounded-lg transition-all duration-1000 delay-1200 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}>
            <p className="text-xs text-gray-600">
              For urgent medical assistance, contact Emergency: <strong>911</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* CSS for floating animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;