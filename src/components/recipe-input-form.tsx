'use client';

import { useState, type FormEvent, useRef } from 'react';
import { UploadCloud } from 'lucide-react';

import { useSettings } from '@/hooks/use-settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { Recipe } from '@/types';
import { transformRecipe } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface RecipeInputFormProps {
  setIsLoading: (isLoading: boolean) => void;
  setRecipe: (recipe: Recipe) => void;
  setStep: (step: 'input' | 'review') => void;
}

export function RecipeInputForm({ setIsLoading, setRecipe, setStep }: RecipeInputFormProps) {
  const { t, settings } = useSettings();
  const { toast } = useToast();
  const [inputType, setInputType] = useState<'url' | 'text' | 'image' | 'youtube'>('url');
  const [inputValue, setInputValue] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (file: File | null) => {
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let dataUri = '';
    if (inputType === 'image' && imageFile) {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        dataUri = await new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
        });
    }

    try {
      const result = await transformRecipe({
        type: inputType,
        source: inputType === 'image' ? dataUri : inputValue,
        settings,
      });

      if (result.success && result.recipe) {
        setRecipe(result.recipe);
        setStep('review');
      } else {
        toast({
          variant: 'destructive',
          title: t('error'),
          description: result.error || t('aiParsingError'),
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('errorTransform'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="font-headline">{t('recipeInput')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="url" className="w-full" onValueChange={(value) => setInputType(value as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="url">{t('url')}</TabsTrigger>
              <TabsTrigger value="text">{t('text')}</TabsTrigger>
              <TabsTrigger value="image">{t('image')}</TabsTrigger>
              <TabsTrigger value="youtube">{t('youtube')}</TabsTrigger>
            </TabsList>
            <div className="pt-4">
              <TabsContent value="url">
                <Input type="url" placeholder={t('urlPlaceholder')} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
              </TabsContent>
              <TabsContent value="text">
                <Textarea placeholder={t('textPlaceholder')} value={inputValue} onChange={(e) => setInputValue(e.target.value)} rows={10} />
              </TabsContent>
              <TabsContent value="image">
                <div
                  className="border-2 border-dashed border-muted rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleImageChange(e.dataTransfer.files[0]);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input type="file" ref={fileInputRef} onChange={(e) => handleImageChange(e.target.files?.[0] || null)} accept="image/*" className="hidden" />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Recipe preview" className="max-h-48 rounded-md" />
                  ) : (
                    <>
                      <UploadCloud className="h-12 w-12 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">{t('imagePrompt')}</p>
                    </>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="youtube">
                <Input type="url" placeholder={t('youtubePlaceholder')} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
              </TabsContent>
            </div>
          </Tabs>
          <Button type="submit" className="w-full mt-6" disabled={(!inputValue && !imageFile)}>
            {t('transform')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
