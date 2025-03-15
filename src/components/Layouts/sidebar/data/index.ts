import { url } from "inspector";
import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: Icons.HomeIcon,
        items: [],
      },
      {
        title: "Upload Invoice",
        url: "/calendar",
        icon: Icons.InvoiceIcon,
        items: [],
      },
      {
        title: "Profile",
        url: "/profile",
        icon: Icons.User,
        items: [],
      },
      {
        title: "Onboarding",
        url: "/onboarding",
        icon: Icons.OnboardingIcon,
        items: [],
      },
    ],
  },
];
