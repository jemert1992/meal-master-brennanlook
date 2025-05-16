import { Link } from "wouter";

export default function Debug() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Debug Page</h1>
        <div className="space-y-4">
          <p className="text-center mb-4">This is a debug page to test navigation.</p>
          
          <div className="grid grid-cols-1 gap-4">
            <Link href="/">
              <a className="text-center block w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Home
              </a>
            </Link>
            
            <Link href="/login">
              <a className="text-center block w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Login Page
              </a>
            </Link>
            
            <a 
              href="/api/demo-login"
              className="text-center block w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Demo Login
            </a>
            
            <a 
              href="/api/login"
              className="text-center block w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              API Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}