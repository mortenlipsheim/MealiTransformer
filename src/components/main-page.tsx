'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { ConfigPanel } from '@/components/config-panel';
import { useSettings } from '@/hooks/use-settings';
import type { Recipe } from '@/types';
import { RecipeInputForm } from '@/components/recipe-input-form';
import { RecipeReviewForm } from '@/components/recipe-review-form';
import { Separator } from './ui/separator';

type Step = 'input' | 'review';

const defaultRecipe: Recipe = {
  name: '',
  description: '',
  ingredients: [],
  instructions: [],
  prepTime: '',
  cookTime: '',
  totalTime: '',
  recipeYield: '',
  recipeCategory: '',
  recipeCuisine: '',
};

export default function MainPage() {
  const { t } = useSettings();
  const [step, setStep] = useState<Step>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe>(defaultRecipe);

  const resetFlow = () => {
    setStep('input');
    setRecipe(defaultRecipe);
    setIsLoading(false);
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <ConfigPanel />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col items-center min-h-screen p-4 sm:p-8">
          <header className="w-full max-w-4xl flex items-center justify-between mb-8">
            <div className="flex-grow">
              <h1 className="text-3xl md:text-4xl font-headline font-bold text-center sm:text-left">{t('title')}</h1>
              <p className="text-muted-foreground text-center sm:text-left">{t('description')}</p>
            </div>
            <div className="md:hidden">
              <SidebarTrigger />
            </div>
          </header>
          
          <main className="w-full flex-grow flex flex-col items-center justify-center">
            {isLoading ? (
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
                <p className="text-lg font-semibold">{step === 'input' ? t('transforming') : t('sending')}</p>
              </div>
            ) : (
              <>
                {step === 'input' && <RecipeInputForm setIsLoading={setIsLoading} setRecipe={setRecipe} setStep={setStep} />}
                {step === 'review' && <RecipeReviewForm initialRecipe={recipe} setIsLoading={setIsLoading} resetFlow={resetFlow} />}
              </>
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
