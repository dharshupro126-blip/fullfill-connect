import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OtpDialog } from "@/components/custom/otp-dialog";

const deliveries = [
  { id: "DLV001", from: "Green Grocer", to: "Community Shelter", item: "Fresh Vegetables", status: "In Transit" },
  { id: "DLV002", from: "BakeHouse", to: "Northside Pantry", item: "Bread and Pastries", status: "Pending Pickup" },
  { id: "DLV003", from: "Daily Dairy", to: "West End Families", item: "Milk & Yogurt", status: "In Transit" },
  { id: "DLV004", from: "Canned Good Co.", to: "Southside Kitchen", item: "Assorted Cans", status: "Delivered" },
  { id: "DLV005", from: "City Farms", to: "Community Shelter", item: "Fresh Fruit", status: "Pending Pickup" },
];

export default function DeliveriesPage() {
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">
            My Deliveries
          </CardTitle>
          <CardDescription>
            Here are your assigned pickups and drop-offs. Thank you for your help!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-medium">{delivery.id}</TableCell>
                  <TableCell>{delivery.from}</TableCell>
                  <TableCell>{delivery.to}</TableCell>
                  <TableCell>{delivery.item}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right">
                    <OtpDialog deliveryId={delivery.id} disabled={delivery.status !== 'In Transit'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
