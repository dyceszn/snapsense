import axios from "axios";

const API_KEY = import.meta.env.VITE_APP_GOOGLE_VISION_API_KEY;

type Images = {
  image1: string | null;
  image2: string | null;
};

export const detectText = async (image: string) => {
  const url = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;
  console.log("URL:", url);

  try {
    const response = await axios.post(url, {
      requests: [
        {
          image: {
            content: image,
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 1,
            },
          ],
          imageContext: {
            languageHints: ["en"],
          },
        },
      ],
    });
    // return response.data;
    if (
      response.data &&
      response.data.responses &&
      response.data.responses[0].fullTextAnnotation
    ) {
      const detectedText = response.data.responses[0].fullTextAnnotation.text;
      return detectedText;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Error:", error.response?.data || error.message);
    } else {
      console.error("Unexpected error:", error);
    }
  }
};

export const detectTexts = async (images: Images) => {
  const results = [];

  if (!images.image1 && !images.image2) {
    return;
  }
  if (images.image1) {
    const result_1 = await detectText(images.image1);
    results.push(result_1);
  }
  if (images.image2) {
    const result_2 = await detectText(images.image2);
    results.push(result_2);
  }
  const result = results.flat().join(", ");
  // console.log("Result:", result);
  return result;
};
