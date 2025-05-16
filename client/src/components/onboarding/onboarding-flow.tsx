import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { motion, AnimatePresence } from 'framer-motion';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// Icons
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Heart,
  Trophy,
  User,
  Calendar,
  Apple,
  AlertCircle,
  Utensils,
  Dumbbell,
  Scale,
  AlertTriangle
} from 'lucide-react';

// Form Schema
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Onboarding schema
const onboardingSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  birthdate: z.string().optional(),
  gender: z.string().optional(),
  
  // Body Metrics
  height: z.string().optional(),
  weight: z.string().optional(),
  targetWeight: z.string().optional(),
  
  // Health Goals
  goals: z.array(z.string()).default([]),
  activityLevel: z.string().optional(),
  
  // Dietary Preferences
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  
  // Meal Preferences
  mealFrequency: z.string().default('3'),
  snacksPerDay: z.string().default('1'),
  calorieGoal: z.string().optional(),
});

// Steps in the onboarding process
const steps = [
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Tell us a bit about yourself',
    icon: <User className="h-5 w-5" />,
  },
  {
    id: 'metrics',
    title: 'Body Metrics',
    description: 'Your current body measurements',
    icon: <Scale className="h-5 w-5" />,
  },
  {
    id: 'goals',
    title: 'Health Goals',
    description: 'What are you looking to achieve?',
    icon: <Trophy className="h-5 w-5" />,
  },
  {
    id: 'dietary',
    title: 'Dietary Preferences',
    description: 'Any restrictions or allergies',
    icon: <AlertCircle className="h-5 w-5" />,
  },
  {
    id: 'meals',
    title: 'Meal Preferences',
    description: 'Your eating patterns',
    icon: <Utensils className="h-5 w-5" />,
  },
];

type OnboardingFlowProps = {
  userId: string;
  onComplete: () => void;
};

const OnboardingFlow = ({ userId, onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  // Form setup
  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      goals: [],
      dietaryRestrictions: [],
      allergies: [],
      mealFrequency: '3',
      snacksPerDay: '1',
    },
  });
  
  // Mutation for saving user profile
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('POST', '/api/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
    },
  });
  
  // Mutation for saving user preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest('POST', '/api/preferences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/preferences'] });
      
      toast({
        title: 'Welcome to NutriPlan!',
        description: 'Your preferences have been saved. Let\'s start your nutrition journey!',
      });
      
      onComplete();
    },
  });
  
  // Query existing user data
  const { data: userProfile } = useQuery({
    queryKey: ['/api/profile'],
    retry: false,
  });
  
  // Pre-fill form with existing data if available
  useEffect(() => {
    if (userProfile) {
      form.setValue('firstName', userProfile.firstName || '');
      form.setValue('lastName', userProfile.lastName || '');
      form.setValue('email', userProfile.email || '');
    }
  }, [userProfile, form]);
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof onboardingSchema>) => {
    // If we're not on the last step, go to the next step
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    
    // Otherwise, save all the data
    const profileData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      birthdate: data.birthdate,
      gender: data.gender,
      height: data.height,
      weight: data.weight,
      targetWeight: data.targetWeight,
      calorieGoal: data.calorieGoal ? parseInt(data.calorieGoal) : 2000,
    };
    
    // Format preferences data according to the schema
    const preferencesData = {
      // userId is set on the server from the authenticated user
      // Convert goals array to string (database expects a single string value)
      goals: Array.isArray(data.goals) ? data.goals[0] : data.goals,
      activityLevel: data.activityLevel,
      // Format dietary restrictions as expected (object with boolean values)
      dietaryRestrictions: Array.isArray(data.dietaryRestrictions) 
        ? data.dietaryRestrictions.reduce((obj, key) => ({...obj, [key]: true}), {}) 
        : {},
      mealFrequency: parseInt(data.mealFrequency || "3"),
      snacksPerDay: parseInt(data.snacksPerDay || "1"),
      // Convert allergies to text format if needed
      allergies: Array.isArray(data.allergies) 
        ? data.allergies.join(',') 
        : (data.allergies || ''),
    };
    
    // Save profile data first, then preferences
    updateProfileMutation.mutate(profileData, {
      onSuccess: () => {
        updatePreferencesMutation.mutate(preferencesData, {
          onSuccess: () => {
            toast({
              title: 'Success',
              description: 'Your profile has been set up successfully!',
            });
            // Call the onComplete callback to notify parent component
            onComplete();
            // No need to redirect, parent component will handle this
          },
          onError: (error) => {
            console.error('Preferences error:', error);
            toast({
              title: 'Error',
              description: 'Failed to save your preferences. Please try again.',
              variant: 'destructive',
            });
          }
        });
      },
      onError: (error) => {
        console.error('Profile error:', error);
        toast({
          title: 'Error',
          description: 'Failed to save your profile. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };
  
  // Navigation between steps
  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  // Calculate progress
  const progress = ((step + 1) / steps.length) * 100;
  
  // Helper for field validation
  const fieldHasError = (fieldName: string) => {
    return !!form.formState.errors[fieldName as keyof z.infer<typeof onboardingSchema>];
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-3xl">
        <Card className="w-full shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-purple-600 to-blue-400 w-8 h-8 rounded-full flex items-center justify-center text-white">
                  {steps[step].icon}
                </div>
                <div>
                  <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-blue-400 bg-clip-text text-transparent">
                    {steps[step].title}
                  </CardTitle>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Step {step + 1} of {steps.length}
              </div>
            </div>
            <Progress value={progress} className="h-1" />
            <CardDescription className="pt-2">
              {steps[step].description}
            </CardDescription>
          </CardHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="py-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Step 1: Personal Information */}
                    {step === 0 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john.doe@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="birthdate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Birthdate</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Step 2: Body Metrics */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="height"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Height (cm)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="175" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="weight"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Weight (kg)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="70" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="targetWeight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Weight (kg)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="65" {...field} />
                              </FormControl>
                              <FormDescription>
                                This helps us calculate your ideal calorie intake
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {/* Step 3: Health Goals */}
                    {step === 2 && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="goals"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel>What are your health goals?</FormLabel>
                                <FormDescription>
                                  Select all that apply
                                </FormDescription>
                              </div>
                              <div className="space-y-2">
                                {['Weight Loss', 'Muscle Gain', 'Maintenance', 'Better Energy', 'Improve Health'].map((goal) => (
                                  <FormField
                                    key={goal}
                                    control={form.control}
                                    name="goals"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={goal}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(goal)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, goal])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== goal
                                                      )
                                                    )
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal">
                                            {goal}
                                          </FormLabel>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="activityLevel"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Activity Level</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="sedentary" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Sedentary (little or no exercise)
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="light" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Light (exercise 1-3 days/week)
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="moderate" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Moderate (exercise 3-5 days/week)
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="active" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Active (exercise 6-7 days/week)
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="very-active" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Very Active (intense exercise daily or physical job)
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {/* Step 4: Dietary Preferences */}
                    {step === 3 && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="dietaryRestrictions"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel>Dietary Restrictions</FormLabel>
                                <FormDescription>
                                  Select all that apply
                                </FormDescription>
                              </div>
                              <div className="space-y-2">
                                {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Low Carb', 'Kosher', 'Halal'].map((diet) => (
                                  <FormField
                                    key={diet}
                                    control={form.control}
                                    name="dietaryRestrictions"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={diet}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(diet)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, diet])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== diet
                                                      )
                                                    )
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal">
                                            {diet}
                                          </FormLabel>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="allergies"
                          render={() => (
                            <FormItem>
                              <div className="mb-4">
                                <FormLabel>Food Allergies or Sensitivities</FormLabel>
                                <FormDescription>
                                  Select all that apply
                                </FormDescription>
                              </div>
                              <div className="space-y-2">
                                {['Nuts', 'Peanuts', 'Dairy', 'Eggs', 'Fish', 'Shellfish', 'Soy', 'Wheat', 'Gluten'].map((allergy) => (
                                  <FormField
                                    key={allergy}
                                    control={form.control}
                                    name="allergies"
                                    render={({ field }) => {
                                      return (
                                        <FormItem
                                          key={allergy}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(allergy)}
                                              onCheckedChange={(checked) => {
                                                return checked
                                                  ? field.onChange([...field.value, allergy])
                                                  : field.onChange(
                                                      field.value?.filter(
                                                        (value) => value !== allergy
                                                      )
                                                    )
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="font-normal">
                                            {allergy}
                                          </FormLabel>
                                        </FormItem>
                                      )
                                    }}
                                  />
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {/* Step 5: Meal Preferences */}
                    {step === 4 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="mealFrequency"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Meals per Day</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="6">6</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="snacksPerDay"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Snacks per Day</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="0">0</SelectItem>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="calorieGoal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Daily Calorie Goal</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="2000" {...field} />
                              </FormControl>
                              <FormDescription>
                                Based on your metrics, we recommend 1800-2200 calories per day
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
                          <div className="flex items-start">
                            <div className="mr-3 mt-0.5">
                              <AlertCircle className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300">Almost done!</h4>
                              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                                After completing this form, we'll create your personalized meal plans and nutrition recommendations.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                {step === steps.length - 1 ? (
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                    disabled={updateProfileMutation.isPending || updatePreferencesMutation.isPending}
                  >
                    {(updateProfileMutation.isPending || updatePreferencesMutation.isPending) ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Complete
                        <Check className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={nextStep}
                    className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingFlow;