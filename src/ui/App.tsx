import { useState } from "react";
import "./index.css";
import styles from "./App.module.css";

export default function App() {
  return (
    <main className="app">
      <div className="container">
        <Header />
        <SearchSection />
      </div>
    </main>
  );
}

// Types
type Recipe = {
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
};

type Ingredient = {
  name: string;
  quantity: string;
  unit: string;
};

// Header component
function Header() {
  return (
    <header className={styles.titleContainer}>
      <div className={styles.title}>
        <h1 className={styles.mainTitle}>FRIDGE CLEANER</h1>
        <p className={styles.subtitle}>-by: Vu-</p>
      </div>
    </header>
  );
}

// Search section
function SearchSection() {
  const [userPrompt, setUserPrompt] = useState<string>("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Generate 4 recipes
      const query = await generateQuery(userPrompt);
      const parsedRecipes = JSON.parse(query);
      setRecipes(parsedRecipes);

      // Generate images for all 4 recipes
      const images = await Promise.all(
        parsedRecipes.map((recipe: Recipe) => fetchImage(recipe.title))
      );
      setImageUrls(images);
    } catch (error) {
      console.error("Error generating recipes or images:", error);
      console.error("Raw response:", await generateQuery(userPrompt));
    }
  };

  const generateQuery = async (ingredients: string): Promise<string> => {
    const { generateRecipe } = window.electron;
    const recipes = await generateRecipe(ingredients);
    return recipes.trim();
  };

  const fetchImage = async (query: string): Promise<string> => {
    try {
      const { generateImage } = window.electron;
      if (!generateImage) {
        console.warn("generateImage is not defined on window.electron");
        return "";
      }
      const image = await generateImage(query);
      return image;
    } catch (error) {
      console.error("Error in generateImage:", error);
      return "";
    }
  };

  return (
    <section className={styles.body}>
      <h1 className={styles.whatareyoucookingtoday}>
        What are you cooking today?
      </h1>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          name="query-description"
          className={styles.inputField}
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="List ingredients you have in your fridge..."
        />
        <button className={styles.generateButton} type="submit">
          Generate
        </button>
      </form>

      {recipes.length > 0 && (
        <div className={styles.recipesContainer}> {}
          {recipes.map((recipe, index) => (
            <div key={index} className={styles.recipeCard}>
              {imageUrls[index] && (
                <img
                  src={imageUrls[index]}
                  alt={recipe.title}
                  className={styles.recipeImage}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedRecipe(recipe)}
                  onError={(e) => {
                    console.error("Image failed to load:", imageUrls[index]);
                    console.error("Error details:", e);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <h2 className={styles.recipeTitleMainScreen}>{recipe.title}</h2>
              <p className={styles.recipeDescriptionMainScreen}>{recipe.description}</p>
              <button
                className={styles.viewDetailsButton}
                onClick={() => setSelectedRecipe(recipe)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedRecipe && (
        <RecipeOverlay
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </section>
  );
}

function RecipeOverlay({ recipe, onClose }: { recipe: Recipe; onClose: () => void }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.overlayContent}>
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>
        <h2 className={styles.recipeTitle}>{recipe.title}</h2>
        <p className={styles.recipeDescription}>{recipe.description}</p>

        <h3 className={styles.recipeIngredients}>Ingredients</h3>
        <ul className={styles.ingredientsList}>
          {recipe.ingredients.map((ingredient, i) => (
            <li key={i} className={styles.ingredientsListItem}>
              {ingredient.quantity === "to taste"
                ? `${ingredient.name} to taste`
                : [ingredient.quantity, ingredient.unit, ingredient.name].filter(Boolean).join(" ")}
            </li>
          ))}
        </ul>

        <h3 className={styles.recipeInstructions}>Instructions</h3>
        <ol className={styles.instructionsList}>
          {recipe.instructions.map((step, i) => (
            <li className={styles.instructionsListItem} key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}