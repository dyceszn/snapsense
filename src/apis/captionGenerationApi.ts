import axios from "axios";

const API_KEY = import.meta.env.VITE_APP_HUGGING_FACE_API_KEY;

export const generateCaption = async (input: string) => {
  const url =
    "https://api-inference.huggingface.co/models/google/flan-t5-large";

  try {
    const response = await axios.post(
      url,
      {
        inputs: input,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const result = response.data[0].generated_text;
    // console.log(result);
    console.log("stage (2/2) - caption generated");
    return result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error:", error.response?.data || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
};
