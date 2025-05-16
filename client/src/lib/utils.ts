import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function getDaysOfWeek(): string[] {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
}

export function getMealTypes(): string[] {
  return ['breakfast', 'lunch', 'dinner', 'snack'];
}

export function getMealTypeColor(mealType: string): { bg: string, text: string, border: string, darkBg: string, darkBorder: string, darkText: string } {
  switch (mealType.toLowerCase()) {
    case 'breakfast':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        darkBg: 'dark:bg-blue-900/20',
        darkBorder: 'dark:border-blue-800',
        darkText: 'dark:text-blue-400'
      };
    case 'lunch':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        darkBg: 'dark:bg-green-900/20',
        darkBorder: 'dark:border-green-800',
        darkText: 'dark:text-green-400'
      };
    case 'dinner':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        darkBg: 'dark:bg-purple-900/20',
        darkBorder: 'dark:border-purple-800',
        darkText: 'dark:text-purple-400'
      };
    case 'snack':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        darkBg: 'dark:bg-amber-900/20',
        darkBorder: 'dark:border-amber-800',
        darkText: 'dark:text-amber-400'
      };
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        darkBg: 'dark:bg-gray-800/20',
        darkBorder: 'dark:border-gray-700',
        darkText: 'dark:text-gray-400'
      };
  }
}

export function getGroceryCategories(): string[] {
  return ['produce', 'proteins', 'dairy', 'pantry', 'frozen', 'beverages', 'other'];
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function calculateTotalNutrition(items: { calories?: number | null, protein?: number | null, carbs?: number | null, fat?: number | null }[]) {
  return items.reduce((totals, item) => {
    return {
      calories: (totals.calories || 0) + (item.calories || 0),
      protein: (totals.protein || 0) + (item.protein || 0),
      carbs: (totals.carbs || 0) + (item.carbs || 0),
      fat: (totals.fat || 0) + (item.fat || 0)
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

export function getWeekDates(weekOffset = 0): { date: Date, dayName: string, dayOfMonth: number }[] {
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Adjust to start from Monday
  const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
  
  // Get the Monday of the current week
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday + (weekOffset * 7));
  
  const weekDays = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    weekDays.push({
      date,
      dayName: dayNames[i],
      dayOfMonth: date.getDate()
    });
  }
  
  return weekDays;
}

export function getTimeOfDay(): string {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return "morning";
  } else if (hour >= 12 && hour < 17) {
    return "afternoon";
  } else if (hour >= 17 && hour < 22) {
    return "evening";
  } else {
    return "night";
  }
}
