import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link 
        href="/" 
        className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  );
}
