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
        title: "My Appliances",
        url: "/appliances",
        icon: Icons.InvoiceIcon,
        items: [],
      },
      {
        title: "Upload Bills",
        url: "/onboarding",
        icon: Icons.InvoiceIcon,
        items: [],
      },
    ],
  },
];
