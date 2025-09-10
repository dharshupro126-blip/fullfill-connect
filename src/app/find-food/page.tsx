'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { firebaseApp } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

// Define the shape of a listing document
interface Listing {
  id: string;
  title: string;
  description: string;
  quantity: string;
  imageUrls: string[];
  pickupAddress: string;
}

export default function FindFoodPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const db = getFirestore(firebaseApp);
        const listingsRef = collection(db, 'listings');
        // Query for listings that are currently available
        const q = query(listingsRef, where('status', '==', 'available'));
        const querySnapshot = await getDocs(q);
        
        const listingsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Listing));
        
        setListings(listingsData);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError("Could not load available food. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            Available Food Donations
          </h1>
          <Button>Post a Request</Button>
        </div>
        <p className="text-lg text-muted-foreground">
          Browse items available for pickup from generous donors in your community.
        </p>

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
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
                      src={item.imageUrls[0] || "https://picsum.photos/seed/placeholder/600/400"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow p-4">
                  <CardTitle className="font-headline text-xl capitalize">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm">
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
