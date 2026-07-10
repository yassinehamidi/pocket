import {
  ArrowCircleDown,
  ArrowCircleUp,
  Bank,
  Bus,
  CalendarCheck,
  CalendarDots,
  Car,
  ChartBar,
  Coins,
  CreditCard,
  DeviceMobile,
  ForkKnife,
  GameController,
  Gift,
  Heartbeat,
  House,
  Icon,
  IconWeight,
  Laptop,
  Lightning,
  Receipt,
  ShoppingBag,
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
