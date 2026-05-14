export type CrisisResource = {
  id: "lifeline" | "kids-helpline" | "headspace" | "quitline";
  name: string;
  phone: string;
  telHref: string;
  description: string;
  href: string;
  emergency?: boolean;
};

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    id: "lifeline",
    name: "Lifeline",
    phone: "13 11 14",
    telHref: "131114",
    description: "24/7 crisis support in Australia",
    href: "https://www.lifeline.org.au/",
    emergency: true,
  },
  {
    id: "kids-helpline",
    name: "Kids Helpline",
    phone: "1800 55 1800",
    telHref: "1800551800",
    description: "Free phone counselling for young people aged 5-25",
    href: "https://kidshelpline.com.au/",
  },
  {
    id: "headspace",
    name: "headspace",
    phone: "1800 650 890",
    telHref: "1800650890",
    description: "Support for young people aged 12-25",
    href: "https://headspace.org.au/",
  },
  {
    id: "quitline",
    name: "Quitline",
    phone: "13 7848",
    telHref: "137848",
    description: "Nicotine quit support",
    href: "https://www.quit.org.au/",
  },
];

export const CRISIS_BANNER_TEXT =
  "It sounds like things are really tough right now. Here are some people who can help.";
