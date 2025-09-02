import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Plus, Filter, MoreVertical, Phone, Mail, Video, 
  MapPin, Calendar, MessageSquare, Star, Tag, User, Users,
  Building, AlertTriangle, Heart, Clock, FileText, Camera,
  Navigation, Trash2, Edit, Eye, Settings, Zap, Brain,
  Shield, Globe, UserCheck, Stethoscope, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Mock data for contacts
const mockContacts = [
  {
    id: 1,
    name: "Sarah Johnson",
    type: "client",
    email: "sarah.j@email.com",
    phone: "(555) 123-4567",
    address: "123 Oak St, City, State 12345",
    therapyType: "CBT",
    lastSession: "2024-01-15",
    nextSession: "2024-01-22",
    progress: 75,
    mood: "improving",
    tags: ["Anxiety", "Progress"],
    avatar: "",
    notes: "Making excellent progress with anxiety management techniques."
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    type: "colleague",
    email: "m.chen@clinic.com",
    phone: "(555) 987-6543",
    address: "456 Medical Plaza, City, State 12345",
    specialty: "Neuropsychology",
    tags: ["Specialist", "Referral Partner"],
    avatar: "",
    notes: "Excellent neuropsychologist for complex cases."
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    type: "client",
    email: "emma.r@email.com",
    phone: "(555) 456-7890",
    address: "789 Pine Ave, City, State 12345",
    therapyType: "EMDR",
    lastSession: "2024-01-18",
    nextSession: "2024-01-25",
    progress: 45,
    mood: "stable",
    tags: ["Trauma", "New Client"],
    avatar: "",
    notes: "Responding well to EMDR therapy sessions."
  },
  {
    id: 4,
    name: "City Mental Health Center",
    type: "institution",
    email: "info@cmhc.org",
    phone: "(555) 111-2222",
    address: "100 Health Plaza, City, State 12345",
    tags: ["Emergency", "Crisis Center"],
    avatar: "",
    notes: "24/7 crisis intervention services available."
  }
];

const contactTypes = [
  { id: 'all', label: 'All Contacts', icon: Users, count: mockContacts.length },
  { id: 'client', label: 'Clients', icon: User, count: mockContacts.filter(c => c.type === 'client').length },
  { id: 'colleague', label: 'Colleagues', icon: UserCheck, count: mockContacts.filter(c => c.type === 'colleague').length },
  { id: 'institution', label: 'Institutions', icon: Building, count: mockContacts.filter(c => c.type === 'institution').length },
  { id: 'emergency', label: 'Emergency', icon: AlertTriangle, count: 1 },
  { id: 'favorites', label: 'Favorites', icon: Star, count: 0 }
];

const therapyTags = [
  { name: 'CBT', color: 'bg-blue-100 text-blue-800' },
  { name: 'EMDR', color: 'bg-purple-100 text-purple-800' },
  { name: 'Anxiety', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Trauma', color: 'bg-red-100 text-red-800' },
  { name: 'Progress', color: 'bg-green-100 text-green-800' },
  { name: 'New Client', color: 'bg-indigo-100 text-indigo-800' },
  { name: 'Specialist', color: 'bg-teal-100 text-teal-800' },
  { name: 'Emergency', color: 'bg-red-100 text-red-800' }
];

export const ContactManager: React.FC = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showProfile, setShowProfile] = useState(false);

  const filteredContacts = mockContacts.filter(contact => {
    const matchesType = selectedType === 'all' || contact.type === selectedType;
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const renderContactCard = (contact: any) => (
    <motion.div
      key={contact.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border-primary/10">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={contact.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                  {contact.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm mb-1">{contact.name}</h3>
                <div className="flex items-center space-x-1">
                  {contact.type === 'client' && <User className="h-3 w-3 text-blue-500" />}
                  {contact.type === 'colleague' && <UserCheck className="h-3 w-3 text-green-500" />}
                  {contact.type === 'institution' && <Building className="h-3 w-3 text-purple-500" />}
                  <span className="text-xs text-muted-foreground capitalize">{contact.type}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          {/* Contact Actions */}
          <div className="flex space-x-1 mb-3">
            <Button size="icon" variant="ghost" className="h-8 w-8 bg-green-100 hover:bg-green-200 text-green-700">
              <Phone className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 bg-blue-100 hover:bg-blue-200 text-blue-700">
              <Mail className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 bg-purple-100 hover:bg-purple-200 text-purple-700">
              <Video className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 bg-orange-100 hover:bg-orange-200 text-orange-700">
              <MapPin className="h-4 w-4" />
            </Button>
          </div>

          {/* Therapy Progress (for clients) */}
          {contact.type === 'client' && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{contact.progress}%</span>
              </div>
              <Progress value={contact.progress} className="h-2" />
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">Therapy: {contact.therapyType}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  contact.mood === 'improving' ? 'bg-green-100 text-green-800' :
                  contact.mood === 'stable' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {contact.mood}
                </span>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-1 text-xs text-muted-foreground mb-3">
            <div className="flex items-center space-x-2">
              <Mail className="h-3 w-3" />
              <span className="truncate">{contact.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-3 w-3" />
              <span>{contact.phone}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {contact.tags?.slice(0, 2).map((tag: string) => {
              const tagConfig = therapyTags.find(t => t.name === tag);
              return (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className={`text-xs px-2 py-1 ${tagConfig?.color || 'bg-gray-100 text-gray-800'}`}
                >
                  {tag}
                </Badge>
              );
            })}
            {contact.tags?.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{contact.tags.length - 2}
              </Badge>
            )}
          </div>

          {/* Last Contact */}
          {contact.lastSession && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Last session:</span>
              <span className="font-medium">{new Date(contact.lastSession).toLocaleDateString()}</span>
            </div>
          )}

          <Button 
            className="w-full mt-3 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90"
            size="sm"
            onClick={() => {
              setSelectedContact(contact);
              setShowProfile(true);
            }}
          >
            View Profile
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderContactProfile = () => {
    if (!selectedContact) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowProfile(false)}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                  <AvatarImage src={selectedContact.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-lg">
                    {selectedContact.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{selectedContact.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {selectedContact.type === 'client' && <Stethoscope className="h-4 w-4 text-blue-500" />}
                    {selectedContact.type === 'colleague' && <UserCheck className="h-4 w-4 text-green-500" />}
                    {selectedContact.type === 'institution' && <Building className="h-4 w-4 text-purple-500" />}
                    <span className="text-muted-foreground capitalize">{selectedContact.type}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {selectedContact.tags?.map((tag: string) => {
                      const tagConfig = therapyTags.find(t => t.name === tag);
                      return (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className={`${tagConfig?.color || 'bg-gray-100 text-gray-800'}`}
                        >
                          {tag}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setShowProfile(false)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
                <TabsTrigger value="therapy">Therapy</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Contact Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedContact.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedContact.phone}</span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <span className="text-sm">{selectedContact.address}</span>
                      </div>
                      <Button className="w-full" variant="outline">
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Zap className="h-5 w-5" />
                        <span>Quick Actions</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                      <Button className="w-full" variant="outline">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Video className="h-4 w-4 mr-2" />
                        Video Call
                      </Button>
                      <Button className="w-full" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Progress & Status (for clients) */}
                {selectedContact.type === 'client' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Therapy Progress</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span>Overall Progress</span>
                            <span className="font-medium">{selectedContact.progress}%</span>
                          </div>
                          <Progress value={selectedContact.progress} className="h-3" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-muted-foreground">Therapy Type</Label>
                            <p className="font-medium">{selectedContact.therapyType}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Current Mood</Label>
                            <p className="font-medium capitalize">{selectedContact.mood}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Last Session</Label>
                            <p className="font-medium">{new Date(selectedContact.lastSession).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Next Session</Label>
                            <p className="font-medium">{new Date(selectedContact.nextSession).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <span>Notes</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea 
                      defaultValue={selectedContact.notes}
                      placeholder="Add notes about this contact..."
                      className="min-h-[100px]"
                    />
                    <Button className="mt-3" variant="outline">
                      Save Notes
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="communication">
                <Card>
                  <CardHeader>
                    <CardTitle>Communication History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                        <div className="p-2 rounded-full bg-green-100">
                          <Phone className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Phone call</p>
                          <p className="text-sm text-muted-foreground">Discussed progress and next steps</p>
                        </div>
                        <span className="text-sm text-muted-foreground">2 days ago</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                        <div className="p-2 rounded-full bg-blue-100">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Email sent</p>
                          <p className="text-sm text-muted-foreground">Session reminder and preparation materials</p>
                        </div>
                        <span className="text-sm text-muted-foreground">1 week ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="therapy">
                {selectedContact.type === 'client' ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Therapy Plan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label>Current Focus</Label>
                            <p>Anxiety management and coping strategies</p>
                          </div>
                          <div>
                            <Label>Assigned Exercises</Label>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              <li>Daily breathing exercises</li>
                              <li>Thought challenging worksheets</li>
                              <li>Progressive muscle relaxation</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Session History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">Session #12</p>
                              <p className="text-sm text-muted-foreground">Cognitive restructuring techniques</p>
                            </div>
                            <span className="text-sm">Jan 15, 2024</span>
                          </div>
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">Session #11</p>
                              <p className="text-sm text-muted-foreground">Mindfulness and grounding exercises</p>
                            </div>
                            <span className="text-sm">Jan 8, 2024</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Therapy information is only available for clients.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Documents & Attachments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <FileText className="h-8 w-8 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium">Intake Form</p>
                          <p className="text-sm text-muted-foreground">PDF • 2.3 MB</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 border rounded-lg">
                        <FileText className="h-8 w-8 text-green-500" />
                        <div className="flex-1">
                          <p className="font-medium">Treatment Plan</p>
                          <p className="text-sm text-muted-foreground">PDF • 1.8 MB</p>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-background/50 to-background/30">
      {/* Sidebar */}
      <div className="w-64 bg-background/60 backdrop-blur-sm border-r border-primary/10 p-4">
        <div className="mb-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Contact Manager
          </h1>
          <p className="text-sm text-muted-foreground">
            Therapy-focused relationship hub
          </p>
        </div>

        {/* Stats */}
        <Card className="mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-primary">24</div>
                <div className="text-xs text-muted-foreground">Total Contacts</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">12</div>
                <div className="text-xs text-muted-foreground">Active Clients</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Types */}
        <div className="space-y-2">
          {contactTypes.map((type) => (
            <Button
              key={type.id}
              variant={selectedType === type.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setSelectedType(type.id)}
            >
              <type.icon className="h-4 w-4 mr-2" />
              <span className="flex-1 text-left">{type.label}</span>
              <Badge variant="secondary" className="ml-2">
                {type.count}
              </Badge>
            </Button>
          ))}
        </div>

        {/* AI Insights */}
        <Card className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">AI Insights</span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              💡 Follow up with Emma - missed last session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-primary/10 bg-background/60 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64 bg-background/80 backdrop-blur-sm"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  <SelectItem value="anxiety">Anxiety</SelectItem>
                  <SelectItem value="trauma">Trauma</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredContacts.length} contacts found
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
            : "space-y-3"
          }>
            {filteredContacts.map(renderContactCard)}
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No contacts found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Contact
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Contact Profile Modal */}
      {showProfile && renderContactProfile()}
    </div>
  );
};