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
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

type OtpDialogProps = {
  deliveryId: string;
  disabled?: boolean;
};

export function OtpDialog({ deliveryId, disabled }: OtpDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [otp, setOtp] = useState('');

  const handleConfirm = async () => {
    setIsConfirming(true);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (otp === '123456') { // Mock OTP
      toast({
        title: 'Delivery Confirmed!',
        description: `Delivery ${deliveryId} has been successfully completed.`,
        className: 'bg-primary text-primary-foreground',
      });
      setOpen(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Incorrect OTP',
        description: 'The OTP entered is incorrect. Please try again.',
      });
    }
    setIsConfirming(false);
    setOtp('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          Confirm Delivery
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Confirm Delivery - {deliveryId}</DialogTitle>
          <DialogDescription>
            Please enter the One-Time Password (OTP) provided by the receiver to confirm the delivery.
          </DialogDescription>
        </DialogHeader>
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
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleConfirm} disabled={isConfirming || otp.length < 6}>
            {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
