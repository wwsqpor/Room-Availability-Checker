import {
  PenTool, Zap, Monitor, Wifi, Projector, Speaker, Mic, Video,
  type LucideIcon,
} from 'lucide-react';

export const featureIcons: Record<string, LucideIcon> = {
  'Whiteboard': PenTool,
  'Power outlets': Zap,
  'Video screen': Monitor,
  'Wi-Fi': Wifi,
  'Projector': Projector,
  'Sound system': Speaker,
  'Audio recording': Mic,
  'Video conferencing': Video,
};

export const fallbackFeatureIcon: LucideIcon = Wifi;
