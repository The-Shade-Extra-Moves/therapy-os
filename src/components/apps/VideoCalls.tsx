import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  MoreVertical,
  Users,
  MessageSquare,
  Share,
  Settings,
  Volume2,
  VolumeX,
  Monitor,
  User,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Participant {
  id: string;
  name: string;
  role: 'therapist' | 'patient' | 'observer';
  isVideoOn: boolean;
  isAudioOn: boolean;
  isConnected: boolean;
}

const participants: Participant[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    role: 'therapist',
    isVideoOn: true,
    isAudioOn: true,
    isConnected: true
  },
  {
    id: '2',
    name: 'Alex Thompson',
    role: 'patient',
    isVideoOn: true,
    isAudioOn: true,
    isConnected: true
  },
  {
    id: '3',
    name: 'Dr. Michael Chen',
    role: 'observer',
    isVideoOn: false,
    isAudioOn: false,
    isConnected: true
  }
];

export const VideoCalls: React.FC = () => {
  const [isVideoOn, setIsVideoOn] = React.useState(true);
  const [isAudioOn, setIsAudioOn] = React.useState(true);
  const [isInCall, setIsInCall] = React.useState(true);
  const [callDuration, setCallDuration] = React.useState(0);
  const [isRecording, setIsRecording] = React.useState(false);
  const [showParticipants, setShowParticipants] = React.useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const endCall = () => {
    setIsInCall(false);
    setCallDuration(0);
  };

  const VideoFrame = ({ participant }: { participant: Participant }) => (
    <Card className="relative overflow-hidden group">
      <CardContent className="p-0">
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
          {participant.isVideoOn ? (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center">
              <div className="text-white text-xl font-medium">
                {participant.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-muted-foreground">
              <VideoOff className="h-8 w-8 mb-2" />
              <span className="text-sm">Camera off</span>
            </div>
          )}
          
          {/* Participant Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{participant.name}</div>
                <div className="text-xs opacity-75 capitalize">{participant.role}</div>
              </div>
              <div className="flex items-center gap-1">
                {!participant.isAudioOn && <MicOff className="h-3 w-3" />}
                {!participant.isVideoOn && <VideoOff className="h-3 w-3" />}
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
            participant.isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-slate-50 dark:to-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-semibold">Secure Video Calls</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Therapy Session</span>
                {isInCall && (
                  <>
                    <Separator orientation="vertical" className="h-3" />
                    <Clock className="h-3 w-3" />
                    <span>{formatDuration(callDuration)}</span>
                  </>
                )}
                {isRecording && (
                  <>
                    <Separator orientation="vertical" className="h-3" />
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span>Recording</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={isInCall ? "default" : "secondary"} className="gap-1">
              <div className={`w-2 h-2 rounded-full ${isInCall ? 'bg-green-500' : 'bg-gray-500'}`} />
              {isInCall ? 'In Call' : 'Disconnected'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowParticipants(!showParticipants)}
            >
              <Users className="h-4 w-4 mr-1" />
              {participants.length}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-4">
          <div className="h-full grid grid-cols-2 gap-4">
            {participants.slice(0, 4).map((participant) => (
              <VideoFrame key={participant.id} participant={participant} />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {showParticipants && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border/20 bg-card/30 backdrop-blur-sm"
            >
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-medium text-sm mb-3">Participants ({participants.length})</h3>
                  <div className="space-y-2">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                            participant.isConnected ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{participant.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{participant.role}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          {participant.isAudioOn ? (
                            <Mic className="h-3 w-3 text-green-500" />
                          ) : (
                            <MicOff className="h-3 w-3 text-red-500" />
                          )}
                          {participant.isVideoOn ? (
                            <Video className="h-3 w-3 text-green-500" />
                          ) : (
                            <VideoOff className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium text-sm mb-3">Session Tools</h3>
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Share className="h-4 w-4 mr-2" />
                      Share Screen
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setIsRecording(!isRecording)}
                    >
                      <div className={`h-4 w-4 mr-2 rounded-full ${isRecording ? 'bg-red-500' : 'border-2 border-current'}`} />
                      {isRecording ? 'Stop Recording' : 'Start Recording'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Call Controls */}
      <div className="p-4 border-t border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isAudioOn ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full w-12 h-12 p-0"
            onClick={() => setIsAudioOn(!isAudioOn)}
          >
            {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isVideoOn ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full w-12 h-12 p-0"
            onClick={() => setIsVideoOn(!isVideoOn)}
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
            onClick={endCall}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <Monitor className="h-5 w-5" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="rounded-full w-12 h-12 p-0"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center justify-center mt-3 text-xs text-muted-foreground">
          <span>End-to-end encrypted • HIPAA compliant</span>
        </div>
      </div>
    </div>
  );
};