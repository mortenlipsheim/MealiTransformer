'use client';

import { useSettings } from '@/hooks/use-settings';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function ConfigPanel() {
  const { settings, setSettings, t } = useSettings();

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="font-headline">{t('settings')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mealie-url">{t('mealieUrl')}</Label>
          <Input
            id="mealie-url"
            placeholder={t('mealieUrlPlaceholder')}
            value={settings.mealieUrl}
            onChange={(e) => setSettings({ mealieUrl: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mealie-api-token">{t('mealieApiToken')}</Label>
          <Input
            id="mealie-api-token"
            type="password"
            placeholder={t('mealieApiTokenPlaceholder')}
            value={settings.mealieApiToken}
            onChange={(e) => setSettings({ mealieApiToken: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ui-language">{t('uiLanguage')}</Label>
          <Select value={settings.uiLang} onValueChange={(value) => setSettings({ uiLang: value as 'en' | 'fr' })}>
            <SelectTrigger id="ui-language">
              <SelectValue placeholder={t('uiLanguage')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('english')}</SelectItem>
              <SelectItem value="fr">{t('french')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="target-language">{t('targetLanguage')}</Label>
          <Select value={settings.targetLang} onValueChange={(value) => setSettings({ targetLang: value as 'en' | 'fr' | 'de' | 'es' | 'it' })}>
            <SelectTrigger id="target-language">
              <SelectValue placeholder={t('targetLanguage')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('english')}</SelectItem>
              <SelectItem value="fr">{t('french')}</SelectItem>
              <SelectItem value="de">{t('german')}</SelectItem>
              <SelectItem value="es">{t('spanish')}</SelectItem>
              <SelectItem value="it">{t('italian')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="target-system">{t('targetSystem')}</Label>
          <Select value={settings.targetSystem} onValueChange={(value) => setSettings({ targetSystem: value as 'metric' | 'us' })}>
            <SelectTrigger id="target-system">
              <SelectValue placeholder={t('targetSystem')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metric">{t('metric')}</SelectItem>
              <SelectItem value="us">{t('us')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
