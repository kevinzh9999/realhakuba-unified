'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Booking Confirmed!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Thank you for your reservation. We've sent a confirmation email with all the details.
        </p>
        {bookingId && (
          <p className="text-sm text-muted-foreground mb-8">
            Booking reference: <span className="font-mono">{bookingId}</span>
          </p>
        )}
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
          <Link href="/stays">
            <Button>View More Properties</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
