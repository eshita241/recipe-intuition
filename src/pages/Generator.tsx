import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChefHat, Plus, X, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const DIETARY_OPTIONS = [
  "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", 
  "Keto", "Paleo", "Low-Carb", "Nut-Free"
];

const DIFFICULTY_LEVELS = ["easy", "medium", "hard"];

const Generator = () => {
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [dietary, setDietary] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState("");
  const [maxTime, setMaxTime] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipes, setRecipes] = useState("");

  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const toggleDietary = (option: string) => {
    setDietary(prev => 
      prev.includes(option) 
        ? prev.filter(d => d !== option)
        : [...prev, option]
    );
  };

  const generateRecipes = async () => {
    if (ingredients.length === 0) {
      toast({
        title: "Add ingredients",
        description: "Please add at least one ingredient",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setRecipes("");

    try {
      const { data, error } = await supabase.functions.invoke('generate-recipes', {
        body: {
          ingredients,
          dietaryPreferences: dietary,
          filters: {
            difficulty: difficulty || undefined,
            maxTime: maxTime ? parseInt(maxTime) : undefined
          }
        }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Generation failed",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setRecipes(data.recipes);
      toast({
        title: "Recipes generated!",
        description: `Found ${data.matchedFromDatabase} recipes in database`,
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate recipes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Recipe Generator</h1>
          <p className="text-muted-foreground">Tell us what you have, we'll create magic</p>
        </div>

        <Card className="p-6 shadow-medium mb-8">
          {/* Ingredients Input */}
          <div className="mb-6">
            <Label className="text-lg font-semibold mb-3 block">Your Ingredients</Label>
            <div className="flex gap-2 mb-3">
              <Input
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="e.g., chicken, tomatoes, garlic..."
                className="flex-1"
              />
              <Button onClick={addIngredient} className="bg-primary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {ingredients.map((ing, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="px-3 py-1.5 text-sm"
                >
                  {ing}
                  <button
                    onClick={() => removeIngredient(index)}
                    className="ml-2 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Dietary Preferences */}
          <div className="mb-6">
            <Label className="text-lg font-semibold mb-3 block">Dietary Preferences</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DIETARY_OPTIONS.map(option => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={dietary.includes(option)}
                    onCheckedChange={() => toggleDietary(option)}
                  />
                  <Label htmlFor={option} className="text-sm cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label htmlFor="difficulty" className="mb-2 block">Difficulty</Label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
              >
                <option value="">Any</option>
                {DIFFICULTY_LEVELS.map(level => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <Label htmlFor="maxTime" className="mb-2 block">Max Time (minutes)</Label>
              <Input
                id="maxTime"
                type="number"
                value={maxTime}
                onChange={(e) => setMaxTime(e.target.value)}
                placeholder="e.g., 30"
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={generateRecipes}
            disabled={isGenerating || ingredients.length === 0}
            className="w-full bg-gradient-primary hover:shadow-glow transition-all"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 w-5 h-5" />
                Generate Recipes
              </>
            )}
          </Button>
        </Card>

        {/* Results */}
        {recipes && (
          <Card className="p-6 shadow-medium">
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold">Your Recipes</h2>
            </div>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-foreground">
                {recipes}
              </pre>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Generator;
