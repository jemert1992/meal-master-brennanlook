import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Icons
import { ArrowRight, Heart, ChefHat, ChevronRight, ShieldCheck, Utensils, BarChart } from 'lucide-react';

const features = [
  {
    icon: <Utensils className="h-5 w-5 text-purple-500" />,
    title: 'Smart Meal Planning',
    description: 'Personalized meal plans based on your preferences and goals'
  },
  {
    icon: <BarChart className="h-5 w-5 text-blue-500" />,
    title: 'Nutrition Tracking',
    description: 'Track your calories, macros, and overall nutrition journey'
  },
  {
    icon: <ChefHat className="h-5 w-5 text-green-500" />,
    title: 'Recipe Database',
    description: 'Access thousands of healthy, delicious recipes'
  },
  {
    icon: <Heart className="h-5 w-5 text-red-500" />,
    title: 'Health Analytics',
    description: 'Get insights and recommendations for your unique health needs'
  }
];

const LoginEnhanced = () => {
  const [, setLocation] = useLocation();
  
  const handleLogin = () => {
    // Redirect to the demo login endpoint
    window.location.href = '/api/login';
  };

  // Redirect if user navigates directly to /api/login
  useEffect(() => {
    // If we see the login-related strings in the URL, we're coming back from a login attempt
    // Redirect to main app
    if (window.location.href.includes('/api/login') || window.location.pathname === '/login' && window.location.search.includes('logged=true')) {
      window.location.href = '/';
    }
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Login | NutriPlan</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left side - Login */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-950">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-400 bg-clip-text text-transparent">
                NutriPlan
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Your personal nutrition assistant
              </p>
            </div>
            
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Welcome Back</CardTitle>
                <CardDescription>
                  Login to continue your nutrition journey
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-3">
                <Button 
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 mb-3"
                >
                  Log in with Demo Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="relative my-6">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-950 px-2 text-xs text-gray-500 dark:text-gray-400">
                    New to NutriPlan?
                  </span>
                </div>
                
                <Button 
                  onClick={() => window.location.href = '/api/new-user'}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-400 hover:from-green-600 hover:to-teal-500"
                >
                  Create New Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                  <p>After logging in, you'll complete a quick personal profile to customize your experience</p>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <div className="flex items-center justify-center w-full space-x-2 text-xs text-gray-500">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Safe & Secure Login</span>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
        
        {/* Right side - Features */}
        <div className="flex-1 bg-gradient-to-br from-purple-600/90 to-blue-500/90 text-white p-8 flex items-center justify-center">
          <div className="max-w-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="text-2xl font-bold mb-6">Start Your Nutrition Journey Today</h2>
              
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="flex items-start space-x-3 bg-white/10 rounded-lg p-4 backdrop-blur-sm"
                  >
                    <div className="bg-white rounded-full p-2">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{feature.title}</h3>
                      <p className="text-sm text-white/80 mt-1">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="flex-1">
                    <h3 className="font-medium">Ready to get started?</h3>
                    <p className="text-sm text-white/80 mt-1">
                      Login now and take the first step toward better nutrition
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="text-white border-white hover:bg-white/20"
                    onClick={handleLogin}
                  >
                    Login
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginEnhanced;