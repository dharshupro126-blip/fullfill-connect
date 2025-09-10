'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Sparkles, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getFoodFreshnessAnalysis } from '@/app/actions';
import type { FoodFreshnessOutput } from '@/ai/flows/food-freshness-analysis';

const formSchema = z.object({
  foodName: z.string().min(3, 'Food name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  quantity: z.string().min(1, 'Please enter a quantity.'),
});

type FormValues = z.infer<typeof formSchema>;

export function FoodDonationForm() {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [foodPhotoDataUri, setFoodPhotoDataUri] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<FoodFreshnessOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });
  
  const foodDescriptionForAI = watch('description');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: 'destructive',
          title: 'Image too large',
          description: 'Please upload an image smaller than 4MB.',
        });
        return;
      }

      setAnalysisResult(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setImagePreview(URL.createObjectURL(file));
        setFoodPhotoDataUri(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAnalyze = async () => {
    if (!foodPhotoDataUri || !foodDescriptionForAI) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please provide a food description and upload a photo before analyzing.',
      });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await getFoodFreshnessAnalysis({
        foodPhotoDataUri,
        foodDescription: foodDescriptionForAI
      });
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult({
        freshnessAssessment: 'Failed to analyze image. Please try again.',
        disclaimerNeeded: true
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data);
    toast({
      title: 'Donation Listed!',
      description: 'Thank you for your contribution to the community.',
      className: 'bg-primary text-primary-foreground',
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <Label htmlFor="foodName">Food Name</Label>
          <Input id="foodName" {...register('foodName')} />
          {errors.foodName && <p className="text-sm text-destructive">{errors.foodName.message}</p>}
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register('description')} placeholder="e.g., Unopened loaf of whole wheat bread, best by..." />
          {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" {...register('quantity')} placeholder="e.g., 2 loaves, 1 case" />
          {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
        </div>
         <Button type="submit" className="w-full">List Donation</Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-lg">AI Freshness Check</CardTitle>
            <CardDescription>Upload a photo for an AI-powered freshness assessment.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="food-image">Food Photo</Label>
              <Input id="food-image" type="file" accept="image/*" onChange={handleFileChange} className="file:text-primary-foreground" />
            </div>
            {imagePreview && (
              <div className="relative mt-4 h-48 w-full">
                <Image src={imagePreview} alt="Food preview" layout="fill" objectFit="cover" className="rounded-md" />
              </div>
            )}
            <Button type="button" onClick={handleAnalyze} disabled={!imagePreview || isAnalyzing} className="w-full">
              {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {isAnalyzing ? 'Analyzing...' : 'Check Freshness'}
            </Button>
            
            {analysisResult && (
              <Alert variant={analysisResult.disclaimerNeeded ? 'default' : 'default'} className={analysisResult.disclaimerNeeded ? "bg-accent/30" : "bg-primary/10"}>
                {analysisResult.disclaimerNeeded ? <AlertCircle className="h-4 w-4" /> : <Info className="h-4 w-4 text-primary" />}
                <AlertTitle className="font-bold">AI Assessment</AlertTitle>
                <AlertDescription>
                  <p>{analysisResult.freshnessAssessment}</p>
                  {analysisResult.disclaimerNeeded && (
                    <p className="mt-2 text-xs italic">
                      Disclaimer: This AI analysis is for informational purposes only and is not a substitute for a thorough visual and olfactory inspection.
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
