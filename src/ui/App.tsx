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
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted with prompt:", userPrompt);

    try {
      const query = await generateQuery(userPrompt);
      const parsedRecipe = JSON.parse(query);
      console.log("Parsed recipe object:", parsedRecipe);
      setRecipe(parsedRecipe);
      
      const image = await fetchImage(parsedRecipe.title);
      console.log("Image query received:", image);
      if (image) {
        console.log("Setting image URL state with:", image);
        setImageUrl(image);
      } else {
        console.warn("No image URL returned from generateImage");
      }
    } catch (error) {
      console.error("Error generating recipe or image:", error);
    }
  };

  const generateQuery = async (ingredients: string): Promise<string> => {
    const { generateRecipe } = window.electron;
    const recipe = await generateRecipe(ingredients);
    return recipe.trim();
  };

  const fetchImage = async (query: string): Promise<string> => {
    try {
      const { generateImage } = window.electron;
      if (!generateImage) {
        console.warn("generateImage is not defined on window.electron");
        return "";
      }
      console.log("Generating image for query:", query);
      const image = await generateImage(query);
      console.log("Image URL received:", image);
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

      {recipe && (
        <div className={styles.resultContainer}>
          {imageUrl && (
            <>
              <img
                src={imageUrl}
                alt={recipe.title}
                className={styles.recipeImage}
                onError={(e) => {
                  console.error("Image failed to load:", imageUrl);
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </>
          )}
          <h2>{recipe.title}</h2>
          <p>{recipe.description}</p>

          <div className={styles.recipeContentWrapper}>
            <h3>Ingredients</h3>
            <ul>
              {recipe.ingredients.map((ingredient, i) => (
                <li key={i}>
                  {ingredient.quantity === "to taste"
                    ? `${ingredient.name} to taste`
                    : [ingredient.quantity, ingredient.unit, ingredient.name]
                      .filter(Boolean)
                      .join(" ")}
                </li>
              ))}
            </ul>

            <h3>Instructions</h3>
            <ol className={styles.instructionsList}>
              {recipe.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}
