'use client';

import { useSettings } from '@/hooks/use-settings';
import { ConfigPanel } from '@/components/config-panel';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function SettingsPage() {
  const { t } = useSettings();

  return (
    <div className="flex flex-col items-center min-h-screen p-4 sm:p-8">
      <header className="w-full max-w-2xl flex items-center justify-between mb-8">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('title')}
          </Link>
        </Button>
      </header>
      <main className="w-full flex-grow flex flex-col items-center gap-8">
        <ConfigPanel />
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>Mealie Configuration</CardTitle>
                <CardDescription>
                    Your Mealie URL and API Token are now configured in your project's environment variables for better security. You can find them in the `.env` file.
                </CardDescription>
            </CardHeader>
        </Card>
      </main>
    </div>
  );
}
