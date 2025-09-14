
'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OtpDialog } from "@/components/custom/otp-dialog";
import { Button } from "@/components/ui/button";
import { List, Map, Rocket, Check, Loader2, Ban, RefreshCw } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import Lottie from 'lottie-react';
import confettiAnimation from '@/lib/confetti-lottie.json';

type DeliveryStatus = "Assigned" | "In Transit" | "Delivered" | "Cancelled";

type Delivery = {
  id: string;
  donorName: string;
  receiverName: string;
  itemName: string;
  status: DeliveryStatus;
  donorCoords: { lat: number; lng: number };
  receiverCoords: { lat: number; lng: number };
};

const initialDeliveries: Delivery[] = [
    {
        id: "DEL001",
        donorName: "Sunrise Bakery",
        receiverName: "Community Shelter",
        itemName: "Assorted Pastries (2 boxes)",
        status: "Assigned",
        donorCoords: { lat: 40.7128, lng: -74.0060 }, // NYC
        receiverCoords: { lat: 40.7580, lng: -73.9855 }, // Times Square
    },
    {
        id: "DEL002",
        donorName: "The Corner Cafe",
        receiverName: "Downtown Food Bank",
        itemName: "Vegetable Soup (10L)",
        status: "In Transit",
        donorCoords: { lat: 40.7484, lng: -73.9857 }, // Empire State
        receiverCoords: { lat: 40.7061, lng: -73.9969 }, // Wall Street
    },
    {
        id: "DEL003",
        donorName: "Good Eats Catering",
        receiverName: "Uptown Soup Kitchen",
        itemName: "Chicken & Rice (50 servings)",
        status: "Delivered",
        donorCoords: { lat: 40.7796, lng: -73.9632 }, // Central Park
        receiverCoords: { lat: 40.8116, lng: -73.9465 }, // Harlem
    },
    {
        id: "DEL004",
        donorName: "Farm Fresh Grocers",
        receiverName: "St. Jude's Center",
        itemName: "Fresh Vegetables (15kg)",
        status: "Assigned",
        donorCoords: { lat: 40.730610, lng: -73.935242 }, // Brooklyn
        receiverCoords: { lat: 40.749825, lng: -73.992004 }, // Penn Station
    },
     {
        id: "DEL005",
        donorName: "Pizza Palace",
        receiverName: "Youth Center",
        itemName: "10 Large Pizzas",
        status: "Assigned",
        donorCoords: { lat: 40.7679, lng: -73.9822 }, // Near MoMA
        receiverCoords: { lat: 40.7505, lng: -73.9934 }, // Madison Square Garden
    },
    {
        id: "DEL006",
        donorName: "The Daily Grind",
        receiverName: "Morning Star Shelter",
        itemName: "Coffee and Sandwiches",
        status: "Cancelled",
        donorCoords: { lat: 40.7295, lng: -73.9965 }, // Greenwich Village
        receiverCoords: { lat: 40.7143, lng: -74.0119 }, // WTC
    },
     {
        id: "DEL007",
        donorName: "Sushi Central",
        receiverName: "City Harvest",
        itemName: "Assorted Sushi Platters",
        status: "Assigned",
        donorCoords: { lat: 40.7590, lng: -73.9845 }, // Bryant Park
        receiverCoords: { lat: 40.7614, lng: -73.9776 }, // 5th Avenue
    },
     {
        id: "DEL008",
        donorName: "Healthy Bites",
        receiverName: "Local Community Fridge",
        itemName: "Salads and Wraps",
        status: "In Transit",
        donorCoords: { lat: 40.7447, lng: -74.0024 }, // Meatpacking District
        receiverCoords: { lat: 40.7308, lng: -73.9973 }, // Union Square
    }
];


const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px',
};

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(deliveries[0] || null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
    setDeliveries(currentDeliveries => 
        currentDeliveries.map(d => 
            d.id === deliveryId ? { ...d, status: newStatus } : d
        )
    );
    setSelectedDelivery(prev => prev && prev.id === deliveryId ? { ...prev, status: newStatus } : prev);
  };

  const handleDeliveryConfirmed = (deliveryId: string) => {
    updateDeliveryStatus(deliveryId, 'Delivered');
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000); // Hide confetti after 4 seconds
  };

  const resetData = () => {
    setIsLoading(true);
    setDeliveries(initialDeliveries);
    setSelectedDelivery(initialDeliveries[0] || null);
    setTimeout(() => setIsLoading(false), 500);
  }
  
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
                    <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('list')} aria-label="List View">
                        <List />
                    </Button>
                     <Button variant={view === 'map' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('map')} aria-label="Map View">
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
                        : delivery.status === 'Cancelled' ? 'bg-destructive/80 text-destructive-foreground'
                        : ''
                      }
                    >
                      {delivery.status}
                    </Badge>
                  </div>
                </Card>
              ))}
                <Button onClick={resetData} variant="outline" className="w-full mt-4">
                    <RefreshCw className="mr-2 h-4 w-4" /> Reset Demo Data
                </Button>
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
                                    <p className="text-sm text-muted-foreground">Status: {selectedDelivery.status === 'Assigned' ? 'Pending Pickup' : 'On the way'}</p>
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
                             <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                                <Ban className="w-6 h-6 text-destructive"/>
                                <div>
                                    <p className="font-semibold">Cancel Delivery</p>
                                    <p className="text-sm text-muted-foreground">If you can no longer complete this task.</p>
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="ml-auto" 
                                  disabled={selectedDelivery.status === 'Delivered' || selectedDelivery.status === 'Cancelled'}
                                  onClick={() => updateDeliveryStatus(selectedDelivery.id, 'Cancelled')}
                                >
                                  Cancel Task
                                </Button>
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

    