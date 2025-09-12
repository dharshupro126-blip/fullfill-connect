
'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OtpDialog } from "@/components/custom/otp-dialog";
import { Button } from "@/components/ui/button";
import { List, Map, Rocket, Check, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import Lottie from 'lottie-react';
import confettiAnimation from '@/lib/confetti-lottie.json';
import { useAuth } from "@/hooks/use-auth-context";
import { getFirestore, collection, query, where, onSnapshot, doc, updateDoc, GeoPoint } from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase";

type DeliveryStatus = "Assigned" | "In Transit" | "Delivered" | "Cancelled";

type Delivery = {
  id: string;
  donorName: string;
  receiverName: string;
  itemName: string;
  status: DeliveryStatus;
  donorCoords: { lat: number; lng: number };
  receiverCoords: { lat: number; lng: number };
  volunteerId?: string;
  donorId?: string;
  receiverId?: string;
};

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px',
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const db = getFirestore(firebaseApp);

  useEffect(() => {
    if (!user) {
        setIsLoading(false);
        setDeliveries([]);
        return;
    }

    setIsLoading(true);
    const deliveriesQuery = query(
      collection(db, "deliveries"),
      where("volunteerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(deliveriesQuery, (snapshot) => {
      const fetchedDeliveries: Delivery[] = snapshot.docs.map(doc => {
        const data = doc.data();
        // Fallback for GeoPoint objects
        const donorCoords = data.donorCoords instanceof GeoPoint ? { lat: data.donorCoords.latitude, lng: data.donorCoords.longitude } : data.donorCoords;
        const receiverCoords = data.receiverCoords instanceof GeoPoint ? { lat: data.receiverCoords.latitude, lng: data.receiverCoords.longitude } : data.receiverCoords;

        return {
          id: doc.id,
          donorName: data.donorName || 'Unknown Donor',
          receiverName: data.receiverName || 'Unknown Receiver',
          itemName: data.itemName || 'Unknown Item',
          status: data.status,
          donorCoords,
          receiverCoords,
        };
      });
      setDeliveries(fetchedDeliveries);
      if (fetchedDeliveries.length > 0 && !selectedDelivery) {
        setSelectedDelivery(fetchedDeliveries[0]);
      } else if (fetchedDeliveries.length === 0) {
        setSelectedDelivery(null);
      }
      setIsLoading(false);
    }, (error) => {
        console.error("Error fetching deliveries:", error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, db, selectedDelivery]);


  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  })

  const demoPath = useMemo(() => {
    if (!selectedDelivery) return [];
    return [
        selectedDelivery.donorCoords,
        { lat: (selectedDelivery.donorCoords.lat + selectedDelivery.receiverCoords.lat) / 2 + 0.01, lng: (selectedDelivery.donorCoords.lng + selectedDelivery.receiverCoords.lng) / 2 },
        selectedDelivery.receiverCoords
    ]
  }, [selectedDelivery]);

  const updateDeliveryStatus = async (deliveryId: string, newStatus: DeliveryStatus) => {
    const deliveryRef = doc(db, "deliveries", deliveryId);
    await updateDoc(deliveryRef, { status: newStatus });
    // The onSnapshot listener will automatically update the local state.
  };

  const handleDeliveryConfirmed = (deliveryId: string) => {
    updateDeliveryStatus(deliveryId, 'Delivered');
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000); // Hide confetti after 4 seconds
  };
  
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 relative">
       {showConfetti && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          <Lottie animationData={confettiAnimation} loop={false} />
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                 <div>
                    <CardTitle className="font-headline text-2xl">
                        My Deliveries
                    </CardTitle>
                    <CardDescription>
                        Your assigned tasks.
                    </CardDescription>
                 </div>
                 <div className="flex gap-1">
                    <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('list')}>
                        <List />
                    </Button>
                     <Button variant={view === 'map' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('map')}>
                        <Map />
                    </Button>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>}
              {!isLoading && deliveries.length === 0 && (
                <p className="text-center text-muted-foreground p-4">You have no assigned deliveries.</p>
              )}
              {deliveries.map((delivery) => (
                <Card 
                    key={delivery.id} 
                    className={`p-4 cursor-pointer transition-all ${selectedDelivery?.id === delivery.id ? 'border-primary ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedDelivery(delivery)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">{delivery.itemName}</p>
                        <p className="text-sm text-muted-foreground">From: {delivery.donorName}</p>
                        <p className="text-sm text-muted-foreground">To: {delivery.receiverName}</p>
                    </div>
                     <Badge 
                      variant={delivery.status === 'Delivered' ? 'default' : delivery.status === 'In Transit' ? 'secondary' : delivery.status === 'Cancelled' ? 'destructive' : 'outline' } 
                      className={
                        delivery.status === 'In Transit' ? 'bg-accent text-accent-foreground' 
                        : delivery.status === 'Delivered' ? 'bg-primary/80 text-primary-foreground' 
                        : ''
                      }
                    >
                      {delivery.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
           {selectedDelivery ? (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Delivery Details: {selectedDelivery.id}</CardTitle>
                    <CardDescription>{selectedDelivery.itemName} from {selectedDelivery.donorName} to {selectedDelivery.receiverName}</CardDescription>
                </CardHeader>
                <CardContent>
                    {view === 'list' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <Rocket className="w-6 h-6 text-primary"/>
                                <div>
                                    <p className="font-semibold">Pickup from {selectedDelivery.donorName}</p>
                                    <p className="text-sm text-muted-foreground">Status: {selectedDelivery.status === 'Assigned' ? 'Pending Pickup' : 'Picked Up'}</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="ml-auto" 
                                  disabled={selectedDelivery.status !== 'Assigned'}
                                  onClick={() => updateDeliveryStatus(selectedDelivery.id, 'In Transit')}
                                >
                                  Mark Picked Up
                                </Button>
                            </div>
                             <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <Check className="w-6 h-6 text-primary"/>
                                <div>
                                    <p className="font-semibold">Drop-off at {selectedDelivery.receiverName}</p>
                                    <p className="text-sm text-muted-foreground">Status: {selectedDelivery.status === 'Delivered' ? 'Completed' : 'Pending Drop-off'}</p>
                                </div>
                                <OtpDialog 
                                  deliveryId={selectedDelivery.id} 
                                  disabled={selectedDelivery.status !== 'In Transit'}
                                  onConfirm={() => handleDeliveryConfirmed(selectedDelivery.id)} 
                                />
                            </div>
                        </div>
                    )}
                    {view === 'map' && isLoaded && (
                        <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={selectedDelivery.donorCoords}
                            zoom={12}
                        >
                            <Marker position={selectedDelivery.donorCoords} label="D" />
                            <Marker position={selectedDelivery.receiverCoords} label="R" />
                            <Polyline
                                path={demoPath}
                                options={{
                                    strokeColor: 'hsl(var(--primary))',
                                    strokeOpacity: 0.8,
                                    strokeWeight: 4,
                                }}
                            />
                            {selectedDelivery.status === 'In Transit' && (
                                <Marker 
                                    position={demoPath[1]} 
                                    icon={{
                                        path: 'M20.5 10.5c0-5.52-4.48-10-10-10s-10 4.48-10 10 4.48 10 10 10 10-4.48 10-10z',
                                        fillColor: 'hsl(var(--accent))',
                                        fillOpacity: 1,
                                        strokeColor: 'white',
                                        strokeWeight: 2,
                                        scale: 1.5,
                                    }}
                                />
                            )}
                        </GoogleMap>
                    )}
                     {view === 'map' && !isLoaded && (
                        <div className="flex items-center justify-center w-full h-[400px] bg-muted rounded-lg">
                            <p>Loading map...</p>
                        </div>
                    )}
                </CardContent>
            </Card>
           ) : (
             <Card className="flex items-center justify-center h-full min-h-[400px]">
                <CardContent>
                    <p className="text-muted-foreground">Select a delivery to see the details.</p>
                </CardContent>
             </Card>
           )}
        </div>
      </div>
    </div>
  );
}

    