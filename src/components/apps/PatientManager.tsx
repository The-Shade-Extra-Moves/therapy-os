import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastSession: string;
  status: 'active' | 'inactive' | 'completed';
}

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 123-4567',
    lastSession: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 987-6543',
    lastSession: '2024-01-12',
    status: 'active'
  },
  {
    id: '3',
    name: 'Emma Williams',
    email: 'emma.w@email.com',
    phone: '+1 (555) 456-7890',
    lastSession: '2024-01-10',
    status: 'completed'
  }
];

export const PatientManager: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPatient, setSelectedPatient] = React.useState<Patient | null>(null);

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-card/50 backdrop-blur-sm">
      <div className="flex h-full">
        {/* Patient List */}
        <div className="w-1/3 border-r border-border/50 flex flex-col">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center space-x-2 mb-3">
              <h2 className="text-lg font-semibold text-foreground">Patients</h2>
              <Button size="sm" className="ml-auto">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredPatients.map((patient) => (
              <motion.div
                key={patient.id}
                whileHover={{ backgroundColor: 'hsl(var(--muted))' }}
                className={`p-4 border-b border-border/30 cursor-pointer transition-colors ${
                  selectedPatient?.id === patient.id ? 'bg-primary/10' : ''
                }`}
                onClick={() => setSelectedPatient(patient)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{patient.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{patient.email}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        patient.status === 'active' ? 'bg-secondary/20 text-secondary-dark' :
                        patient.status === 'completed' ? 'bg-accent/20 text-accent-dark' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {patient.status}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Patient Details */}
        <div className="flex-1 flex flex-col">
          {selectedPatient ? (
            <motion.div
              key={selectedPatient.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedPatient.name}</h2>
                  <p className="text-muted-foreground">Patient since March 2023</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card className="p-4 glass-surface">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedPatient.email}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 glass-surface">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedPatient.phone}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 glass-surface">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Last Session</p>
                      <p className="font-medium">{selectedPatient.lastSession}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 glass-surface">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      selectedPatient.status === 'active' ? 'bg-secondary' :
                      selectedPatient.status === 'completed' ? 'bg-accent' : 'bg-muted-foreground'
                    }`} />
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium capitalize">{selectedPatient.status}</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex space-x-3">
                <Button className="bg-gradient-primary">
                  Schedule Session
                </Button>
                <Button variant="outline">
                  View Notes
                </Button>
                <Button variant="outline">
                  Send Message
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a patient to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};