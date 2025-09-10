
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

interface Listing extends ImagePlaceholder {
  quantity: string;
  aiFreshness?: number;
  status: string;
}

// Function to generate a new shuffled list of dummy data
const generateDummyData = (): Listing[] => {
  // Shuffle the array to make the order random on each load
  const shuffled = [...PlaceHolderImages].sort(() => 0.5 - Math.random());
  
  return shuffled.map((item) => ({
    ...item,
    quantity: `${Math.floor(Math.random() * 50) + 10} servings`, // Random quantity
    aiFreshness: Math.floor(Math.random() * 15) + 85, // Random freshness between 85-99%
    status: 'open',
  }));
};


export default function FindFoodPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Use a timeout to simulate a network request
    setTimeout(() => {
      setListings(generateDummyData());
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredListings = listings.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

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
          <div className="flex w-full md:w-1/3 gap-2">
            <Input
              type="text"
              placeholder="Search food..."
              className="w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button>Post a Request</Button>
          </div>
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

        {!isLoading && filteredListings.length === 0 && (
          <Card className="p-8 text-center">
            <CardTitle>No Food Available Right Now</CardTitle>
            <CardDescription>
              {search ? `No results for "${search}".` : 'Please check back later for new donations.'}
            </CardDescription>
          </Card>
        )}

        {!isLoading && filteredListings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((item) => (
              <motion.div key={item.id} whileHover={{ y: -5 }} className="h-full">
                <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-xl">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full">
                      <Image
                        src={item.imageUrl || 'https://picsum.photos/seed/fallback/600/400'}
                        alt={item.title}
                        fill
                        className="object-cover"
                        data-ai-hint={item.imageHint}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://picsum.photos/seed/error/600/400'; }}
                      />
                       {item.aiFreshness && (
                         <motion.div
                            className="absolute right-3 top-3 w-14 h-14 bg-primary/80 backdrop-blur-sm border-2 border-primary-foreground/50 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
                         >
                           {item.aiFreshness}%
                         </motion.div>
                       )}
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
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
