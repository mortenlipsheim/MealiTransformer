'use client';

import { useFieldArray, useForm } from 'react-hook-form';
import { Trash2, PlusCircle, ExternalLink } from 'lucide-react';
import type { Recipe } from '@/types';
import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { generateAndPostToMealie } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface RecipeReviewFormProps {
  initialRecipe: Recipe;
  setIsLoading: (isLoading: boolean) => void;
  resetFlow: () => void;
}

export function RecipeReviewForm({ initialRecipe, setIsLoading, resetFlow }: RecipeReviewFormProps) {
  const { t } = useSettings();
  const { toast } = useToast();
  const { register, control, handleSubmit, formState: { errors } } = useForm<Recipe>({
    defaultValues: initialRecipe,
  });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: 'ingredients' });
  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({ control, name: 'instructions' });

  const onFinalSubmit = async (data: Recipe) => {
    setIsLoading(true);
    try {
      const result = await generateAndPostToMealie(data);
      if (!result.success || !result.url) {
        throw new Error(result.error || t('errorDpaste'));
      }

      toast({
        title: t('success'),
        description: "Your recipe is ready to be imported!",
        duration: Infinity, // Keep toast open until user interacts
        action: (
          <a href={result.url} target="_blank" rel="noopener noreferrer">
            <Button>
              <ExternalLink className="mr-2" />
              {t('viewRecipe')}
            </Button>
          </a>
        ),
      });
      // Don't reset flow automatically, let the user decide when they're done.

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline">{t('recipeReview')}</CardTitle>
        <Button variant="ghost" onClick={resetFlow}>{t('reset')}</Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFinalSubmit)} className="space-y-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t('recipeName')}</Label>
              <Input id="name" {...register('name', { required: true })} />
            </div>
            <div>
              <Label htmlFor="description">{t('recipeDescription')}</Label>
              <Textarea id="description" {...register('description')} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label htmlFor="prepTime">{t('prepTime')}</Label><Input id="prepTime" {...register('prepTime')} /></div>
              <div><Label htmlFor="cookTime">{t('cookTime')}</Label><Input id="cookTime" {...register('cookTime')} /></div>
              <div><Label htmlFor="totalTime">{t('totalTime')}</Label><Input id="totalTime" {...register('totalTime')} /></div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><Label htmlFor="recipeYield">{t('servings')}</Label><Input id="recipeYield" {...register('recipeYield')} /></div>
              <div><Label htmlFor="recipeCategory">{t('category')}</Label><Input id="recipeCategory" {...register('recipeCategory')} /></div>
              <div><Label htmlFor="recipeCuisine">{t('cuisine')}</Label><Input id="recipeCuisine" {...register('recipeCuisine')} /></div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('ingredients')}</h3>
            {ingredientFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input {...register(`ingredients.${index}` as const)} className="flex-grow" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeIngredient(index)} aria-label={t('remove')}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendIngredient('')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('addIngredient')}
            </Button>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('instructions')}</h3>
            {instructionFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                 <span className="font-bold pt-2">{index + 1}.</span>
                <Textarea {...register(`instructions.${index}` as const)} className="flex-grow" rows={2} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeInstruction(index)} aria-label={t('remove')}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => appendInstruction('')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('addInstruction')}
            </Button>
          </div>

          <Button type="submit" className="w-full">
            {t('sendToMealie')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
