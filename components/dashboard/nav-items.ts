import {
  ChartBarIcon,
  GearSixIcon,
  HouseIcon,
  type Icon,
  ReceiptIcon,
} from "@phosphor-icons/react";

export type DashboardNavItem = {
  label: string;
  description: string;
  href: string;
  icon: Icon;
  enabled: boolean;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    label: "Home",
    description:
      "Track key spending metrics, capture receipts, and review recent activity at a glance.",
    href: "/dashboard",
    icon: HouseIcon,
    enabled: true,
  },
  {
    label: "Receipts",
    description:
      "Browse your real receipts with filters, sorting, and pagination.",
    href: "/dashboard/receipts",
    icon: ReceiptIcon,
    enabled: true,
  },
  {
    label: "Stats",
    description:
      "Spending trends with calendar presets and grouping from your saved receipts.",
    href: "/dashboard/stats",
    icon: ChartBarIcon,
    enabled: true,
  },
  {
    label: "Settings",
    description:
      "Account, appearance, and session. Data export and account deletion will ship in a later release.",
    href: "/dashboard/settings",
    icon: GearSixIcon,
    enabled: true,
  },
];
