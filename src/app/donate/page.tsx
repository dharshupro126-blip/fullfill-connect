import { FoodDonationForm } from '@/components/custom/food-donation-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DonatePage() {
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
         <FoodDonationForm />
      </div>
    </div>
  );
}
