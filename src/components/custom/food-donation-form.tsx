
'use client';

import { useState } from 'react';
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
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { getFoodFreshnessAnalysis } from '@/app/actions';
import type { FoodFreshnessOutput } from '@/ai/flows/food-freshness-analysis';
import { getFirestore, collection, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseApp } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth'; // A placeholder for a real auth hook

// Step 1: Define the Zod schema for form validation
const formSchema = z.object({
  foodName: z.string().min(3, 'Food name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  quantity: z.string().min(1, 'Please enter a quantity.'),
  images: z.custom<FileList>().refine(files => files && files.length > 0, 'At least one image is required.'),
  pickupWindowStart: z.string().min(1, "Please select a start time."),
  pickupWindowEnd: z.string().min(1, "Please select an end time."),
  address: z.string().min(5, 'Please enter a valid pickup address.'),
});

type FormValues = z.infer<typeof formSchema>;
type Step = 'details' | 'logistics' | 'review';

type ImagePreviewState = {
  src: string;
  file: File;
  analysis?: FoodFreshnessOutput;
  isLoading: boolean;
};


export function FoodDonationForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('details');
  const [imagePreviews, setImagePreviews] = useState<ImagePreviewState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // In a real app, you'd get the user from a proper auth context
  const { user } = useAuth(); 

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: undefined,
    }
  });

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;

    if (!fileList) {
      return;
    }
    
    // Check if files were selected
    if (fileList.length === 0) {
      // Clear images if no files are selected or selection is cancelled
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

    setImagePreviews(newPreviews); // Replace instead of append to enforce max

    // Trigger AI analysis for each new image
    newPreviews.forEach(async (preview) => {
      const dataUri = await fileToDataUri(preview.file);
      const foodDescription = getValues('description') || getValues('foodName') || 'food item';
      
      try {
        const result = await getFoodFreshnessAnalysis({
          foodPhotoDataUri: dataUri,
          foodDescription,
        });

        setImagePreviews(prev => {
            const updated = [...prev];
            const targetIndex = prev.findIndex(p => p.src === preview.src);
            if (targetIndex !== -1) {
              updated[targetIndex] = { ...updated[targetIndex], analysis: result, isLoading: false };
            }
            return updated;
        });

      } catch (error) {
        console.error("AI Analysis failed:", error);
         setImagePreviews(prev => {
            const updated = [...prev];
            const targetIndex = prev.findIndex(p => p.src === preview.src);
            if (targetIndex !== -1) {
              updated[targetIndex] = { 
                ...updated[targetIndex], 
                analysis: { freshnessAssessment: 'Analysis failed', disclaimerNeeded: true },
                isLoading: false 
              };
            }
            return updated;
        });
      }
    });
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
    
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be logged in to create a donation.',
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
        const db = getFirestore(firebaseApp);
        const storage = getStorage(firebaseApp);
        const imageUrls: string[] = [];

        // 1. Upload images to Firebase Storage
        for (const file of Array.from(data.images)) {
            const storageRef = ref(storage, `listings/${user.uid}/${Date.now()}-${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            imageUrls.push(downloadURL);
        }

        // 2. Create the listing document in Firestore
        await addDoc(collection(db, 'listings'), {
            title: data.foodName,
            description: data.description,
            quantity: data.quantity,
            imageUrls: imageUrls,
            donorId: user.uid, // Replace with actual authenticated user ID
            status: 'available', // Initial status
            createdAt: serverTimestamp(),
            pickupWindow: {
                start: new Date(data.pickupWindowStart),
                end: new Date(data.pickupWindowEnd),
            },
            // For demo, using a fixed GeoPoint. In a real app, you'd geocode the address.
            location: new GeoPoint(40.7128, -74.0060), 
            pickupAddress: data.address,
            freshnessAnalyses: imagePreviews.map(p => p.analysis)
        });

        setIsSubmitting(false);
        reset(); // Reset form fields
        setImagePreviews([]); // Clear image previews
        setCurrentStep('details'); // Reset to the first step

        toast({
            title: 'Donation Listed!',
            description: 'Thank you! Your donation is now visible to receivers.',
            className: 'bg-primary text-primary-foreground',
        });

    } catch (error) {
        console.error("Error submitting donation:", error);
        setIsSubmitting(false);
        toast({
            variant: 'destructive',
            title: 'Submission Failed',
            description: 'Could not save your donation. Please try again.',
        });
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  const getAnalysisColor = (assessment?: string) => {
    if (!assessment) return 'text-muted-foreground';
    const lowerCaseAssessment = assessment.toLowerCase();
    if (lowerCaseAssessment.includes('fresh')) return 'text-green-600';
    if (lowerCaseAssessment.includes('spoiled') || lowerCaseAssessment.includes('rotten')) return 'text-red-600';
    if (lowerCaseAssessment.includes('stale') || lowerCaseAssessment.includes('wilting')) return 'text-amber-600';
    return 'text-foreground';
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
        <CardContent className="overflow-hidden min-h-[450px]">
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
                    <Input id="foodName" {...register('foodName')} />
                    {errors.foodName && <p className="text-sm text-destructive">{errors.foodName.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" {...register('description')} placeholder="e.g., Unopened loaf of whole wheat bread..." />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                  </div>
                   <div>
                    <Label htmlFor="quantity">Quantity (e.g., servings, kg, loaves)</Label>
                    <Input id="quantity" {...register('quantity')} placeholder="e.g., 2 loaves, 1 case" />
                    {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="images-upload">Food Images (up to 3)</Label>
                    <Input id="images-upload" type="file" multiple accept="image/*" onChange={handleFileChange} />
                    {errors.images && <p className="text-sm text-destructive">{errors.images.message as string}</p>}
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square">
                           <Image src={preview.src} alt={`Preview ${index + 1}`} fill objectFit="cover" className="rounded-md" />
                           <Card className="absolute bottom-1 left-1 right-1 p-1 bg-background/80 backdrop-blur-sm">
                             <p className="text-xs font-semibold flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-accent" /> AI Freshness
                             </p>
                             {preview.isLoading ? (
                               <p className="text-xs text-muted-foreground animate-pulse">Analyzing...</p>
                             ) : (
                               <p className={`text-xs font-medium ${getAnalysisColor(preview.analysis?.freshnessAssessment)}`}>
                                 {preview.analysis?.freshnessAssessment || 'Analysis failed.'}
                               </p>
                             )}
                           </Card>
                        </div>
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
                           <Card className="absolute bottom-1 left-1 right-1 p-1 bg-background/80 backdrop-blur-sm">
                             <p className="text-xs font-semibold flex items-center gap-1">
                               <Sparkles className="w-3 h-3 text-accent" /> AI Assessment
                             </p>
                            <p className={`text-xs font-medium ${getAnalysisColor(preview.analysis?.freshnessAssessment)}`}>
                                {preview.analysis?.freshnessAssessment}
                            </p>
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
