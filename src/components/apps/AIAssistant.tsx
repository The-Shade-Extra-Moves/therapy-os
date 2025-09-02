import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Send, User, Bot, Lightbulb, FileText, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'assistant',
    content: 'Hello! I\'m your AI therapy assistant. I can help you with treatment suggestions, session planning, and patient insights. How can I assist you today?',
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: '2',
    type: 'user',
    content: 'Can you suggest some breathing exercises for anxiety management?',
    timestamp: new Date(Date.now() - 240000)
  },
  {
    id: '3',
    type: 'assistant',
    content: 'Here are some effective breathing exercises for anxiety:\n\n1. **4-7-8 Technique**: Breathe in for 4, hold for 7, exhale for 8\n2. **Box Breathing**: Inhale for 4, hold for 4, exhale for 4, hold for 4\n3. **Progressive Muscle Relaxation**: Combine deep breathing with muscle tension and release\n\nWould you like me to create a customized exercise plan for a specific patient?',
    timestamp: new Date(Date.now() - 180000)
  }
];

const suggestions = [
  { icon: Lightbulb, text: 'Suggest treatment approaches', category: 'Treatment' },
  { icon: FileText, text: 'Analyze session notes', category: 'Analysis' },
  { icon: Users, text: 'Patient progress insights', category: 'Insights' },
];

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>(mockMessages);
  const [inputValue, setInputValue] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Thank you for your question. Based on current therapy best practices, I recommend focusing on evidence-based approaches. Would you like me to provide more specific guidance for this situation?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="h-full bg-card/50 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center">
            <Brain className="h-5 w-5 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">AI Therapy Assistant</h2>
            <p className="text-sm text-muted-foreground">Powered by advanced therapy AI</p>
          </div>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="p-4 border-b border-border/50">
        <h3 className="text-sm font-medium text-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-2">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSuggestionClick(suggestion.text)}
              className="flex items-center space-x-3 p-3 glass-surface rounded-lg text-left hover:bg-primary/5 transition-colors"
            >
              <suggestion.icon className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{suggestion.text}</p>
                <p className="text-xs text-muted-foreground">{suggestion.category}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-[80%] ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-gradient-primary' 
                  : 'bg-gradient-accent'
              }`}>
                {message.type === 'user' ? (
                  <User className="h-4 w-4 text-primary-foreground" />
                ) : (
                  <Bot className="h-4 w-4 text-accent-foreground" />
                )}
              </div>
              
              <Card className={`p-3 ${
                message.type === 'user' 
                  ? 'bg-primary/10 border-primary/20' 
                  : 'glass-surface'
              }`}>
                <div className="text-sm text-foreground whitespace-pre-wrap">
                  {message.content}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </Card>
            </div>
          </motion.div>
        ))}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start space-x-3"
          >
            <div className="w-8 h-8 bg-gradient-accent rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-accent-foreground" />
            </div>
            <Card className="p-3 glass-surface">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about therapy techniques, patient insights, or treatment plans..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};