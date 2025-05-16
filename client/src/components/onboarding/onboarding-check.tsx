import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import OnboardingFlow from './onboarding-flow';
import { queryClient } from '@/lib/queryClient';

/**
 * OnboardingCheck - A component that checks if a user needs to complete the onboarding flow
 * If the user is new or doesn't have preferences set up, it shows the OnboardingFlow
 * Otherwise, it renders the children components
 */
const OnboardingCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Query user preferences
  const { 
    data: userPreferences, 
    isLoading: isLoadingPreferences 
  } = useQuery({
    queryKey: ['/api/preferences'],
    // Only fetch if user is authenticated
    enabled: !!user,
  });
  
  // Check if onboarding is needed
  useEffect(() => {
    if (!isLoadingAuth && !isLoadingPreferences && user) {
      // Log preferences data for debugging
      console.log("Checking preferences:", userPreferences);
      
      // Check if preferences exist or if required fields are missing
      const needsOnboarding = !userPreferences || 
                             !userPreferences.id || 
                             !userPreferences.activityLevel || 
                             !userPreferences.goals;
      
      console.log("Needs onboarding:", needsOnboarding);
      setShowOnboarding(needsOnboarding);
    }
  }, [user, userPreferences, isLoadingAuth, isLoadingPreferences]);
  
  // Handle onboarding completion
  const handleOnboardingComplete = () => {
    console.log("Onboarding complete, redirecting to main app");
    // Force a preferences refetch to ensure we have the latest data
    queryClient.invalidateQueries({ queryKey: ['/api/preferences'] });
    // Hide the onboarding flow
    setShowOnboarding(false);
  };
  
  // Show loading state while checking
  if (isLoadingAuth || isLoadingPreferences) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-10 w-10 border-4 border-purple-500 rounded-full border-t-transparent"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, just render children
  if (!user) {
    return <>{children}</>;
  }
  
  // If onboarding is needed, show the onboarding flow
  if (showOnboarding) {
    return <OnboardingFlow userId={user.id} onComplete={handleOnboardingComplete} />;
  }
  
  // Otherwise, render the children
  return <>{children}</>;
};

export default OnboardingCheck;