import { Link, useLocation } from "wouter";

export default function Footer() {
  const [location] = useLocation();
  
  // Don't show footer on the Health Bot page to avoid overlap issues
  if (location === '/health-bot') {
    return (
      <footer className="bg-transparent py-2 text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="container mx-auto px-4">
          © {new Date().getFullYear()} NutriPlan
        </div>
      </footer>
    );
  }
  
  return (
    <footer className="bg-white border-t border-gray-200 py-4 dark:bg-dark-bg dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="text-md font-bold text-gray-800 dark:text-white">
                NutriPlan
              </span>
            </div>
          </div>

          <div className="flex space-x-6 text-sm">
            <Link href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
              About
            </Link>
            <Link href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
              Privacy
            </Link>
            <Link href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
              Terms
            </Link>
            <Link href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
