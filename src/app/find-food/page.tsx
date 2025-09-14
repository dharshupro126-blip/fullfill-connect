
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';

// The data is now imported directly, so we can use the ImagePlaceholder type
const listings: ImagePlaceholder[] = PlaceHolderImages;

// A new component to contain client-side-only logic
function FoodCard({ item, index }: { item: ImagePlaceholder; index: number }) {
  const [quantity, setQuantity] = useState(0);
  const [freshness, setFreshness] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Generate random values on the client-side to avoid hydration errors
    setQuantity(Math.floor(Math.random() * 20) + 5);
    setFreshness(Math.floor(Math.random() * 15) + 85);
  }, []);
  
  const handleRequestItem = () => {
    toast({
        title: "Request Sent!",
        description: `Your request for "${item.title}" has been sent to the donor.`,
        className: 'bg-primary text-primary-foreground',
    });
  };

  return (
    <motion.div key={item.id} whileHover={{ y: -5 }} className="h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-xl">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index < 4} // Add priority to the first 4 images
              data-ai-hint={item.imageHint}
            />
            {freshness > 0 && (
              <motion.div
                className="absolute right-3 top-3 w-14 h-14 bg-primary/80 backdrop-blur-sm border-2 border-primary-foreground/50 rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 120 }}
              >
                {freshness}%
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
            Quantity: {quantity > 0 ? `${quantity} servings` : 'Calculating...'}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button className="w-full" onClick={handleRequestItem}>Request Item</Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}


export default function FindFoodPage() {
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const filteredListings = listings.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );
  
  const handlePostRequest = () => {
    toast({
        title: "Request Posted!",
        description: "Volunteers and donors in your area have been notified of your request.",
    });
  }

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
            <Button onClick={handlePostRequest}>Post a Request</Button>
          </div>
        </div>

        {filteredListings.length === 0 && (
          <Card className="p-8 text-center">
            <CardTitle>No Food Available Right Now</CardTitle>
            <CardDescription>
              {search 
                ? `No results for "${search}".` 
                : 'Please check back later for new donations.'
              }
            </CardDescription>
          </Card>
        )}

        {filteredListings.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((item, index) => (
              <FoodCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
