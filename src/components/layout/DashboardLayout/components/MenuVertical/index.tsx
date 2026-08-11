import { Sheet, SheetContent } from '~root/components/ui';
import { SidebarContent } from './components';

type Props = {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

export const MenuVertical = ({ mobileOpen, onMobileOpenChange }: Props) => (
  <>
    <aside className="hidden w-64 flex-shrink-0 border-r bg-card md:block">
      <SidebarContent logoSrc="/Main-logo.png" />
    </aside>
    <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
      <SheetContent side="left" className="w-64 p-0">
        <SidebarContent
          logoSrc="/Responsive-logo.png"
          onNavigate={() => onMobileOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  </>
);
