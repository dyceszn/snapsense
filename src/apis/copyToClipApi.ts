// Function to copy caption text to clipboard
export const copyToClipboard = (text: string) => {
  if (text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("Text copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }
};
