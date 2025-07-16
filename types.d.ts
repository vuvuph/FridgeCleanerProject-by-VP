declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

  type EventPayloadMapping = {
    generateRecipe: string;
    generateImage: string;
  };
  
  interface Window {
    electron: {
      generateRecipe: (ingredients: string) => Promise<string>;
      generateImage: (query: string) => Promise<string>;
    };
  }