import {
  ChartBarIcon,
  FileTextIcon,
  GearSixIcon,
  HouseIcon,
  type Icon,
} from "@phosphor-icons/react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: Icon;
  enabled: boolean;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: HouseIcon,
    enabled: true,
  },
  {
    label: "Receipts",
    href: "/dashboard/receipts",
    icon: FileTextIcon,
    enabled: true,
  },
  {
    label: "Stats",
    href: "/stats",
    icon: ChartBarIcon,
    enabled: false,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: GearSixIcon,
    enabled: false,
  },
];
