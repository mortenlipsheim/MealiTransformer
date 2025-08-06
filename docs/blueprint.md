# **App Name**: Mealie Transformer

## Core Features:

- Configuration Settings: Allows user configuration of settings like Mealie URL, UI language, target language for translation, and target measuring system.
- Recipe Input: Capture recipes using URL input, text paste, or image upload. Provides share-to functionality for mobile devices to directly input URLs into the app. YouTube URL parsing as an optional (configurable) feature.
- AI Translation & Formatting Tool: AI translates the recipe to user's language preference when applicable, and/or adapts HTML formatting to fit the destination (dpaste.org or Mealie's scraper), utilizing available AI models (e.g., Google Gemini, Groq). Ability to select which API to use stored in environment variable. Functions as a tool to reason when the information requires translation or adaptation, including when source page does not have schema.org microdata.
- Recipe Database: Stores added recipes in a server-side text database.
- Recipe Review & Edit: Enables users to review, edit, and add information before posting to Mealie, with fields mirroring Mealie's 'Create Recipe' format, or a standardized HTML format.
- Recipe Preparation for Mealie: Posts translated and reformatted recipe to dpaste.org temporarily in a standardized format (such as HTML) to use Mealie's own web scraper using https://schema.org/Recipe.
- Multi-format configuration: Interface to define parameters needed for recipe-scraping: target language, measuring system, time format, etc.

## Style Guidelines:

- Primary color: '#669966'. A medium-brightness muted green suggests natural and healthy eating. Based on the 'healthy food' association.
- Background color: '#F0F2F0'. A very light desaturated green background, keeps the association with food without overwhelming.
- Accent color: '#996666'. A contrasting dark red provides contrast with the green hues for focus elements, and does not directly recall any specific type of food.
- Font pairing: 'Playfair' (serif) for headers and titles, lending an elegant feel, and 'PT Sans' (sans-serif) for body text for clarity and readability in recipe details.
- Use icons related to cooking and recipes, drawing inspiration from Mealie's existing icons.
- Clean and organized layout, with a focus on readability and ease of navigation. Section off areas based on locale information vs the configuration of mealie export vs content review and adjustment.
- Subtle transitions and animations to enhance user experience when loading, translating, or reformatting recipes.