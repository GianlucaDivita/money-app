import type { LucideIcon } from 'lucide-react';
import {
  ShoppingCart,
  Utensils,
  Car,
  Gamepad2,
  ShoppingBag,
  HeartPulse,
  Zap,
  Home,
  GraduationCap,
  Repeat,
  Sparkles,
  Gift,
  Plane,
  Briefcase,
  Laptop,
  TrendingUp,
  RotateCcw,
  Coins,
  PiggyBank,
  Coffee,
  Music,
  Dumbbell,
  Scissors,
  Book,
  Wrench,
  Heart,
  Shield,
  Star,
  Trophy,
  CircleDot,
} from 'lucide-react';

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { container: 'w-8 h-8', icon: 14 },
  md: { container: 'w-10 h-10', icon: 18 },
  lg: { container: 'w-12 h-12', icon: 22 },
};

// Explicit icon map — only icons actually used in the app.
// This enables proper tree-shaking (saves ~150KB gzipped vs import *)
const iconMap: Record<string, LucideIcon> = {
  'shopping-cart': ShoppingCart,
  'utensils': Utensils,
  'car': Car,
  'gamepad-2': Gamepad2,
  'shopping-bag': ShoppingBag,
  'heart-pulse': HeartPulse,
  'zap': Zap,
  'home': Home,
  'graduation-cap': GraduationCap,
  'repeat': Repeat,
  'sparkles': Sparkles,
  'gift': Gift,
  'plane': Plane,
  'briefcase': Briefcase,
  'laptop': Laptop,
  'trending-up': TrendingUp,
  'rotate-ccw': RotateCcw,
  'coins': Coins,
  'piggy-bank': PiggyBank,
  'coffee': Coffee,
  'music': Music,
  'dumbbell': Dumbbell,
  'scissors': Scissors,
  'book': Book,
  'wrench': Wrench,
  'heart': Heart,
  'shield': Shield,
  'star': Star,
  'trophy': Trophy,
};

export function CategoryIcon({ icon, color, size = 'md' }: CategoryIconProps) {
  const Icon = iconMap[icon] || CircleDot;
  const s = sizeMap[size];

  return (
    <div
      className={`${s.container} rounded-xl flex items-center justify-center shrink-0`}
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon size={s.icon} style={{ color }} />
    </div>
  );
}
