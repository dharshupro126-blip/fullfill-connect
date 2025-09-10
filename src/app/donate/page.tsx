import { FoodDonationForm } from '@/components/custom/food-donation-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DonatePage() {
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              List a New Food Donation
            </CardTitle>
            <CardDescription>
              Fill out the details below to make your surplus food available.
              Use the AI Freshness Check to get an assessment of your item.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FoodDonationForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
