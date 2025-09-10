
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

// Define the shape of a listing document
interface Listing {
  id: string;
  title: string;
  description: string;
  quantity: string;
  imageUrl: string;
  imageHint: string;
  pickupAddress: string;
}

const generateDummyData = (): Listing[] => {
  const shuffled = [...PlaceHolderImages].sort(() => 0.5 - Math.random());
  const count = Math.floor(Math.random() * (shuffled.length - 2)) + 2; // Get 2 to all items
  return shuffled.slice(0, count).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description,
    quantity: `${Math.floor(Math.random() * 10) + 1} units`,
    imageUrl: item.imageUrl, // Use the direct URL from the JSON file
    imageHint: item.imageHint,
    pickupAddress: '123 Main St, Anytown, USA',
  }));
};

export default function FindFoodPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    // Simulate fetching data with a short delay
    const timer = setTimeout(() => {
      try {
        setListings(generateDummyData());
      } catch (err) {
        console.error("Error generating dummy data:", err);
        setError("Could not load available food. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms delay to show loading state

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-3xl font-bold tracking-tight">
              Available Food Donations
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
              Browse items available for pickup from generous donors in your community.
            </p>
          </div>
          <Button>Post a Request</Button>
        </div>

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="flex flex-col overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="flex-grow p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && error && (
          <Card className="p-8 text-center">
            <CardTitle className="text-destructive">An Error Occurred</CardTitle>
            <CardDescription>{error}</CardDescription>
          </Card>
        )}

        {!isLoading && !error && listings.length === 0 && (
          <Card className="p-8 text-center">
            <CardTitle>No Food Available Right Now</CardTitle>
            <CardDescription>Please check back later for new donations.</CardDescription>
          </Card>
        )}

        {!isLoading && !error && listings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((item) => (
              <Card key={item.id} className="flex flex-col overflow-hidden">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      data-ai-hint={item.imageHint}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow p-4">
                  <CardTitle className="font-headline text-xl capitalize">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm line-clamp-2">
                    {item.description}
                  </CardDescription>
                   <p className="text-sm font-semibold text-muted-foreground mt-2">
                    Quantity: {item.quantity}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full">Request Item</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
