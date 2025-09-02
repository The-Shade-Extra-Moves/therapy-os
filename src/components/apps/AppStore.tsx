import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Star, Download, Grid3X3, List, Package, X, Shield,
  Clock, ExternalLink, ChevronLeft, Heart, Share, Flag
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface App {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: string;
  category: string;
  rating: number;
  reviews: number;
  downloads: string;
  price: string;
  screenshots: string[];
  developer: string;
  version: string;
  size: string;
  featured: boolean;
  installed: boolean;
  tags: string[];
  changelog: string[];
  permissions: string[];
}

const mockApps: App[] = [
  {
    id: '1',
    name: 'Mindfulness Tracker',
    description: 'Track meditation sessions and mindfulness exercises with detailed analytics and progress tracking.',
    longDescription: 'A comprehensive mindfulness application designed specifically for therapeutic environments. Features include guided meditation sessions, breathing exercises, progress tracking, mood correlation analysis, and detailed reporting for healthcare providers.',
    icon: '🧘',
    category: 'Therapy Tools',
    rating: 4.8,
    reviews: 2847,
    downloads: '10K+',
    price: 'Free',
    screenshots: ['screenshot1.jpg', 'screenshot2.jpg'],
    developer: 'MindfulTech',
    version: '2.1.0',
    size: '12 MB',
    featured: true,
    installed: false,
    tags: ['mindfulness', 'meditation', 'wellness', 'therapy'],
    changelog: ['Fixed progress sync issues', 'Added new breathing patterns', 'Improved UI responsiveness'],
    permissions: ['Microphone', 'Notifications', 'Camera (optional)'],
  },
  {
    id: '2',
    name: 'Cognitive Exercises',
    description: 'Interactive cognitive training games designed for therapeutic interventions.',
    longDescription: 'Evidence-based cognitive training platform with over 50 interactive exercises targeting memory, attention, executive function, and processing speed. Includes detailed progress tracking and customizable difficulty levels.',
    icon: '🧠',
    category: 'Games',
    rating: 4.6,
    reviews: 1523,
    downloads: '5K+',
    price: '$9.99',
    screenshots: ['game1.jpg', 'game2.jpg', 'game3.jpg'],
    developer: 'CogniPlay',
    version: '1.5.2',
    size: '25 MB',
    featured: true,
    installed: true,
    tags: ['cognitive', 'brain training', 'memory', 'games'],
    changelog: ['New memory games added', 'Performance optimizations', 'Bug fixes'],
    permissions: ['Storage', 'Notifications'],
  },
  {
    id: '3',
    name: 'AI Therapy Assistant',
    description: 'AI-powered therapy support with natural language processing.',
    longDescription: 'Advanced AI assistant designed to support therapy sessions with real-time transcription, sentiment analysis, intervention suggestions, and automated session notes. HIPAA compliant with end-to-end encryption.',
    icon: '🤖',
    category: 'AI Tools',
    rating: 4.9,
    reviews: 756,
    downloads: '3K+',
    price: '$29.99',
    screenshots: ['ai1.jpg', 'ai2.jpg', 'ai3.jpg'],
    developer: 'AITherapy Solutions',
    version: '2.0.0',
    size: '45 MB',
    featured: true,
    installed: false,
    tags: ['AI', 'transcription', 'therapy', 'assistant'],
    changelog: ['Major AI model upgrade', 'Improved accuracy', 'New intervention database'],
    permissions: ['Microphone', 'Storage', 'Network'],
  },
  {
    id: '4',
    name: 'Virtual Reality Exposure',
    description: 'VR exposure therapy environments for phobia treatment.',
    longDescription: 'Immersive virtual reality environments designed for exposure therapy treatment of phobias, PTSD, and anxiety disorders. Includes customizable scenarios, progress tracking, and therapist controls.',
    icon: '🥽',
    category: 'Multimedia',
    rating: 4.5,
    reviews: 234,
    downloads: '1K+',
    price: '$49.99',
    screenshots: ['vr1.jpg', 'vr2.jpg'],
    developer: 'VR Therapeutics',
    version: '1.3.0',
    size: '120 MB',
    featured: false,
    installed: false,
    tags: ['VR', 'exposure therapy', 'phobia', 'immersive'],
    changelog: ['New environments added', 'Improved graphics', 'Better comfort settings'],
    permissions: ['Camera', 'Sensors', 'Storage'],
  },
  {
    id: '5',
    name: 'Mood Journal',
    description: 'Digital journaling tool with mood tracking and sentiment analysis.',
    longDescription: 'Advanced mood tracking and journaling application with AI-powered sentiment analysis, pattern recognition, and personalized insights. Helps patients and therapists identify emotional patterns and triggers.',
    icon: '📝',
    category: 'Therapy Tools',
    rating: 4.9,
    reviews: 4251,
    downloads: '15K+',
    price: 'Free',
    screenshots: ['journal1.jpg', 'journal2.jpg'],
    developer: 'TherapyTools Inc',
    version: '3.0.1',
    size: '8 MB',
    featured: false,
    installed: false,
    tags: ['journaling', 'mood', 'AI', 'mental health'],
    changelog: ['AI sentiment analysis improved', 'New export options', 'Privacy enhancements'],
    permissions: ['Storage', 'Notifications'],
  },
  {
    id: '6',
    name: 'Session Manager Pro',
    description: 'Complete session management and scheduling platform.',
    longDescription: 'Professional therapy session management with scheduling, notes, billing integration, client progress tracking, and comprehensive reporting. Designed for individual practitioners and clinics.',
    icon: '📅',
    category: 'Utilities',
    rating: 4.7,
    reviews: 892,
    downloads: '5K+',
    price: '$19.99',
    screenshots: ['session1.jpg', 'session2.jpg'],
    developer: 'TherapyPro Systems',
    version: '3.2.1',
    size: '28 MB',
    featured: false,
    installed: false,
    tags: ['scheduling', 'sessions', 'billing', 'management'],
    changelog: ['New billing features', 'Improved calendar sync', 'Bug fixes'],
    permissions: ['Calendar', 'Storage', 'Network'],
  },
];

const categories = [
  'All', 'Therapy Tools', 'Games', 'AI Tools', 'Multimedia', 'Utilities'
];

export const AppStore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [installedApps, setInstalledApps] = useState<Set<string>>(new Set(['2']));

  const filteredApps = mockApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'downloads':
        return parseInt(b.downloads) - parseInt(a.downloads);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'popularity':
        return b.reviews - a.reviews;
      default: // featured
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

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

  const AppDetailModal: React.FC<{ app: App; onClose: () => void }> = ({ app, onClose }) => {
    const isInstalled = installedApps.has(app.id);
    
    return (
      <Dialog open={!!app} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="text-5xl">{app.icon}</div>
                <div>
                  <DialogTitle className="text-2xl">{app.name}</DialogTitle>
                  <p className="text-muted-foreground">{app.developer}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{app.rating}</span>
                      <span className="text-muted-foreground">({app.reviews} reviews)</span>
                    </div>
                    <Badge>{app.category}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl font-bold text-primary">{app.price}</span>
                  <div className="text-sm text-muted-foreground">
                    <div>{app.downloads} downloads</div>
                    <div>{app.size} • Version {app.version}</div>
                  </div>
                </div>
                <Button 
                  size="lg"
                  variant={isInstalled ? "secondary" : "default"}
                  onClick={() => isInstalled ? handleUninstall(app.id) : handleInstall(app.id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isInstalled ? 'Uninstall' : 'Install'}
                </Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{app.longDescription}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {app.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">What's New</h3>
                <ul className="space-y-1">
                  {app.changelog.map((change, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Permissions</h3>
                <div className="space-y-2">
                  {app.permissions.map(permission => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  };

  const AppCard: React.FC<{ app: App; compact?: boolean }> = ({ app, compact = false }) => {
    const isInstalled = installedApps.has(app.id);
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        whileHover={{ scale: 1.02 }}
        className="cursor-pointer"
        onClick={() => setSelectedApp(app)}
      >
        <Card className="h-full hover:shadow-lg transition-all duration-200 border hover:border-primary/20">
          <CardHeader className={compact ? "pb-2" : "pb-4"}>
            <div className="flex items-start space-x-3">
              <div className="text-4xl">{app.icon}</div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg leading-tight">{app.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {app.developer}
                </CardDescription>
                <div className="flex items-center space-x-2 mt-1 flex-wrap">
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{app.rating}</span>
                    <span className="text-xs text-muted-foreground">({app.reviews})</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {app.category}
                  </Badge>
                  {isInstalled && (
                    <Badge variant="default" className="text-xs">
                      Installed
                    </Badge>
                  )}
                  {app.featured && (
                    <Badge variant="outline" className="text-xs border-primary text-primary">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {app.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {app.downloads} • {app.size}
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-primary">{app.price}</span>
                <Button 
                  size="sm" 
                  className="h-8"
                  variant={isInstalled ? "secondary" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    isInstalled ? handleUninstall(app.id) : handleInstall(app.id);
                  }}
                >
                  <Download className="w-3 h-3 mr-1" />
                  {isInstalled ? 'Remove' : 'Get'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">App Store</h1>
            <p className="text-muted-foreground">Discover therapy tools and wellness apps</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
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

        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search apps, categories, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background text-foreground"
          >
            <option value="featured">Featured</option>
            <option value="rating">Top Rated</option>
            <option value="popularity">Most Popular</option>
            <option value="downloads">Most Downloaded</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full">
          <div className="px-6 py-4 border-b">
            <TabsList className="h-auto p-1">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="px-4 py-2"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((category) => (
            <TabsContent key={category} value={category} className="p-6 mt-0">
              {category === 'All' && featuredApps.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-yellow-500" />
                    Featured Apps
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredApps.map((app) => (
                      <AppCard key={app.id} app={app} />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {category === 'All' ? 'All Apps' : category}
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {filteredApps.length} app{filteredApps.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={`${selectedCategory}-${viewMode}-${sortBy}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`grid gap-4 ${
                      viewMode === 'grid' 
                        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                        : 'grid-cols-1'
                    }`}
                  >
                    {filteredApps.map((app) => (
                      <AppCard 
                        key={app.id} 
                        app={app} 
                        compact={viewMode === 'list'} 
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>

                {filteredApps.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No apps found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or category filters
                    </p>
                  </motion.div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {selectedApp && (
        <AppDetailModal 
          app={selectedApp} 
          onClose={() => setSelectedApp(null)} 
        />
      )}
    </div>
  );
};