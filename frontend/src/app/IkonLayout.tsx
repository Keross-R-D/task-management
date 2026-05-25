"use client";
import { ProviderWrapper, RenderAppBreadcrumb, SidebarNavItem } from "ikoncomponents";
import { RenderSidebarNav } from "ikoncomponents/dist/ikoncomponents/main-layout/nav-main";
import { Contact, Home, Settings, UsersRound } from "lucide-react";

const mainNavItems: SidebarNavItem[] = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "About",
        url: "/about",
        icon: UsersRound
    },
    {
        title: "Contact",
        url: "/contact",
        icon: Contact
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        items: [
            {
                title: "Profile",
                url: "/settings/profile",
            },
            {
                title: "Account",
                url: "/settings/account",
            },
        ]
    },
];

export default function IkonLayout({
    children,
    baseUrl,
    platformUrl,
}: Readonly<{
    children: React.ReactNode;
    baseUrl: string;
    platformUrl: string;
}>) {
    return (
        <ProviderWrapper baseUrl={baseUrl} platformUrl={platformUrl}>
            <RenderSidebarNav items={mainNavItems} />

            <RenderAppBreadcrumb
                breadcrumb={{ level: 0, title: "{{app_name}}" }}
            />
            {children}
        </ProviderWrapper >
    );
}
