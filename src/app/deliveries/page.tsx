'use client';

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OtpDialog } from "@/components/custom/otp-dialog";
import { Button } from "@/components/ui/button";
import { List, Map, Navigation, Check } from "lucide-react";
import { useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

const deliveries = [
  { id: "DLV001", from: "Green Grocer", to: "Community Shelter", item: "Fresh Vegetables", status: "In Transit", donorCoords: { lat: 40.7128, lng: -74.0060 }, receiverCoords: { lat: 40.7580, lng: -73.9855 } },
  { id: "DLV002", from: "BakeHouse", to: "Northside Pantry", item: "Bread and Pastries", status: "Pending Pickup", donorCoords: { lat: 40.7295, lng: -73.9965 }, receiverCoords: { lat: 40.7831, lng: -73.9712 } },
];

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px',
};

// A simple polyline path for demonstration
const demoPath = [
    { lat: 40.7128, lng: -74.0060 },
    { lat: 40.73, lng: -73.99 },
    { lat: 40.7580, lng: -73.9855 }
];


export default function DeliveriesPage() {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [selectedDelivery, setSelectedDelivery] = useState(deliveries[0]);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  })

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
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
                    className={`p-4 cursor-pointer ${selectedDelivery.id === delivery.id ? 'border-primary ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedDelivery(delivery)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">{delivery.item}</p>
                        <p className="text-sm text-muted-foreground">From: {delivery.from}</p>
                        <p className="text-sm text-muted-foreground">To: {delivery.to}</p>
                    </div>
                     <Badge 
                      variant={delivery.status === 'Delivered' ? 'secondary' : delivery.status === 'In Transit' ? 'default' : 'outline' } 
                      className={
                        delivery.status === 'In Transit' ? 'bg-accent text-accent-foreground' 
                        : delivery.status === 'Delivered' ? 'bg-primary/20 text-primary' 
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
                                <Navigation className="w-6 h-6 text-primary"/>
                                <div>
                                    <p className="font-semibold">Pickup from {selectedDelivery.from}</p>
                                    <p className="text-sm text-muted-foreground">Status: Pending Pickup</p>
                                </div>
                                <Button size="sm" className="ml-auto">Mark Picked Up</Button>
                            </div>
                             <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <Check className="w-6 h-6 text-primary"/>
                                <div>
                                    <p className="font-semibold">Drop-off at {selectedDelivery.to}</p>
                                    <p className="text-sm text-muted-foreground">Status: Pending Drop-off</p>
                                </div>
                                <OtpDialog deliveryId={selectedDelivery.id} disabled={selectedDelivery.status !== 'In Transit'} />
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
                                    strokeColor: '#2ECC71',
                                    strokeOpacity: 0.8,
                                    strokeWeight: 4,
                                }}
                            />
                             {/* Animated Van Marker could be added here */}
                        </GoogleMap>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
