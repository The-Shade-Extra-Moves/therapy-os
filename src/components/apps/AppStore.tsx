import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Star, Download, Filter, Grid3X3, List,
  Package, Brain, Gamepad2, Stethoscope, 
  FileText, Image, Video, Music, Calculator
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rating: number;
  downloads: string;
  price: string;
  screenshots: string[];
  developer: string;
  version: string;
  size: string;
  featured: boolean;
}

const mockApps: App[] = [
  {
    id: '1',
    name: 'Mindfulness Tracker',
    description: 'Track meditation sessions and mindfulness exercises with detailed analytics and progress tracking.',
    icon: '🧘',
    category: 'Therapy Tools',
    rating: 4.8,
    downloads: '10K+',
    price: 'Free',
    screenshots: [],
    developer: 'MindfulTech',
    version: '2.1.0',
    size: '12 MB',
    featured: true,
  },
  {
    id: '2',
    name: 'Cognitive Exercises',
    description: 'Interactive cognitive training games designed for therapeutic interventions.',
    icon: '🧠',
    category: 'Games',
    rating: 4.6,
    downloads: '5K+',
    price: '$9.99',
    screenshots: [],
    developer: 'CogniPlay',
    version: '1.5.2',
    size: '25 MB',
    featured: true,
  },
  {
    id: '3',
    name: 'Mood Journal',
    description: 'Digital journaling tool with mood tracking and sentiment analysis.',
    icon: '📝',
    category: 'Therapy Tools',
    rating: 4.9,
    downloads: '15K+',
    price: 'Free',
    screenshots: [],
    developer: 'TherapyTools Inc',
    version: '3.0.1',
    size: '8 MB',
    featured: false,
  },
  {
    id: '4',
    name: 'Breathing Coach',
    description: 'Guided breathing exercises with customizable patterns and biofeedback.',
    icon: '🫁',
    category: 'Wellness',
    rating: 4.7,
    downloads: '8K+',
    price: '$4.99',
    screenshots: [],
    developer: 'BreathEasy',
    version: '1.8.0',
    size: '15 MB',
    featured: true,
  },
  {
    id: '5',
    name: 'Group Session Manager',
    description: 'Manage group therapy sessions with scheduling and progress tracking.',
    icon: '👥',
    category: 'Productivity',
    rating: 4.5,
    downloads: '3K+',
    price: '$19.99',
    screenshots: [],
    developer: 'GroupTherapy Pro',
    version: '2.3.0',
    size: '18 MB',
    featured: false,
  },
  {
    id: '6',
    name: 'Art Therapy Studio',
    description: 'Digital art creation tools designed for therapeutic expression.',
    icon: '🎨',
    category: 'Creative',
    rating: 4.4,
    downloads: '7K+',
    price: '$14.99',
    screenshots: [],
    developer: 'ArtHealing',
    version: '1.2.1',
    size: '45 MB',
    featured: false,
  },
];

const categories = [
  'All', 'Therapy Tools', 'Games', 'Wellness', 'Productivity', 'Creative', 'AI Tools'
];

export const AppStore: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');

  const filteredApps = mockApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
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
      default: // featured
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

  const featuredApps = mockApps.filter(app => app.featured);

  const AppCard: React.FC<{ app: App; compact?: boolean }> = ({ app, compact = false }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className={compact ? "pb-2" : "pb-4"}>
          <div className="flex items-start space-x-3">
            <div className="text-4xl">{app.icon}</div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight">{app.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {app.developer}
              </CardDescription>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium">{app.rating}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {app.category}
                </Badge>
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
              <Button size="sm" className="h-8">
                <Download className="w-3 h-3 mr-1" />
                Get
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

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
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md bg-background"
          >
            <option value="featured">Featured</option>
            <option value="rating">Rating</option>
            <option value="downloads">Downloads</option>
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
              {category === 'All' && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Featured Apps</h2>
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
                    {filteredApps.length} apps
                  </span>
                </div>

                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredApps.map((app) => (
                    <AppCard 
                      key={app.id} 
                      app={app} 
                      compact={viewMode === 'list'} 
                    />
                  ))}
                </div>

                {filteredApps.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No apps found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or category filters
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};