import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

const menuItems = [
  { name: 'Studio', path: '/' },
  { name: 'Launchpad', path: '/launchpad' },
  { name: 'Profile', path: '/profile' },
  { name: 'Docs', path: '/docs' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-4">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={cn(
            "vs-button px-3 py-1 text-sm",
            pathname === item.path && "bg-white text-black hover:bg-white hover:text-black"
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
