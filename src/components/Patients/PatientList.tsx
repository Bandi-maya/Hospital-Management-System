import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';
import { Patient } from '@/types/patient';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

// Mock patient data
const mockPatients: Patient[] = [
  {
    id: '1',
    patientId: 'P001',
    firstName: 'John',
    lastName: 'Smith',
    dateOfBirth: new Date('1985-06-15'),
    gender: 'male',
    bloodType: 'O+',
    address: {
      street: '123 Main St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      country: 'USA'
    },
    contact: {
      phone: '+1-555-0123',
      email: 'john.smith@email.com',
      emergencyContact: {
        name: 'Jane Smith',
        phone: '+1-555-0124',
        relationship: 'Spouse'
      }
    },
    status: 'active',
    medicalHistory: [],
    allergies: [],
    currentMedications: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    assignedDoctor: 'Dr. Sarah Johnson'
  },
  {
    id: '2',
    patientId: 'P002',
    firstName: 'Emily',
    lastName: 'Johnson',
    dateOfBirth: new Date('1992-03-22'),
    gender: 'female',
    bloodType: 'A+',
    address: {
      street: '456 Oak Ave',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62702',
      country: 'USA'
    },
    contact: {
      phone: '+1-555-0234',
      email: 'emily.johnson@email.com'
    },
    status: 'active',
    medicalHistory: [],
    allergies: [],
    currentMedications: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    wardNumber: 'W-3',
    bedNumber: 'B-12',
    assignedDoctor: 'Dr. Michael Chen'
  },
  {
    id: '3',
    patientId: 'P003',
    firstName: 'Robert',
    lastName: 'Brown',
    dateOfBirth: new Date('1978-11-08'),
    gender: 'male',
    bloodType: 'B-',
    address: {
      street: '789 Pine St',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62703',
      country: 'USA'
    },
    contact: {
      phone: '+1-555-0345',
      email: 'robert.brown@email.com'
    },
    status: 'inactive',
    medicalHistory: [],
    allergies: [],
    currentMedications: [],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    dischargeDate: new Date('2024-01-15'),
    assignedDoctor: 'Dr. Lisa Wilson'
  }
];

export const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const navigate = useNavigate();

  const filteredPatients = patients.filter(patient => {
    const matchesSearch =
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.contact.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-success';
      case 'inactive': return 'bg-muted text-muted-foreground';
      case 'pending': return 'status-warning';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const handleViewPatient = (patientId: string) => {
    // Navigate to patient profile
    console.log('View patient:', patientId);
  };

  const handleEditPatient = (patientId: string) => {
    // Navigate to edit patient form
    console.log('Edit patient:', patientId);
  };

  const handleDeletePatient = (patientId: string) => {
    // Show confirmation dialog and delete patient
    console.log('Delete patient:', patientId);
    setPatients(prev => prev.filter(p => p.id !== patientId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Patient Management</h1>
          <p className="text-muted-foreground">Manage and view all patient records</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary-dark text-primary-foreground"
          onClick={() => navigate('/patients/add')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Patient
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Patients Overview
          </CardTitle>
          <CardDescription>
            Total {patients.length} patients • {patients.filter(p => p.status === 'active').length} active • {patients.filter(p => p.wardNumber).length} admitted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Status: {filterStatus === 'all' ? 'All' : filterStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                    All Patients
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
                    Inactive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('pending')}>
                    Pending
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Patient Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Age/Gender</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned Doctor</TableHead>
                  <TableHead>Admission</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-accent/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {getInitials(patient.firstName, patient.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                          <p className="text-sm text-muted-foreground">{patient.contact.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {patient.patientId}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{calculateAge(patient.dateOfBirth)} years</p>
                        <p className="text-muted-foreground capitalize">{patient.gender}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          <span>{patient.contact.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{patient.address.city}, {patient.address.state}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-destructive/10 text-destructive font-mono">
                        {patient.bloodType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`status-badge ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {patient.assignedDoctor || 'Not assigned'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {patient.wardNumber ? (
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3 text-success" />
                            <span className="font-medium">Admitted</span>
                          </div>
                          <p className="text-muted-foreground">{patient.wardNumber} - {patient.bedNumber}</p>
                        </div>
                      ) : patient.dischargeDate ? (
                        <div className="text-sm text-muted-foreground">
                          Discharged {format(patient.dischargeDate, 'MMM dd')}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">Outpatient</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewPatient(patient.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditPatient(patient.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeletePatient(patient.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Patient
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No patients found</h3>
              <p className="text-muted-foreground">
                {searchQuery || filterStatus !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by adding your first patient'
                }
              </p>
              {(!searchQuery && filterStatus === 'all') && (
                <Button className="mt-4 bg-primary hover:bg-primary-dark text-primary-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Patient
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientList;