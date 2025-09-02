import React, { useState, useMemo } from 'react';
import { Search, Grid, List, Star, Download, Shield, Users, Zap, Brain, Activity, Heart, Sparkles, Filter, ChevronRight, Play, Eye, Award, TrendingUp, Clock, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

// Types
interface App {
  id: string;
  name: string;
  description: string;
  category: string;
  developer: string;
  rating: number;
  downloads: number;
  price: string;
  featured: boolean;
  trending: boolean;
  verified: boolean;
  tags: string[];
  screenshots: string[];
  icon: string;
  version: string;
  size: string;
  compatibility: string[];
  lastUpdated: string;
  permissions: string[];
  reviews: Review[];
}

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

// Mock data
const featuredApps: App[] = [
  {
    id: 'ai-session-assistant',
    name: 'AI Session Assistant',
    description: 'Real-time transcription, summarization, and therapeutic suggestions powered by advanced AI',
    category: 'AI Plugins',
    developer: 'ReMotion AI Lab',
    rating: 4.9,
    downloads: 15420,
    price: 'Free',
    featured: true,
    trending: true,
    verified: true,
    tags: ['AI', 'Transcription', 'Real-time', 'HIPAA Compliant'],
    screenshots: [],
    icon: '🤖',
    version: '2.1.4',
    size: '45 MB',
    compatibility: ['Desktop', 'Mobile', 'Web'],
    lastUpdated: '2 days ago',
    permissions: ['Microphone Access', 'Session Recording'],
    reviews: [
      { id: '1', author: 'Dr. Sarah Chen', rating: 5, comment: 'Revolutionary tool that has transformed my practice. The AI suggestions are remarkably insightful.', date: '1 week ago', verified: true },
      { id: '2', author: 'Michael Rodriguez', rating: 5, comment: 'Incredibly accurate transcription and the summary features save me hours of documentation time.', date: '2 weeks ago', verified: true }
    ]
  },
  {
    id: 'emotion-ai-tracker',
    name: 'Emotion AI Tracker',
    description: 'Advanced facial expression and voice tone analysis for deeper emotional insights',
    category: 'AI Plugins',
    developer: 'Therapeutic Insights Inc.',
    rating: 4.7,
    downloads: 8930,
    price: '$29.99/month',
    featured: true,
    trending: false,
    verified: true,
    tags: ['Emotion Detection', 'Voice Analysis', 'Facial Recognition', 'Research'],
    screenshots: [],
    icon: '😊',
    version: '1.8.2',
    size: '78 MB',
    compatibility: ['Desktop', 'Web'],
    lastUpdated: '1 week ago',
    permissions: ['Camera Access', 'Microphone Access', 'Data Processing'],
    reviews: []
  },
  {
    id: 'cbt-flow-builder',
    name: 'CBT Flow Builder',
    description: 'Interactive cognitive behavioral therapy workflows with pre-built templates and customization',
    category: 'Therapy Tools',
    developer: 'MindFlow Studios',
    rating: 4.8,
    downloads: 12100,
    price: 'Free',
    featured: true,
    trending: true,
    verified: true,
    tags: ['CBT', 'Workflows', 'Templates', 'Interactive'],
    screenshots: [],
    icon: '🧠',
    version: '3.2.1',
    size: '32 MB',
    compatibility: ['Desktop', 'Mobile', 'Tablet'],
    lastUpdated: '3 days ago',
    permissions: ['Local Storage', 'Export Data'],
    reviews: []
  }
];

const allApps: App[] = [
  ...featuredApps,
  {
    id: 'trauma-tracker',
    name: 'Trauma Tracker',
    description: 'Specialized journaling and progress visualization for trauma therapy',
    category: 'Therapy Tools',
    developer: 'Healing Path Technologies',
    rating: 4.6,
    downloads: 6780,
    price: '$19.99/month',
    featured: false,
    trending: true,
    verified: true,
    tags: ['Trauma', 'Journaling', 'Progress Tracking', 'PTSD'],
    screenshots: [],
    icon: '🌱',
    version: '2.0.3',
    size: '28 MB',
    compatibility: ['Desktop', 'Mobile'],
    lastUpdated: '5 days ago',
    permissions: ['Secure Storage', 'Backup Services'],
    reviews: []
  },
  {
    id: 'mindfulness-vr',
    name: 'Mindfulness VR',
    description: 'Immersive guided meditation and mindfulness exercises in virtual reality',
    category: 'Wellness Apps',
    developer: 'Zen Reality Labs',
    rating: 4.9,
    downloads: 4250,
    price: '$39.99',
    featured: false,
    trending: false,
    verified: true,
    tags: ['VR', 'Meditation', 'Mindfulness', 'Immersive'],
    screenshots: [],
    icon: '🧘',
    version: '1.5.0',
    size: '125 MB',
    compatibility: ['VR Headsets', 'Desktop'],
    lastUpdated: '1 week ago',
    permissions: ['VR Hardware Access', 'Audio Processing'],
    reviews: []
  },
  {
    id: 'patient-journal',
    name: 'Patient Journal',
    description: 'Private journaling with AI mood tracking and insights for patients',
    category: 'Wellness Apps',
    developer: 'Personal Growth Apps',
    rating: 4.5,
    downloads: 18920,
    price: 'Free',
    featured: false,
    trending: true,
    verified: true,
    tags: ['Journaling', 'Mood Tracking', 'AI Insights', 'Privacy'],
    screenshots: [],
    icon: '📔',
    version: '4.1.7',
    size: '15 MB',
    compatibility: ['Mobile', 'Desktop', 'Web'],
    lastUpdated: '2 days ago',
    permissions: ['Local Storage', 'Notification Services'],
    reviews: []
  },
  {
    id: 'therapy-outcome-tracker',
    name: 'Therapy Outcome Tracker',
    description: 'Comprehensive data dashboard for tracking patient progress and therapy outcomes',
    category: 'Analytics & Research',
    developer: 'Data Driven Therapy',
    rating: 4.7,
    downloads: 3420,
    price: '$49.99/month',
    featured: false,
    trending: false,
    verified: true,
    tags: ['Analytics', 'Progress Tracking', 'Dashboard', 'Outcomes'],
    screenshots: [],
    icon: '📊',
    version: '2.3.1',
    size: '67 MB',
    compatibility: ['Desktop', 'Web'],
    lastUpdated: '4 days ago',
    permissions: ['Data Processing', 'Report Generation'],
    reviews: []
  }
];

const categories = [
  { id: 'featured', name: 'Featured', icon: Sparkles, count: 3 },
  { id: 'therapy-tools', name: 'Therapy Tools', icon: Brain, count: 8 },
  { id: 'ai-plugins', name: 'AI Plugins', icon: Zap, count: 12 },
  { id: 'wellness-apps', name: 'Wellness Apps', icon: Heart, count: 15 },
  { id: 'analytics', name: 'Analytics & Research', icon: Activity, count: 6 },
  { id: 'integrations', name: 'Integrations', icon: Globe, count: 9 }
];

export default function ReMotionStore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  const filteredApps = useMemo(() => {
    let apps = selectedCategory === 'featured' ? featuredApps : allApps;
    
    if (searchQuery) {
      apps = apps.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedCategory !== 'featured') {
      apps = apps.filter(app => 
        app.category.toLowerCase().replace(/\s+/g, '-').replace('&', '').replace(/\s+/g, '-') === selectedCategory
      );
    }
    
    // Sort apps
    apps = [...apps].sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'downloads': return b.downloads - a.downloads;
        case 'recent': return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default: return b.featured ? 1 : -1;
      }
    });
    
    return apps;
  }, [searchQuery, selectedCategory, sortBy]);

  const AppCard = ({ app, isListView = false }: { app: App; isListView?: boolean }) => (
    <Card className={`group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-lg ${isListView ? 'flex items-center p-4' : ''}`}>
      <CardContent className={`${isListView ? 'flex items-center space-x-4 flex-1 p-0' : 'p-6'}`}>
        <div className={`${isListView ? 'flex items-center space-x-4 flex-1' : ''}`}>
          <div className={`${isListView ? 'flex-shrink-0' : 'flex items-center justify-between mb-4'}`}>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl backdrop-blur-sm">
                {app.icon}
              </div>
              {!isListView && (
                <div className="flex items-center space-x-2">
                  {app.verified && <Shield className="w-4 h-4 text-green-500" />}
                  {app.trending && <TrendingUp className="w-4 h-4 text-orange-500" />}
                  {app.featured && <Award className="w-4 h-4 text-yellow-500" />}
                </div>
              )}
            </div>
          </div>
          
          <div className={`${isListView ? 'flex-1' : ''}`}>
            <div className={`${isListView ? 'flex items-start justify-between' : ''}`}>
              <div>
                <h3 className="font-semibold text-lg mb-1">{app.name}</h3>
                <p className={`text-muted-foreground text-sm ${isListView ? 'max-w-md' : 'mb-3'}`}>
                  {app.description}
                </p>
              </div>
              
              {isListView && (
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{app.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>{app.downloads.toLocaleString()}</span>
                  </div>
                  <span className="font-medium text-primary">{app.price}</span>
                </div>
              )}
            </div>
            
            {!isListView && (
              <>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{app.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="w-4 h-4" />
                    <span>{app.downloads.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{app.lastUpdated}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {app.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <div className={`${isListView ? 'flex items-center space-x-2' : 'flex items-center justify-between'}`}>
            <span className={`font-medium text-primary ${isListView ? 'hidden' : ''}`}>{app.price}</span>
            <div className="flex items-center space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                </DialogTrigger>
              </Dialog>
              <Button size="sm" className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300">
                <Download className="w-4 h-4 mr-1" />
                Install
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header with Search */}
      <div className="p-6 border-b bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ReMotionOS App Store
              </h1>
              <p className="text-muted-foreground mt-1">
                The Ultimate Therapist Store for Plugins, Apps & Tools
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search apps, plugins, and tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 backdrop-blur-sm border-0 ring-1 ring-border/50"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-background/50 backdrop-blur-sm border-0 ring-1 ring-border/50">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="downloads">Most Downloaded</SelectItem>
                  <SelectItem value="recent">Recently Updated</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="bg-background/50 backdrop-blur-sm border-0 ring-1 ring-border/50">
                <Filter className="w-4 h-4 mr-1" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Categories */}
        <div className="w-64 border-r bg-background/40 backdrop-blur-lg p-4">
          <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
            Categories
          </h3>
          <nav className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border border-primary/20'
                    : 'hover:bg-background/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <category.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <Badge variant="secondary" className="text-xs bg-muted">
                  {category.count}
                </Badge>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            <div className="p-6">
              {/* Featured Hero Banner (only on featured tab) */}
              {selectedCategory === 'featured' && (
                <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 p-8 border border-primary/20 backdrop-blur-lg">
                  <div className="max-w-4xl">
                    <div className="flex items-center space-x-2 mb-4">
                      <Sparkles className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold">Featured This Week</h2>
                    </div>
                    <p className="text-lg text-muted-foreground mb-6">
                      Discover the latest breakthrough in AI-assisted therapy with our curated selection of premium tools.
                    </p>
                    <div className="flex items-center space-x-4">
                      <Button className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300">
                        <Play className="w-4 h-4 mr-2" />
                        Watch Demo
                      </Button>
                      <Button variant="outline" className="backdrop-blur-sm">
                        <ChevronRight className="w-4 h-4 mr-2" />
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Apps Grid/List */}
              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                  : 'space-y-4'
              }`}>
                {filteredApps.map((app) => (
                  <AppCard key={app.id} app={app} isListView={viewMode === 'list'} />
                ))}
              </div>

              {filteredApps.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No apps found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or browse different categories.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* App Detail Modal */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          {selectedApp && (
            <div className="flex flex-col h-full">
              <DialogHeader className="p-6 border-b">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-3xl backdrop-blur-sm">
                    {selectedApp.icon}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl mb-2">{selectedApp.name}</DialogTitle>
                    <p className="text-muted-foreground mb-3">{selectedApp.description}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{selectedApp.rating}</span>
                        <span className="text-muted-foreground">({selectedApp.reviews.length} reviews)</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>{selectedApp.downloads.toLocaleString()} installs</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <Shield className="w-3 h-3 mr-1" />
                        HIPAA Verified
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary mb-2">{selectedApp.price}</div>
                    <Button className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300">
                      <Download className="w-4 h-4 mr-2" />
                      Install Now
                    </Button>
                  </div>
                </div>
              </DialogHeader>
              
              <ScrollArea className="flex-1 p-6">
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedApp.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Compatibility</h3>
                      <div className="flex space-x-2">
                        {selectedApp.compatibility.map(platform => (
                          <Badge key={platform} variant="outline">{platform}</Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="reviews" className="space-y-4">
                    {selectedApp.reviews.length > 0 ? (
                      selectedApp.reviews.map(review => (
                        <Card key={review.id} className="p-4">
                          <div className="flex items-start space-x-3">
                            <Avatar>
                              <AvatarFallback>{review.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium">{review.author}</span>
                                {review.verified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                                <span className="text-xs text-muted-foreground">{review.date}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">{review.comment}</p>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No reviews yet. Be the first to review this app!
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Version</h4>
                        <p className="text-sm text-muted-foreground">{selectedApp.version}</p>
                      </Card>
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Size</h4>
                        <p className="text-sm text-muted-foreground">{selectedApp.size}</p>
                      </Card>
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Developer</h4>
                        <p className="text-sm text-muted-foreground">{selectedApp.developer}</p>
                      </Card>
                      <Card className="p-4">
                        <h4 className="font-medium mb-2">Last Updated</h4>
                        <p className="text-sm text-muted-foreground">{selectedApp.lastUpdated}</p>
                      </Card>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="permissions" className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-3">This app requires access to:</h3>
                      <div className="space-y-2">
                        {selectedApp.permissions.map(permission => (
                          <div key={permission} className="flex items-center space-x-2 p-2 rounded-lg bg-muted/50">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="text-sm">{permission}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}