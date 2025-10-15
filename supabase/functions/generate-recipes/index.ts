import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { ingredients, dietaryPreferences, filters } = await req.json();
    
    console.log('Generating recipes for:', { ingredients, dietaryPreferences, filters });
    
    // Fetch all recipes from database
    const { data: allRecipes, error: fetchError } = await supabase
      .from('recipes')
      .select('*');
      
    if (fetchError) {
      console.error('Error fetching recipes:', fetchError);
      throw fetchError;
    }

    // Build RAG context from database
    const recipeContext = allRecipes?.map(r => 
      `Recipe: ${r.name}
Ingredients: ${r.ingredients.join(', ')}
Difficulty: ${r.difficulty}
Cuisine: ${r.cuisine}
Dietary Tags: ${r.dietary_tags?.join(', ') || 'none'}
Prep Time: ${r.prep_time} minutes
Cook Time: ${r.cook_time} minutes
Description: ${r.description}
Calories: ${r.calories}
Protein: ${r.protein}g
Carbs: ${r.carbs}g
Fat: ${r.fat}g`
    ).join('\n\n---\n\n') || '';

    // Construct prompt for Gemini
    const systemPrompt = `You are a culinary AI assistant with access to a recipe database. Analyze the available ingredients and dietary preferences, then suggest suitable recipes from the database or create new recipes inspired by them.

Available recipes in database:
${recipeContext}

When suggesting recipes:
1. Prioritize recipes from the database that match the ingredients
2. Consider dietary preferences and filters
3. If no exact match, suggest creative recipes inspired by the database
4. Always provide detailed nutritional information
5. Include clear step-by-step instructions`;

    const userPrompt = `I have these ingredients: ${ingredients.join(', ')}
${dietaryPreferences?.length ? `Dietary preferences: ${dietaryPreferences.join(', ')}` : ''}
${filters ? `Filters: Difficulty=${filters.difficulty || 'any'}, Max Time=${filters.maxTime || 'any'} minutes` : ''}

Please suggest 3-5 recipes that I can make with these ingredients. For each recipe, provide:
- Name
- Brief description
- List of ingredients needed
- Step-by-step instructions
- Prep and cook time
- Difficulty level
- Nutritional information (calories, protein, carbs, fat)
- Cuisine type
- Relevant dietary tags`;

    // Call Lovable AI Gateway with Gemini
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI service requires payment. Please contact support.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const generatedText = aiData.choices[0].message.content;
    
    console.log('Generated recipes:', generatedText);

    return new Response(JSON.stringify({ 
      success: true,
      recipes: generatedText,
      matchedFromDatabase: allRecipes?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in generate-recipes:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
