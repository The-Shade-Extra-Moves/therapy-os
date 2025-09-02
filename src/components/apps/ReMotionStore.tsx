import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Grid3X3, List, Star, Download, Check,
  Gamepad, Dumbbell, Brain, Mic, Wrench, TrendingUp,
  Clock, Heart, Eye, ChevronRight, Trophy, Users,
  Bookmark, BookmarkCheck, Share2, MoreHorizontal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface StoreApp {
  id: string;
  name: string;
  developer: string;
  description: string;
  longDescription: string;
  category: 'games' | 'exercises' | 'ai' | 'multimedia' | 'utilities';
  price: number;
  rating: number;
  downloads: number;
  tags: string[];
  screenshots: string[];
  icon: React.ComponentType<any>;
  featured: boolean;
  isInstalled: boolean;
  version: string;
  size: string;
  lastUpdated: string;
  permissions: string[];
  changelog: string[];
  reviews: Array<{
    id: string;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }>;
}

const mockApps: StoreApp[] = [
  {
    id: 'mindfulness-games',
    name: 'Mindfulness Games Suite',
    developer: 'TherapyTech Studios',
    description: 'Interactive mindfulness games for anxiety management and focus training.',
    longDescription: 'A comprehensive collection of scientifically-backed mindfulness games designed to help patients develop coping strategies, reduce anxiety, and improve focus. Features guided breathing exercises, meditation challenges, and progress tracking.',
    category: 'games',
    price: 29.99,
    rating: 4.8,
    downloads: 12543,
    tags: ['mindfulness', 'anxiety', 'focus', 'meditation'],
    screenshots: [],
    icon: Gamepad,
    featured: true,
    isInstalled: false,
    version: '2.1.4',
    size: '156 MB',
    lastUpdated: '2 days ago',
    permissions: ['microphone', 'camera', 'storage'],
    changelog: ['Improved breathing exercise animations', 'Added new meditation soundscapes', 'Bug fixes and performance improvements'],
    reviews: [
      { id: '1', user: 'Dr. Sarah Chen', rating: 5, comment: 'Excellent tool for my anxiety patients. The guided exercises are well-designed.', date: '1 week ago' },
      { id: '2', user: 'Michael T.', rating: 4, comment: 'Really helpful games, my therapist recommended this.', date: '2 weeks ago' }
    ]
  },
  {
    id: 'movement-therapy',
    name: 'Movement Therapy Pro',
    developer: 'RehabWorks',
    description: 'Physical therapy exercises with motion tracking and progress analytics.',
    longDescription: 'Advanced movement therapy application that uses computer vision to track patient movements and provide real-time feedback. Perfect for physical rehabilitation and motor skill development.',
    category: 'exercises',
    price: 49.99,
    rating: 4.6,
    downloads: 8421,
    tags: ['physical therapy', 'rehabilitation', 'movement', 'tracking'],
    screenshots: [],
    icon: Dumbbell,
    featured: true,
    isInstalled: true,
    version: '1.8.2',
    size: '284 MB',
    lastUpdated: '1 week ago',
    permissions: ['camera', 'microphone', 'storage', 'motion sensors'],
    changelog: ['Enhanced motion detection accuracy', 'New exercise routines added', 'Improved progress analytics'],
    reviews: [
      { id: '3', user: 'Physical Therapy Clinic', rating: 5, comment: 'Game-changer for our practice. Patients love the interactive feedback.', date: '3 days ago' }
    ]
  },
  {
    id: 'ai-session-analyzer',
    name: 'AI Session Analyzer',
    developer: 'MindAI Solutions',
    description: 'AI-powered analysis of therapy sessions with mood tracking and insights.',
    longDescription: 'Cutting-edge AI technology that analyzes therapy sessions to provide insights into patient progress, mood patterns, and treatment effectiveness. Includes automated session summaries and recommendation engine.',
    category: 'ai',
    price: 79.99,
    rating: 4.9,
    downloads: 5234,
    tags: ['ai', 'analysis', 'mood tracking', 'insights', 'nlp'],
    screenshots: [],
    icon: Brain,
    featured: true,
    isInstalled: false,
    version: '3.0.1',
    size: '512 MB',
    lastUpdated: '4 days ago',
    permissions: ['microphone', 'storage', 'internet'],
    changelog: ['New sentiment analysis models', 'Improved session transcription', 'Enhanced privacy controls'],
    reviews: [
      { id: '4', user: 'Dr. James Wilson', rating: 5, comment: 'Incredible insights into patient progress. The AI recommendations are spot-on.', date: '5 days ago' }
    ]
  },
  {
    id: 'biofeedback-monitor',
    name: 'Biofeedback Monitor',
    developer: 'BioSense Technologies',
    description: 'Real-time biofeedback monitoring with heart rate and stress level tracking.',
    longDescription: 'Professional-grade biofeedback monitoring system that tracks physiological responses during therapy sessions. Includes heart rate variability, stress indicators, and relaxation training modules.',
    category: 'multimedia',
    price: 159.99,
    rating: 4.7,
    downloads: 3156,
    tags: ['biofeedback', 'heart rate', 'stress', 'monitoring'],
    screenshots: [],
    icon: Heart,
    featured: false,
    isInstalled: false,
    version: '2.5.0',
    size: '98 MB',
    lastUpdated: '1 week ago',
    permissions: ['camera', 'microphone', 'bluetooth', 'storage'],
    changelog: ['Added Bluetooth device support', 'Improved data visualization', 'New relaxation protocols'],
    reviews: []
  },
  {
    id: 'therapy-scheduler',
    name: 'Smart Therapy Scheduler',
    developer: 'ScheduleWise',
    description: 'Intelligent appointment scheduling with patient preferences and availability optimization.',
    longDescription: 'Advanced scheduling system that learns from patient preferences, therapist availability, and optimal appointment timing to maximize treatment effectiveness and reduce no-shows.',
    category: 'utilities',
    price: 39.99,
    rating: 4.4,
    downloads: 9876,
    tags: ['scheduling', 'appointments', 'optimization', 'calendar'],
    screenshots: [],
    icon: Clock,
    featured: false,
    isInstalled: true,
    version: '1.6.3',
    size: '67 MB',
    lastUpdated: '3 days ago',
    permissions: ['calendar', 'notifications', 'storage'],
    changelog: ['Improved conflict detection', 'Added group session support', 'Enhanced notification system'],
    reviews: [
      { id: '5', user: 'Therapy Center Admin', rating: 4, comment: 'Great for managing complex schedules, saves us hours each week.', date: '1 week ago' }
    ]
  },
  {
    id: 'cognitive-training',
    name: 'Cognitive Training Games',
    developer: 'NeuroGames Inc.',
    description: 'Evidence-based cognitive training exercises for memory, attention, and problem-solving.',
    longDescription: 'Scientifically designed cognitive training games that target specific cognitive functions. Perfect for patients recovering from brain injuries or looking to improve cognitive performance.',
    category: 'games',
    price: 34.99,
    rating: 4.5,
    downloads: 15420,
    tags: ['cognitive', 'memory', 'attention', 'brain training'],
    screenshots: [],
    icon: Eye,
    featured: false,
    isInstalled: false,
    version: '4.2.1',
    size: '203 MB',
    lastUpdated: '5 days ago',
    permissions: ['storage', 'microphone'],
    changelog: ['New memory training modules', 'Adaptive difficulty system', 'Progress tracking improvements'],
    reviews: [
      { id: '6', user: 'Neuropsychologist', rating: 5, comment: 'Excellent cognitive assessment and training tools. Patients see real improvements.', date: '2 weeks ago' }
    ]
  }
];

const categories = [
  { id: 'all', name: 'All Apps', icon: Grid3X3 },
  { id: 'games', name: 'Games', icon: Gamepad },
  { id: 'exercises', name: 'Exercises', icon: Dumbbell },
  { id: 'ai', name: 'AI Tools', icon: Brain },
  { id: 'multimedia', name: 'Multimedia', icon: Mic },
  { id: 'utilities', name: 'Utilities', icon: Wrench },
];

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'recent', label: 'Recently Updated' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

export const ReMotionStore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedApp, setSelectedApp] = useState<StoreApp | null>(null);
  const [installedApps, setInstalledApps] = useState<Set<string>>(
    new Set(mockApps.filter(app => app.isInstalled).map(app => app.id))
  );
  const [wishlistApps, setWishlistApps] = useState<Set<string>>(new Set());

  const filteredApps = useMemo(() => {
    let filtered = mockApps.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort apps
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        case 'popular':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const featuredApps = mockApps.filter(app => app.featured);

  const handleInstall = (appId: string) => {
    setInstalledApps(prev => new Set([...prev, appId]));
  };

  const handleUninstall = (appId: string) => {
    setInstalledApps(prev => {
      const newSet = new Set(prev);
      newSet.delete(appId);
      return newSet;
    });
  };

  const toggleWishlist = (appId: string) => {
    setWishlistApps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appId)) {
        newSet.delete(appId);
      } else {
        newSet.add(appId);
      }
      return newSet;
    });
  };

  const AppDetailModal = ({ app }: { app: StoreApp }) => (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
      <DialogHeader>
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <app.icon className="h-12 w-12 text-primary" />
          </div>
          <div className="flex-1">
            <DialogTitle className="text-2xl font-bold">{app.name}</DialogTitle>
            <DialogDescription className="text-base mt-1">
              by {app.developer}
            </DialogDescription>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{app.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Download className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{app.downloads.toLocaleString()}</span>
              </div>
              <Badge variant="secondary">{app.category}</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              ${app.price}
            </div>
            <div className="text-sm text-muted-foreground">
              v{app.version}
            </div>
          </div>
        </div>
      </DialogHeader>

      <ScrollArea className="max-h-[60vh] pr-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="changelog">Updates</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground leading-relaxed">{app.longDescription}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Features</h4>
              <div className="flex flex-wrap gap-2">
                {app.tags.map(tag => (
                  <Badge key={tag} variant="outline">#{tag}</Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4 pt-4">
              <Button
                className="flex-1"
                onClick={() => installedApps.has(app.id) ? handleUninstall(app.id) : handleInstall(app.id)}
              >
                {installedApps.has(app.id) ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Installed
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Install - ${app.price}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => toggleWishlist(app.id)}
              >
                {wishlistApps.has(app.id) ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">User Reviews</h4>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{app.rating}</span>
                <span className="text-muted-foreground">({app.reviews.length} reviews)</span>
              </div>
            </div>
            <div className="space-y-4">
              {app.reviews.map(review => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{review.user}</div>
                        <div className="text-sm text-muted-foreground">{review.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="changelog" className="space-y-4">
            <h4 className="font-semibold">What's New in v{app.version}</h4>
            <div className="space-y-2">
              {app.changelog.map((change, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-muted-foreground">{change}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">App Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version:</span>
                    <span>{app.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span>{app.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated:</span>
                    <span>{app.lastUpdated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Downloads:</span>
                    <span>{app.downloads.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Permissions</h4>
                <div className="space-y-1">
                  {app.permissions.map(permission => (
                    <div key={permission} className="text-sm text-muted-foreground">
                      • {permission}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </DialogContent>
  );

  const AppCard = ({ app, isCompact = false }: { app: StoreApp; isCompact?: boolean }) => {
    const isInstalled = installedApps.has(app.id);
    const isWishlisted = wishlistApps.has(app.id);

    if (isCompact) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200"
        >
          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
            <app.icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold truncate">{app.name}</h3>
              {app.featured && <Badge variant="secondary" className="h-5 text-xs">Featured</Badge>}
            </div>
            <p className="text-sm text-muted-foreground truncate">{app.description}</p>
            <div className="flex items-center space-x-3 mt-1">
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{app.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">by {app.developer}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="font-bold text-primary">${app.price}</div>
              {isInstalled && <div className="text-xs text-green-600">Installed</div>}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)}>
                  View
                </Button>
              </DialogTrigger>
              {selectedApp && <AppDetailModal app={selectedApp} />}
            </Dialog>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -2 }}
        className="group"
      >
        <Card className="h-full hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-primary/10 mb-3">
                <app.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => toggleWishlist(app.id)}
                >
                  {isWishlisted ? (
                    <BookmarkCheck className="h-4 w-4 text-primary" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <CardTitle className="text-lg leading-tight">{app.name}</CardTitle>
                {app.featured && <Badge variant="secondary" className="h-5">Featured</Badge>}
              </div>
              <div className="text-sm text-muted-foreground mb-2">by {app.developer}</div>
              <CardDescription className="line-clamp-2">{app.description}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{app.rating}</span>
                <span className="text-sm text-muted-foreground">({app.downloads.toLocaleString()})</span>
              </div>
              <Badge variant="outline" className="capitalize">{app.category}</Badge>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {app.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
              ))}
            </div>
          </CardContent>

          <CardFooter className="pt-0">
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">${app.price}</span>
                {isInstalled && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Check className="h-4 w-4" />
                    <span className="text-sm font-medium">Installed</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  variant={isInstalled ? "outline" : "default"}
                  onClick={() => isInstalled ? handleUninstall(app.id) : handleInstall(app.id)}
                >
                  {isInstalled ? 'Remove' : 'Install'}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => setSelectedApp(app)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  {selectedApp && <AppDetailModal app={selectedApp} />}
                </Dialog>
              </div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">ReMotion Store</h1>
              <p className="text-muted-foreground">Discover therapy apps, tools, and AI-powered solutions</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search apps, exercises, AI tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r bg-background/50 p-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                Categories
              </h3>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <category.icon className="h-4 w-4 mr-2" />
                  {category.name}
                </Button>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium">{mockApps.length}</div>
                    <div className="text-muted-foreground">Total Apps</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <div className="text-sm">
                    <div className="font-medium">{featuredApps.length}</div>
                    <div className="text-muted-foreground">Featured</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-500" />
                  <div className="text-sm">
                    <div className="font-medium">{installedApps.size}</div>
                    <div className="text-muted-foreground">Installed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-8">
                {/* Featured Apps Section */}
                {!searchQuery && selectedCategory === 'all' && (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <h2 className="text-xl font-semibold">Featured Apps</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                      {featuredApps.map(app => (
                        <AppCard key={app.id} app={app} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Apps Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">
                      {searchQuery ? 'Search Results' : selectedCategory === 'all' ? 'All Apps' : 
                       categories.find(c => c.id === selectedCategory)?.name || 'Apps'}
                    </h2>
                    <div className="text-sm text-muted-foreground">
                      {filteredApps.length} app{filteredApps.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                   {filteredApps.length === 0 ? (
                     <div className="text-center py-12">
                       <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                       <h3 className="text-lg font-semibold mb-2">No apps found</h3>
                       <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
                     </div>
                  ) : (
                    <div className={viewMode === 'grid' 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                    }>
                      {filteredApps.map(app => (
                        <AppCard key={app.id} app={app} isCompact={viewMode === 'list'} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
};