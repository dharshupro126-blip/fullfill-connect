
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const donationData = [
  { month: 'January', donations: 65 },
  { month: 'February', donations: 59 },
  { month: 'March', donations: 80 },
  { month: 'April', donations: 81 },
  { month: 'May', donations: 56 },
  { month: 'June', donations: 55 },
];

const verificationQueue = [
    { id: 'USR012', name: 'Community Harvest', type: 'Receiver', date: '2024-06-28' },
    { id: 'VOL034', name: 'Alex Green', type: 'Volunteer', date: '2024-06-27' },
    { id: 'DNR007', name: 'Sunrise Bakery', type: 'Donor', date: '2024-06-27' },
];

export default function ReportsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Admin Reports & Analytics
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Donations</CardTitle>
            <CardDescription>All-time completed donations.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">12,503</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
            <CardDescription>Users waiting for approval.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{verificationQueue.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Volunteers</CardTitle>
            <CardDescription>Volunteers with a delivery in the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">214</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Donations Overview</CardTitle>
            <CardDescription>Donations trend for the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={donationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: 'var(--radius)',
                    }}
                />
                <Legend wrapperStyle={{fontSize: 14}} />
                <Bar dataKey="donations" fill="hsl(var(--primary))" name="Donations" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Verification Queue</CardTitle>
            <CardDescription>Review and approve new users.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {verificationQueue.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.id}</TableCell>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>
                                <Badge variant={
                                    user.type === 'Receiver' ? 'secondary' :
                                    user.type === 'Volunteer' ? 'outline' : 'default'
                                }>{user.type}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
                                    <CheckCircle className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                                    <XCircle className="h-5 w-5" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
