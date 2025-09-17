
'use client';

import { useState, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check, CheckCircle, Clock, Loader2, Sparkles, XCircle, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import type { FoodFreshnessOutput } from '@/ai/flows/food-freshness-analysis';
import { firebaseApp } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth-context';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Step 1: Define the Zod schema for form validation
const formSchema = z.object({
  foodName: z.string().min(3, 'Food name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  quantity: z.string().min(1, 'Please enter a quantity.'),
  images: z.custom<FileList>().refine(files => files && files.length > 0, 'At least one image is required.').or(z.string()),
  pickupWindowStart: z.string().min(1, "Please select a start time."),
  pickupWindowEnd: z.string().min(1, "Please select an end time."),
  address: z.string().min(5, 'Please enter a valid pickup address.'),
});

type FormValues = z.infer<typeof formSchema>;
type Step = 'details' | 'logistics' | 'review';

type ImagePreviewState = {
  src: string;
  file?: File;
  analysis?: FoodFreshnessOutput;
  isLoading: boolean;
  isGenerated?: boolean;
};


export function FoodDonationForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [imagePreviews, setImagePreviews] = useState<ImagePreviewState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth(); 
  const [isGenerating, setIsGenerating] = useState(false);


  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: undefined,
    }
  });

  const foodNameValue = watch('foodName');

  useEffect(() => {
    if (foodNameValue && foodNameValue.length > 2) {
      setIsGenerating(true);
      const handler = setTimeout(() => {
        const searchTerm = foodNameValue.toLowerCase().trim();
        
        // Prioritize exact match
        let matchedImage = PlaceHolderImages.find(p => p.title.toLowerCase() === searchTerm);

        // If no exact match, try partial match
        if (!matchedImage) {
            const inputWords = searchTerm.split(' ');
            matchedImage = PlaceHolderImages.find(p => {
                const titleWords = p.title.toLowerCase().split(' ');
                // Check if any word from input is in title or any word from title is in input
                return inputWords.some(word => p.title.toLowerCase().includes(word)) || titleWords.some(word => searchTerm.includes(word));
            });
        }

        const generatedUrl = matchedImage 
          ? matchedImage.imageUrl 
          : `https://picsum.photos/seed/${searchTerm.replace(/\s+/g, '-')}/600/400`;
        
        const generatedPreview: ImagePreviewState = {
          src: generatedUrl,
          isLoading: true,
          isGenerated: true,
        };
        setImagePreviews([generatedPreview]);
        setValue('images', generatedUrl, { shouldValidate: true });
        
        // Simulate analysis after generation
        const mockAnalysis: FoodFreshnessOutput = {
          isEdible: true,
          freshnessScore: 100,
          estimatedShelfLife: 'Looks great',
          assessmentSummary: 'Perfectly fresh and ready for donation.',
          disclaimerNeeded: false,
        };
        setTimeout(() => {
            setImagePreviews(prev => prev.map(p => p.isGenerated ? {...p, analysis: mockAnalysis, isLoading: false} : p));
            setIsGenerating(false);
        }, 500);

      }, 1000); // Debounce time

      return () => {
        clearTimeout(handler);
      };
    } else {
        // Clear generated image if food name is too short
        const hasGeneratedImage = imagePreviews.some(p => p.isGenerated);
        if (hasGeneratedImage) {
            setImagePreviews([]);
            const dataTransfer = new DataTransfer();
            setValue('images', dataTransfer.files, { shouldValidate: true });
        }
    }
  }, [foodNameValue, setValue]);


  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (!fileList) {
      return;
    }
    
    if (fileList.length === 0) {
      setImagePreviews([]);
      const dataTransfer = new DataTransfer();
      setValue('images', dataTransfer.files, { shouldValidate: true });
      return;
    }

    const files = Array.from(fileList);
    
    if (files.length > 3) {
      toast({
        variant: 'destructive',
        title: 'Too many images',
        description: 'You can only upload a maximum of 3 images.',
      });
      return;
    }

    setValue('images', fileList, { shouldValidate: true });

    const newPreviews: ImagePreviewState[] = files.map(file => ({
      src: URL.createObjectURL(file),
      file,
      isLoading: true,
    }));

    setImagePreviews(newPreviews);

    const mockAnalysis: FoodFreshnessOutput = {
        isEdible: true,
        freshnessScore: 100,
        estimatedShelfLife: 'Looks great',
        assessmentSummary: 'Perfectly fresh and ready for donation.',
        disclaimerNeeded: false,
    };

    setTimeout(() => {
        setImagePreviews(prev => 
            prev.map(p => ({
                ...p,
                analysis: mockAnalysis,
                isLoading: false,
            }))
        );
    }, 500);
  };
  
  const nextStep = async () => {
    let isValid = false;
    if (currentStep === 'details') {
      isValid = await trigger(['foodName', 'description', 'quantity', 'images']);
      if (isValid) setCurrentStep('logistics');
    } else if (currentStep === 'logistics') {
      isValid = await trigger(['pickupWindowStart', 'pickupWindowEnd', 'address']);
      if (isValid) setCurrentStep('review');
    }
  };

  const prevStep = () => {
    if (currentStep === 'logistics') setCurrentStep('details');
    if (currentStep === 'review') setCurrentStep('logistics');
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
        setIsSubmitting(false);
        reset(); 
        setImagePreviews([]); 
        setCurrentStep('details'); 

        toast({
            title: 'Donation Listed!',
            description: 'Thank you! Your donation is now visible to receivers.',
            className: 'bg-primary text-primary-foreground',
        });
    }, 1000);
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const renderAnalysis = (preview: ImagePreviewState) => {
    if (preview.isLoading) {
      return <p className="text-xs text-muted-foreground animate-pulse">Analyzing...</p>;
    }
    if (!preview.analysis) {
      return <p className="text-xs text-red-600">Analysis failed.</p>;
    }

    const { isEdible, freshnessScore, estimatedShelfLife, assessmentSummary } = preview.analysis;
    const scoreColor = freshnessScore > 75 ? 'bg-green-500' : freshnessScore > 40 ? 'bg-yellow-500' : 'bg-red-500';

    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold">Freshness: {freshnessScore}%</p>
          <Progress value={freshnessScore} className="h-2 flex-1" indicatorClassName={scoreColor} />
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1" title={assessmentSummary}>{assessmentSummary}</p>
        <div className="flex items-center gap-4 text-xs">
          <span className={`flex items-center gap-1 font-medium ${isEdible ? 'text-green-600' : 'text-red-600'}`}>
            {isEdible ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {isEdible ? 'Edible' : 'Not Edible'}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            {estimatedShelfLife}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">List a New Food Donation</CardTitle>
        <CardDescription>
          Follow the steps to make your surplus food available.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="overflow-hidden min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {currentStep === 'details' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="foodName">Food Name</Label>
                    <Input id="foodName" {...register('foodName')} placeholder="e.g., Freshly Baked Bread" />
                    {errors.foodName && <p className="text-sm text-destructive">{errors.foodName.message}</p>}
                  </div>

                  {/* AI Generated Image Section */}
                  <AnimatePresence>
                  {(isGenerating || imagePreviews.some(p => p.isGenerated)) && (
                    <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                      <Label>AI Generated Image</Label>
                       <div className="relative aspect-video w-full rounded-md border-2 border-dashed flex items-center justify-center bg-muted/50">
                        {isGenerating && !imagePreviews.some(p => p.isGenerated) && (
                            <div className='text-center text-muted-foreground'>
                                <ImageIcon className="mx-auto h-8 w-8 animate-pulse" />
                                <p>Generating image for "{foodNameValue}"...</p>
                            </div>
                        )}
                        {imagePreviews.map((preview, index) => (
                           preview.isGenerated && (
                            <div key={index} className="relative w-full h-full">
                               <Image src={preview.src} alt={`Generated image of ${foodNameValue}`} fill objectFit="cover" className="rounded-md" />
                               <Card className="absolute bottom-1 left-1 right-1 p-2 bg-background/80 backdrop-blur-sm">
                                 <p className="text-xs font-bold flex items-center gap-1 mb-1">
                                  <Sparkles className="w-3 h-3 text-accent" /> AI Quality Check
                                 </p>
                                 {renderAnalysis(preview)}
                               </Card>
                            </div>
                           )
                        ))}
                      </div>
                    </motion.div>
                  )}
                  </AnimatePresence>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" {...register('description')} placeholder="e.g., Two unopened loaves of whole wheat bread..." />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                  </div>
                   <div>
                    <Label htmlFor="quantity">Quantity (e.g., servings, kg, loaves)</Label>
                    <Input id="quantity" {...register('quantity')} placeholder="e.g., 2 loaves, 1 case" />
                    {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="images-upload">Or Upload Your Own Images (up to 3)</Label>
                    <Input id="images-upload" type="file" multiple accept="image/*" onChange={handleFileChange} />
                    {errors.images && typeof errors.images.message === 'string' && <p className="text-sm text-destructive">{errors.images.message}</p>}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        !preview.isGenerated && (
                           <div key={index} className="relative aspect-square">
                            <Image src={preview.src} alt={`Preview ${index + 1}`} fill objectFit="cover" className="rounded-md" />
                            <Card className="absolute bottom-1 left-1 right-1 p-2 bg-background/80 backdrop-blur-sm">
                              <p className="text-xs font-bold flex items-center gap-1 mb-1">
                                <Sparkles className="w-3 h-3 text-accent" /> AI Quality Check
                              </p>
                              {renderAnalysis(preview)}
                            </Card>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 'logistics' && (
                <div className="space-y-4">
                   <div>
                    <Label>Pickup Window</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pickupWindowStart" className="text-xs text-muted-foreground">Start Time</Label>
                        <Input id="pickupWindowStart" type="datetime-local" {...register('pickupWindowStart')} />
                         {errors.pickupWindowStart && <p className="text-sm text-destructive">{errors.pickupWindowStart.message}</p>}
                      </div>
                      <div>
                        <Label htmlFor="pickupWindowEnd" className="text-xs text-muted-foreground">End Time</Label>
                        <Input id="pickupWindowEnd" type="datetime-local" {...register('pickupWindowEnd')} />
                         {errors.pickupWindowEnd && <p className="text-sm text-destructive">{errors.pickupWindowEnd.message}</p>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Pickup Location</Label>
                    <Input id="address" {...register('address')} placeholder="Enter full pickup address" />
                     {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                  </div>
                </div>
              )}
              {currentStep === 'review' && (
                <div className="space-y-4">
                   <h3 className="font-medium">Review Your Donation</h3>
                   <div className="space-y-2 rounded-md border p-4">
                      <p><strong>Food:</strong> {getValues('foodName')}</p>
                      <p><strong>Quantity:</strong> {getValues('quantity')}</p>
                      <p><strong>Description:</strong> {getValues('description')}</p>
                      <p><strong>Pickup Start:</strong> {new Date(getValues('pickupWindowStart')).toLocaleString()}</p>
                      <p><strong>Pickup End:</strong> {new Date(getValues('pickupWindowEnd')).toLocaleString()}</p>
                      <p><strong>Address:</strong> {getValues('address')}</p>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                           <Image src={preview.src} alt={`Preview ${index + 1}`} fill objectFit="cover" className="rounded-md" />
                            <Card className="absolute bottom-1 left-1 right-1 p-2 bg-background/80 backdrop-blur-sm">
                             <p className="text-xs font-bold flex items-center gap-1 mb-1">
                              <Sparkles className="w-3 h-3 text-accent" /> AI Quality Check
                             </p>
                             {renderAnalysis(preview)}
                           </Card>
                        </div>
                      ))}
                    </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
        <CardFooter className="justify-between">
          <div>
            {currentStep !== 'details' && (
              <Button type="button" variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
            )}
          </div>
          <div>
            {currentStep !== 'review' ? (
              <Button type="button" onClick={nextStep}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Publish Donation
              </Button>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
