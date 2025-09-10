import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartHandshake, Home as HomeIcon, Truck } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center gap-4">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Welcome to FullFill Connect
        </h1>
      </div>
      <p className="max-w-3xl text-lg text-muted-foreground">
        Your central hub for connecting surplus food with communities in need.
        Together, we can fight hunger and reduce food waste.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meals Donated</CardTitle>
            <HeartHandshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,503</div>
            <p className="text-xs text-muted-foreground">
              +15.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Communities Served
            </CardTitle>
            <HomeIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              +8.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Volunteers Active
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">214</div>
            <p className="text-xs text-muted-foreground">
              +22 new volunteers this month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="font-headline">Have food to share?</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-muted-foreground">
              List your available surplus food items and connect with local
              organizations that can distribute them to those in need. Your
              donation can make a huge difference.
            </p>
          </CardContent>
          <div className="p-6 pt-0">
            <Link href="/donate" passHref>
              <Button className="w-full md:w-auto">Donate Food</Button>
            </Link>
          </div>
        </Card>
        <Card className="flex flex-col bg-secondary">
          <CardHeader>
            <CardTitle className="font-headline">
              Looking for food assistance?
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <p className="text-secondary-foreground/80">
              Browse available food donations in your area or post a request for
              specific needs. We are here to help connect you with the resources
              you need.
            </p>
          </CardContent>
          <div className="p-6 pt-0">
            <Link href="/find-food" passHref>
              <Button variant="outline" className="w-full bg-background md:w-auto">
                Find Food
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
