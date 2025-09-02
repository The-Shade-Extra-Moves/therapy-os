import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, FileText, PenTool, Brain, Users, Download,
  Send, Save, Smile, Heart, BarChart3, Upload, Eye, Lightbulb,
  Activity, Target, Headphones, Clock, CheckCircle, TrendingUp,
  Video, VideoOff, Mic, MicOff, UserPlus, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EnhancedSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  messages: any[];
  chatMessage: string;
  setChatMessage: (message: string) => void;
  sendMessage: () => void;
  sessionTimer: number;
  selectedMood: number | null;
  setSelectedMood: (mood: number | null) => void;
  sessionNotes: string;
  setSessionNotes: (notes: string) => void;
  formatTime: (seconds: number) => string;
  aiInsights: string[];
  isAIEnabled: boolean;
  setIsAIEnabled: (enabled: boolean) => void;
  showParticipantsPanel: boolean;
  setShowParticipantsPanel: (show: boolean) => void;
  recordings: any[];
  sharedFiles: any[];
  biometricData: any;
  currentTemplate: string;
  setCurrentTemplate: (template: string) => void;
}

const mockParticipants = [
  {
    id: 1,
    name: "Dr. Sarah Thompson",
    role: "therapist",
    isHost: true,
    isMuted: false,
    isVideoOn: true,
    avatar: "",
    status: "speaking",
    joinTime: "14:00"
  },
  {
    id: 2,
    name: "Emma Rodriguez",
    role: "client", 
    isHost: false,
    isMuted: false,
    isVideoOn: true,
    avatar: "",
    status: "listening",
    joinTime: "14:01"
  },
  {
    id: 3,
    name: "Dr. Michael Chen",
    role: "supervisor",
    isHost: false,
    isMuted: true,
    isVideoOn: false,
    avatar: "",
    status: "observing",
    joinTime: "14:02"
  }
];

const moodOptions = [
  { emoji: '😊', label: 'Great', value: 5, color: 'text-green-500' },
  { emoji: '🙂', label: 'Good', value: 4, color: 'text-blue-500' },
  { emoji: '😐', label: 'Okay', value: 3, color: 'text-yellow-500' },
  { emoji: '😟', label: 'Low', value: 2, color: 'text-orange-500' },
  { emoji: '😢', label: 'Difficult', value: 1, color: 'text-red-500' },
];

const therapyTemplates = [
  { id: 'cbt', name: 'CBT Session', icon: Brain, description: 'Cognitive Behavioral Therapy session structure' },
  { id: 'emdr', name: 'EMDR Session', icon: Eye, description: 'Eye Movement Desensitization framework' },
  { id: 'mindfulness', name: 'Mindfulness', icon: Heart, description: 'Mindfulness and meditation session' },
  { id: 'group', name: 'Group Therapy', icon: Users, description: 'Group therapy facilitation tools' },
];

export const renderEnhancedSidebar = (props: EnhancedSidebarProps) => (
  <Card className="w-96 h-full bg-background/95 backdrop-blur-md border-primary/10">
    <Tabs value={props.activeTab} onValueChange={props.setActiveTab} className="h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-5 m-4">
        <TabsTrigger value="participants" className="text-xs">
          <Users className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="chat" className="text-xs">
          <MessageSquare className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="notes" className="text-xs">
          <FileText className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="tools" className="text-xs">
          <PenTool className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="ai" className="text-xs">
          <Brain className="h-4 w-4" />
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden">
        {/* Participants Panel */}
        <TabsContent value="participants" className="h-full m-0 p-4 pt-0">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Participants ({mockParticipants.length})</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600">
                  All Connected
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Encrypted
                </Badge>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {mockParticipants.map((participant) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10">
                          {participant.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{participant.name}</span>
                          {participant.isHost && (
                            <Badge variant="secondary" className="text-xs bg-primary/20">Host</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span className="capitalize">{participant.role}</span>
                          <span>•</span>
                          <span>Joined {participant.joinTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        participant.status === 'speaking' ? 'bg-green-500' :
                        participant.status === 'listening' ? 'bg-blue-500' : 'bg-gray-400'
                      }`} />
                      {!participant.isMuted ? (
                        <Mic className="h-4 w-4 text-green-500" />
                      ) : (
                        <MicOff className="h-4 w-4 text-red-500" />
                      )}
                      {participant.isVideoOn ? (
                        <Video className="h-4 w-4 text-blue-500" />
                      ) : (
                        <VideoOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Participant Actions */}
            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Participant
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Manage Permissions
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Enhanced Chat Panel */}
        <TabsContent value="chat" className="h-full m-0 p-4 pt-0">
          <div className="flex flex-col h-full">
            <div className="mb-3">
              <h3 className="font-semibold mb-2">Session Chat</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {mockParticipants.length} participants
                </Badge>
                <Badge variant="outline" className="text-xs text-green-600">
                  End-to-End Encrypted
                </Badge>
              </div>
            </div>

            <ScrollArea className="flex-1 mb-4">
              <div className="space-y-3">
                {props.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-lg text-sm ${
                      msg.type === 'ai' 
                        ? 'bg-blue-100 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800' 
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium text-xs ${
                        msg.type === 'ai' ? 'text-blue-600 dark:text-blue-400' : ''
                      }`}>
                        {msg.sender}
                      </span>
                      <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                    </div>
                    <p className="text-sm">{msg.message}</p>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type a message..."
                  value={props.chatMessage}
                  onChange={(e) => props.setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && props.sendMessage()}
                  className="flex-1"
                />
                <Button size="icon" onClick={props.sendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-1">
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  <Upload className="h-3 w-3 mr-1" />
                  File
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs">
                  <Smile className="h-3 w-3 mr-1" />
                  Emoji
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Enhanced Notes Panel */}
        <TabsContent value="notes" className="h-full m-0 p-4 pt-0">
          <div className="flex flex-col h-full">
            <div className="mb-4">
              <h3 className="font-semibold mb-3">Session Analytics</h3>
              
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <Card className="p-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-semibold">{props.formatTime(props.sessionTimer)}</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Heart Rate</p>
                      <p className="font-semibold">{props.biometricData.heartRate} BPM</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Engagement</p>
                      <p className="font-semibold">High</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Progress</p>
                      <p className="font-semibold">+15%</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Separator className="mb-4" />

              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Current Mood</Label>
                <div className="flex space-x-1">
                  {moodOptions.map((mood) => (
                    <Button
                      key={mood.value}
                      variant={props.selectedMood === mood.value ? "default" : "outline"}
                      size="sm"
                      className="p-2 h-9 w-9"
                      onClick={() => props.setSelectedMood(mood.value)}
                    >
                      <span className="text-sm">{mood.emoji}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <Label className="text-sm font-medium mb-2">Session Notes</Label>
              <Textarea
                placeholder="Document key insights, breakthroughs, homework assignments, next steps..."
                value={props.sessionNotes}
                onChange={(e) => props.setSessionNotes(e.target.value)}
                className="flex-1 resize-none"
              />
            </div>

            <div className="mt-4 space-y-2">
              <Button className="w-full" variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save to Patient Record
              </Button>
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Session Summary
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Enhanced Tools Panel */}
        <TabsContent value="tools" className="h-full m-0 p-4 pt-0">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              <h3 className="font-semibold">Therapy Toolkit</h3>

              <Card className="p-4">
                <h4 className="font-medium mb-3">Session Templates</h4>
                <Select value={props.currentTemplate} onValueChange={props.setCurrentTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {therapyTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  {therapyTemplates.find(t => t.id === props.currentTemplate)?.description}
                </p>
              </Card>

              {/* Interactive Tools */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <PenTool className="h-5 w-5 mb-1" />
                  <span className="text-xs">Whiteboard</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <Smile className="h-5 w-5 mb-1" />
                  <span className="text-xs">Mood Tracker</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <Heart className="h-5 w-5 mb-1" />
                  <span className="text-xs">Breathing</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <BarChart3 className="h-5 w-5 mb-1" />
                  <span className="text-xs">Progress</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <Target className="h-5 w-5 mb-1" />
                  <span className="text-xs">Goals</span>
                </Button>
                <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
                  <Lightbulb className="h-5 w-5 mb-1" />
                  <span className="text-xs">Exercises</span>
                </Button>
              </div>

              {/* Media & Files */}
              <Card className="p-4">
                <h4 className="font-medium mb-3">Shared Resources</h4>
                <div className="space-y-2">
                  {props.sharedFiles.length > 0 ? (
                    props.sharedFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size} • {file.sharedBy}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No files shared yet
                    </p>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <Upload className="h-4 w-4 mr-2" />
                  Share File
                </Button>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Enhanced AI Panel */}
        <TabsContent value="ai" className="h-full m-0 p-4 pt-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">AI Assistant</h3>
              <Switch
                checked={props.isAIEnabled}
                onCheckedChange={props.setIsAIEnabled}
              />
            </div>

            {props.isAIEnabled && (
              <>
                <Card className="p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Live Analysis Active</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Current Mood Detected</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm">😊</span>
                        <span className="text-sm font-medium">Calm & Engaged</span>
                        <Badge variant="outline" className="text-xs">92% confidence</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Speech Patterns</Label>
                      <div className="mt-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Speaking Rate</span>
                          <span>Normal</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 block">Real-time Insights</Label>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {props.aiInsights.map((insight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-xs"
                        >
                          <div className="flex items-start space-x-2">
                            <Lightbulb className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span>{insight}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Session Summary
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Target className="h-4 w-4 mr-2" />
                    Suggest Next Steps
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Draft Homework Plan
                  </Button>
                </div>
              </>
            )}

            {!props.isAIEnabled && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">AI Assistant is disabled</p>
                  <p className="text-xs text-muted-foreground">Enable to get real-time insights</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </div>
    </Tabs>
  </Card>
);