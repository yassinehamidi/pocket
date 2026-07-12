import {
  Airplane,
  ArrowCircleDown,
  ArrowCircleUp,
  Baby,
  Bank,
  Barbell,
  BookOpen,
  Bus,
  CalendarCheck,
  CalendarDots,
  Car,
  ChartBar,
  Coffee,
  Coins,
  CreditCard,
  DeviceMobile,
  FilmSlate,
  ForkKnife,
  GameController,
  Gift,
  Globe,
  GraduationCap,
  Hammer,
  Heartbeat,
  House,
  Icon,
  IconWeight,
  Laptop,
  Lightning,
  MusicNotes,
  PawPrint,
  Receipt,
  ShoppingBag,
  Tag,
  TShirt,
  Wallet,
  WifiHigh,
} from 'phosphor-react-native';

/**
 * Maps the kebab-case icon names stored in data (matching the design
 * reference's Phosphor classes) to phosphor-react-native components.
 */
const ICONS: Record<string, Icon> = {
  'fork-knife': ForkKnife,
  bus: Bus,
  'shopping-bag': ShoppingBag,
  receipt: Receipt,
  'game-controller': GameController,
  heartbeat: Heartbeat,
  bank: Bank,
  laptop: Laptop,
  gift: Gift,
  house: House,
  lightning: Lightning,
  'wifi-high': WifiHigh,
  'device-mobile': DeviceMobile,
  car: Car,
  'credit-card': CreditCard,
  wallet: Wallet,
  coins: Coins,
  'calendar-check': CalendarCheck,
  'calendar-dots': CalendarDots,
  'chart-bar': ChartBar,
  'arrow-circle-down': ArrowCircleDown,
  'arrow-circle-up': ArrowCircleUp,
  airplane: Airplane,
  baby: Baby,
  barbell: Barbell,
  'book-open': BookOpen,
  coffee: Coffee,
  'film-slate': FilmSlate,
  globe: Globe,
  'graduation-cap': GraduationCap,
  hammer: Hammer,
  'music-notes': MusicNotes,
  'paw-print': PawPrint,
  tag: Tag,
  't-shirt': TShirt,
};

interface Props {
  name: string;
  size?: number;
  color?: string;
  weight?: IconWeight;
}

export function PhosphorIcon({ name, size = 20, color = '#3f7a58', weight = 'regular' }: Props) {
  const Component = ICONS[name] ?? Wallet;
  return <Component size={size} color={color} weight={weight} />;
}
