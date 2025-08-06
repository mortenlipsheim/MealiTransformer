import { ChefHat } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

export function Logo() {
  const { t } = useSettings();
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary text-primary-foreground p-2 rounded-lg">
        <ChefHat className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-headline font-bold text-primary-dark">{t('title')}</h1>
    </div>
  );
}
