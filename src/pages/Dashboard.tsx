import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  UserCheck,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Heart,
  Stethoscope,
  Building2,
  AlertTriangle,
  Clock,
  DollarSign,
} from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ComponentType<any>;
  description?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  description
}) => (
  <Card className="medical-card">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change && (
        <div className="flex items-center text-xs text-muted-foreground">
          {changeType === 'increase' ? (
            <TrendingUp className="mr-1 h-3 w-3 text-success" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3 text-destructive" />
          )}
          <span className={changeType === 'increase' ? 'text-success' : 'text-destructive'}>
            {change}
          </span>
          <span className="ml-1">from last month</span>
        </div>
      )}
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

interface RecentActivity {
  id: string;
  type: 'appointment' | 'admission' | 'discharge' | 'emergency' | 'lab' | 'prescription';
  title: string;
  description: string;
  time: string;
  patient: string;
  status?: 'pending' | 'completed' | 'in_progress' | 'cancelled';
}

export const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();

  const stats = [
    {
      title: 'Total Patients',
      value: '2,847',
      change: '+12.5%',
      changeType: 'increase' as const,
      icon: Users,
      description: 'Active registered patients'
    },
    {
      title: 'Today\'s Appointments',
      value: '58',
      change: '+5.2%',
      changeType: 'increase' as const,
      icon: Calendar,
      description: '12 pending, 46 scheduled'
    },
    {
      title: 'Available Doctors',
      value: '24',
      change: '-2.1%',
      changeType: 'decrease' as const,
      icon: UserCheck,
      description: '3 on leave, 5 in surgery'
    },
    {
      title: 'Bed Occupancy',
      value: '87%',
      change: '+3.8%',
      changeType: 'increase' as const,
      icon: Building2,
      description: '174 of 200 beds occupied'
    },
    {
      title: 'Emergency Cases',
      value: '12',
      change: '-8.3%',
      changeType: 'decrease' as const,
      icon: AlertTriangle,
      description: '3 critical, 9 moderate'
    },
    {
      title: 'Monthly Revenue',
      value: '$124,750',
      change: '+15.3%',
      changeType: 'increase' as const,
      icon: DollarSign,
      description: 'Current month earnings'
    }
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'appointment',
      title: 'New Appointment Scheduled',
      description: 'Cardiology consultation',
      time: '5 minutes ago',
      patient: 'John Smith',
      status: 'pending'
    },
    {
      id: '2',
      type: 'admission',
      title: 'Patient Admitted',
      description: 'Emergency admission to ICU',
      time: '12 minutes ago',
      patient: 'Sarah Johnson',
      status: 'completed'
    },
    {
      id: '3',
      type: 'lab',
      title: 'Lab Results Ready',
      description: 'Blood test results available',
      time: '28 minutes ago',
      patient: 'Michael Davis',
      status: 'completed'
    },
    {
      id: '4',
      type: 'discharge',
      title: 'Patient Discharged',
      description: 'Recovery completed successfully',
      time: '1 hour ago',
      patient: 'Emily Wilson',
      status: 'completed'
    },
    {
      id: '5',
      type: 'prescription',
      title: 'Prescription Generated',
      description: 'Antibiotics prescribed',
      time: '2 hours ago',
      patient: 'Robert Brown',
      status: 'completed'
    }
  ];

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'appointment': return Calendar;
      case 'admission': return Building2;
      case 'discharge': return Users;
      case 'emergency': return AlertTriangle;
      case 'lab': return Activity;
      case 'prescription': return Heart;
      default: return Clock;
    }
  };

  const getStatusColor = (status?: RecentActivity['status']) => {
    switch (status) {
      case 'pending': return 'status-warning';
      case 'completed': return 'status-success';
      case 'in_progress': return 'bg-accent/10 text-accent';
      case 'cancelled': return 'status-critical';
      default: return 'status-success';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">
          Welcome back, {user?.name?.split(' ')[0] || 'Doctor'}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening at MediCare Hospital today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest hospital activities and updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <ActivityIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{activity.title}</h4>
                      {activity.status && (
                        <Badge className={`status-badge ${getStatusColor(activity.status)}`}>
                          {activity.status.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Patient: {activity.patient}</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            <Button variant="outline" className="w-full">
              View All Activities
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Frequently used hospital functions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button className="medical-button bg-primary hover:bg-primary-dark text-primary-foreground justify-start">
                <Users className="mr-2 h-4 w-4" />
                Register New Patient
              </Button>
              <Button className="medical-button bg-secondary hover:bg-secondary/90 text-secondary-foreground justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
              <Button className="medical-button bg-accent hover:bg-accent/90 text-accent-foreground justify-start">
                <Activity className="mr-2 h-4 w-4" />
                Lab Test Request
              </Button>
              <Button className="medical-button bg-warning hover:bg-warning/90 text-warning-foreground justify-start">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Emergency Admission
              </Button>
              <Button variant="outline" className="justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                Ward Management
              </Button>
              <Button variant="outline" className="justify-start">
                <Heart className="mr-2 h-4 w-4" />
                Pharmacy Orders
              </Button>
            </div>

            {/* Hospital Status */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="text-sm font-medium">Hospital Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>ICU Capacity</span>
                  <span>12/15 beds</span>
                </div>
                <Progress value={80} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span>General Ward</span>
                  <span>45/60 beds</span>
                </div>
                <Progress value={75} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span>Emergency Room</span>
                  <span>3/8 beds</span>
                </div>
                <Progress value={37.5} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific sections */}
      {hasRole('doctor') && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle>My Schedule Today</CardTitle>
            <CardDescription>Your upcoming appointments and tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Surgery - Room 3</p>
                    <p className="text-xs text-muted-foreground">Appendectomy procedure</p>
                  </div>
                </div>
                <Badge className="status-badge status-warning">10:30 AM</Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-secondary" />
                  <div>
                    <p className="text-sm font-medium">Patient Consultation</p>
                    <p className="text-xs text-muted-foreground">Follow-up checkup</p>
                  </div>
                </div>
                <Badge className="status-badge bg-accent/10 text-accent">2:00 PM</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;