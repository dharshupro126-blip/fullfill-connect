'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OtpDialog } from "@/components/custom/otp-dialog";
import { Button } from "@/components/ui/button";
import { List, Map, Navigation, Check, Bike, Rocket } from "lucide-react";
import { useState, useMemo } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import Lottie from 'lottie-react';
import confettiAnimation from '@/lib/confetti-lottie.json';

type DeliveryStatus = "Assigned" | "In Transit" | "Delivered" | "Cancelled";

type Delivery = {
  id: string;
  from: string;
  to: string;
  item: string;
  status: DeliveryStatus;
  donorCoords: { lat: number; lng: number };
  receiverCoords: { lat: number; lng: number };
};

const initialDeliveries: Delivery[] = [
  { id: "DLV001", from: "Green Grocer", to: "Community Shelter", item: "Fresh Vegetables", status: "Assigned", donorCoords: { lat: 40.7128, lng: -74.0060 }, receiverCoords: { lat: 40.7580, lng: -73.9855 } },
  { id: "DLV002", from: "BakeHouse", to: "Northside Pantry", item: "Bread and Pastries", status: "In Transit", donorCoords: { lat: 40.7295, lng: -73.9965 }, receiverCoords: { lat: 40.7831, lng: -73.9712 } },
  { id: "DLV003", from: "Daily Catch", to: "Southside Kitchen", item: "Fresh Fish", status: "Delivered", donorCoords: { lat: 40.6892, lng: -74.0445 }, receiverCoords: { lat: 40.6782, lng: -73.9442 } },
];

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px',
};


export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedDelivery, setSelectedDelivery] = useState(deliveries[0]);
  const [showConfetti, setShowConfetti] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  })

  const demoPath = useMemo(() => [
    selectedDelivery.donorCoords,
    { lat: (selectedDelivery.donorCoords.lat + selectedDelivery.receiverCoords.lat) / 2 + 0.01, lng: (selectedDelivery.donorCoords.lng + selectedDelivery.receiverCoords.lng) / 2 },
    selectedDelivery.receiverCoords
  ], [selectedDelivery]);

  const updateDeliveryStatus = (deliveryId: string, newStatus: DeliveryStatus) => {
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status: newStatus } : d));
    setSelectedDelivery(prev => prev.id === deliveryId ? { ...prev, status: newStatus } : prev);
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
              {deliveries.map((delivery) => (
                <Card 
                    key={delivery.id} 
                    className={`p-4 cursor-pointer transition-all ${selectedDelivery.id === delivery.id ? 'border-primary ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedDelivery(delivery)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">{delivery.item}</p>
                        <p className="text-sm text-muted-foreground">From: {delivery.from}</p>
                        <p className="text-sm text-muted-foreground">To: {delivery.to}</p>
                    </div>
                     <Badge 
                      variant={delivery.status === 'Delivered' ? 'default' : delivery.status === 'In Transit' ? 'secondary' : 'outline' } 
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
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Delivery Details: {selectedDelivery.id}</CardTitle>

                    <CardDescription>{selectedDelivery.item} from {selectedDelivery.from} to {selectedDelivery.to}</CardDescription>
                </CardHeader>
                <CardContent>
                    {view === 'list' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <Rocket className="w-6 h-6 text-primary"/>
                                <div>
                                    <p className="font-semibold">Pickup from {selectedDelivery.from}</p>
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
                                    <p className="font-semibold">Drop-off at {selectedDelivery.to}</p>
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
        </div>
      </div>
    </div>
  );
}
