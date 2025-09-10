import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

export default function FindFoodPage() {
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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PlaceHolderImages.map((item) => (
            <Card key={item.id} className="flex flex-col overflow-hidden">
              <CardHeader className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src={item.imageUrl}
                    alt={item.description}
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
                <CardDescription className="mt-2 text-sm">
                  {item.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full">Request Item</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
