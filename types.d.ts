declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
}

  type EventPayloadMapping = {
    generateRecipe: string;
    generateImage: string;
  };
  
  type UnsubscribeFunction = () => void;
  
  interface Window {
    electron: {
      generateRecipe: (ingredients: string) => Promise<string>;
      generateImage: (query: string) => Promise<string>;
    };
  }