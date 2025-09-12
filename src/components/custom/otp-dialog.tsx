
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { getFunctions, httpsCallable, FirebaseFunctions } from 'firebase/functions';
import { firebaseApp } from '@/lib/firebase';

type OtpDialogProps = {
  deliveryId: string;
  disabled?: boolean;
  onConfirm: (deliveryId: string) => void;
};

// Lazily initialize functions and callables outside the component
let functions: FirebaseFunctions | null = null;
let generateOtp: ReturnType<typeof httpsCallable> | null = null;
let verifyOtp: ReturnType<typeof httpsCallable> | null = null;

const getFirebaseFunctions = () => {
    if (typeof window !== 'undefined') {
        if (!functions) {
            functions = getFunctions(firebaseApp);
            generateOtp = httpsCallable(functions, 'generateOtp');
            verifyOtp = httpsCallable(functions, 'verifyOtp');
        }
    }
}


export function OtpDialog({ deliveryId, disabled, onConfirm }: OtpDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [otp, setOtp] = useState('');
  const [hasGeneratedOtp, setHasGeneratedOtp] = useState(false);

  // Ensure functions are initialized on the client
  useMemo(() => getFirebaseFunctions(), []);


  const handleGenerateOtp = async () => {
    if (!generateOtp) {
        toast({ variant: 'destructive', title: 'Error', description: 'Functions not initialized.' });
        return;
    };
    setIsConfirming(true);
    try {
      await generateOtp({ deliveryId });
      toast({
        title: 'OTP Generated',
        description: 'An OTP has been sent to the receiver.',
      });
      setHasGeneratedOtp(true);
    } catch (error: any) {
      console.error("Error generating OTP:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to Generate OTP',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsConfirming(false);
    }
  }

  const handleConfirm = async () => {
     if (!verifyOtp) {
        toast({ variant: 'destructive', title: 'Error', description: 'Functions not initialized.' });
        return;
    };
    setIsConfirming(true);
    try {
      const result = await verifyOtp({ deliveryId, otp });
      if ((result.data as any).success) {
        toast({
          title: 'Delivery Confirmed!',
          description: `Delivery ${deliveryId} has been successfully completed.`,
          className: 'bg-primary text-primary-foreground',
        });
        onConfirm(deliveryId);
        setOpen(false); // Close the dialog on success
      } else {
         throw new Error((result.data as any).message || 'The OTP entered is incorrect.');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Incorrect OTP',
        description: error.message || 'The OTP entered is incorrect. Please try again.',
      });
    } finally {
        setIsConfirming(false);
        setOtp('');
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
        // Reset state when closing the dialog
        setIsConfirming(false);
        setHasGeneratedOtp(false);
        setOtp('');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          Confirm Delivery
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Confirm Delivery - {deliveryId}</DialogTitle>
          <DialogDescription>
            {hasGeneratedOtp
              ? 'Please enter the One-Time Password (OTP) provided by the receiver to confirm the delivery.'
              : 'Generate an OTP to be sent to the receiver for confirmation.'
            }
          </DialogDescription>
        </DialogHeader>
        {!hasGeneratedOtp ? (
          <div className="py-4">
             <Button type="button" onClick={handleGenerateOtp} disabled={isConfirming || !generateOtp} className='w-full'>
              {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate & Send OTP
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="otp" className="text-right">
                OTP
              </Label>
              <Input
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="col-span-3"
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          {hasGeneratedOtp && (
            <Button type="button" onClick={handleConfirm} disabled={isConfirming || otp.length < 6 || !verifyOtp}>
              {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    