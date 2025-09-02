import React from 'react';
import { motion } from 'framer-motion';
import { 
  Video, VideoOff, Mic, MicOff, Pin, Maximize2, 
  Volume2, VolumeX, MoreVertical, Users, Presentation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Mock data
const mockParticipants = [
  {
    id: 1,
    name: "Dr. Sarah Thompson",
    role: "therapist",
    isHost: true,
    isMuted: false,
    isVideoOn: true,
    avatar: "",
    status: "speaking"
  },
  {
    id: 2,
    name: "Emma Rodriguez", 
    role: "client",
    isHost: false,
    isMuted: false,
    isVideoOn: true,
    avatar: "",
    status: "listening"
  },
  {
    id: 3,
    name: "Dr. Michael Chen",
    role: "supervisor",
    isHost: false,
    isMuted: true,
    isVideoOn: false,
    avatar: "",
    status: "observing"
  }
];

export const renderFocusView = () => {
  const mainParticipant = mockParticipants.find(p => p.status === 'speaking') || mockParticipants[0];
  const otherParticipants = mockParticipants.filter(p => p.id !== mainParticipant.id);

  return (
    <div className="h-full flex flex-col">
      {/* Main Speaker */}
      <div className="flex-1 relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden relative"
        >
          {mainParticipant.isVideoOn ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 flex items-center justify-center">
              <span className="text-white/70 text-lg">Main Video Stream</span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar className="h-32 w-32 border-4 border-white/20">
                <AvatarImage src={mainParticipant.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-2xl">
                  {mainParticipant.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          {/* Speaker Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-white font-semibold text-lg">{mainParticipant.name}</span>
                <Badge variant="secondary" className="bg-primary/20 text-primary-foreground">
                  {mainParticipant.role}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                {!mainParticipant.isMuted ? (
                  <Mic className="h-5 w-5 text-green-400" />
                ) : (
                  <MicOff className="h-5 w-5 text-red-400" />
                )}
                {mainParticipant.isVideoOn ? (
                  <Video className="h-5 w-5 text-blue-400" />
                ) : (
                  <VideoOff className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          {/* Controls Overlay */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button variant="secondary" size="sm" className="bg-black/40 backdrop-blur-sm">
              <Pin className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="sm" className="bg-black/40 backdrop-blur-sm">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Other Participants Thumbnails */}
      <div className="flex space-x-3 mt-4 h-24">
        {otherParticipants.map((participant) => (
          <motion.div
            key={participant.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg overflow-hidden flex-shrink-0 w-32 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          >
            {participant.isVideoOn ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-white/60 text-xs">Video</span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-xs">
                    {participant.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
              <div className="flex items-center justify-between">
                <span className="text-white text-xs font-medium truncate">
                  {participant.name.split(' ')[0]}
                </span>
                <div className="flex space-x-1">
                  {!participant.isMuted ? (
                    <Mic className="h-3 w-3 text-green-400" />
                  ) : (
                    <MicOff className="h-3 w-3 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export const renderSplitView = () => (
  <div className="h-full flex space-x-4">
    {/* Video Area */}
    <div className="w-1/2">
      <div className="grid grid-cols-1 gap-3 h-full">
        {mockParticipants.slice(0, 2).map((participant) => (
          <motion.div
            key={participant.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden"
          >
            {participant.isVideoOn ? (
              <div className="w-full h-full bg-gradient-to-br from-blue-400/30 to-purple-400/30 flex items-center justify-center">
                <span className="text-white/70">Video Stream</span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Avatar className="h-16 w-16 border-2 border-white/20">
                  <AvatarImage src={participant.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10">
                    {participant.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium text-sm">{participant.name}</span>
                <div className="flex items-center space-x-1">
                  {!participant.isMuted ? (
                    <Mic className="h-4 w-4 text-green-400" />
                  ) : (
                    <MicOff className="h-4 w-4 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Collaboration Area */}
    <div className="w-1/2">
      <Card className="h-full bg-background/80 backdrop-blur-sm">
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Shared Whiteboard</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Presentation className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Presentation className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Whiteboard collaboration area</p>
              <p className="text-xs text-gray-400">Click to start drawing</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

export const renderPresentationView = () => (
  <div className="h-full flex flex-col">
    {/* Presentation Area */}
    <div className="flex-1 bg-white rounded-xl border border-gray-200 mb-4 flex items-center justify-center relative">
      <div className="text-center text-gray-500">
        <Presentation className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-semibold mb-2">Presentation Mode</h3>
        <p className="text-sm text-gray-400">Share your screen or upload a presentation</p>
      </div>

      {/* Presentation Controls */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        <Button variant="secondary" size="sm">
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>

    {/* Participant Strip */}
    <div className="flex space-x-3 h-20">
      {mockParticipants.map((participant) => (
        <motion.div
          key={participant.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-gray-800 to-gray-700 rounded-lg overflow-hidden w-24 flex-shrink-0"
        >
          {participant.isVideoOn ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <Video className="h-4 w-4 text-white/60" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src={participant.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-xs">
                  {participant.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1">
            <div className="text-center">
              <span className="text-white text-xs font-medium">
                {participant.name.split(' ')[0]}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);
