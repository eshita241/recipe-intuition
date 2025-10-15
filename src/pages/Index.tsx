import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChefHat, Sparkles, Search } from "lucide-react";
import heroImage from "@/assets/hero-cooking.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Recipe Generation</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Turn Your
                <span className="block text-primary">Ingredients</span>
                Into Delicious Meals
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-md mx-auto md:mx-0">
                Simply tell us what you have in your kitchen, and our AI will create personalized recipes tailored to your taste and dietary needs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Button 
                  onClick={() => navigate('/generator')}
                  size="lg"
                  className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  <ChefHat className="mr-2" />
                  Start Cooking
                </Button>
                <Button 
                  onClick={() => navigate('/browse')}
                  size="lg"
                  variant="outline"
                  className="border-2 hover:border-primary"
                >
                  <Search className="mr-2" />
                  Browse Recipes
                </Button>
              </div>
            </div>
            
            {/* Right: Hero Image */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-medium hover:shadow-glow transition-all duration-300">
                <img 
                  src={heroImage}
                  alt="Fresh ingredients for cooking"
                  className="w-full h-[300px] md:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-background/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Smart Recipe Generator?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "Ingredient-Based",
                description: "Generate recipes from what you already have at home"
              },
              {
                icon: "🥗",
                title: "Dietary Filters",
                description: "Customize for vegetarian, vegan, gluten-free and more"
              },
              {
                icon: "⚡",
                title: "Instant Results",
                description: "Get AI-powered recipe suggestions in seconds"
              },
              {
                icon: "📊",
                title: "Nutrition Info",
                description: "Detailed nutritional breakdown for every recipe"
              },
              {
                icon: "⭐",
                title: "Save Favorites",
                description: "Build your personal cookbook of loved recipes"
              },
              {
                icon: "📱",
                title: "Mobile-First",
                description: "Perfect experience on any device, anywhere"
              }
            ].map((feature, i) => (
              <div 
                key={i}
                className="bg-gradient-card p-6 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 text-center"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Cooking?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of home cooks discovering new recipes every day
          </p>
          <Button 
            onClick={() => navigate('/generator')}
            size="lg"
            variant="secondary"
            className="shadow-glow"
          >
            Get Started Free
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
