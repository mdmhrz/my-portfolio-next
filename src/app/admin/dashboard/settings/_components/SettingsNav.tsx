'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SETTINGS_GROUPS, type SettingsNavItem } from "./settings-nav";

function itemClasses(active: boolean) {
  return `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    active
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  }`;
}

function NavLink({ item, active, horizontal }: { item: SettingsNavItem; active: boolean; horizontal?: boolean }) {
  const Icon = item.icon;

  if (item.soon) {
    return (
      <span
        className={`flex cursor-not-allowed items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/50 ${
          horizontal ? "whitespace-nowrap" : ""
        }`}
        title="Coming soon"
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.label}
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Soon</span>
      </span>
    );
  }

  return (
    <Link href={item.href} className={`${itemClasses(active)} ${horizontal ? "whitespace-nowrap" : ""}`}>
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Settings sections">
      {/* Desktop: grouped vertical list */}
      <div className="hidden space-y-6 lg:block">
        {SETTINGS_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{group.label}</p>
            {group.items.map((item) => (
              <NavLink key={item.href} item={item} active={pathname === item.href} />
            ))}
          </div>
        ))}
      </div>

      {/* Mobile/tablet: horizontal scrollable chips */}
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {SETTINGS_GROUPS.flatMap((g) => g.items).map((item) => (
          <NavLink key={item.href} item={item} active={pathname === item.href} horizontal />
        ))}
      </div>
    </nav>
  );
}
