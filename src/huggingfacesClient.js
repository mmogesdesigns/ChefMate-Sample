import { pipeline } from "@xenova/transformers";



// Function to classify an image
const classifyImage = async (base64Image) => {
  try {
    console.log('Classifying image...'); // Debug: Log before classification
    const classifier = await pipeline('object-detection', 'AdamCodd/yolos-small-person');
    console.log('Pipeline created:', classifier); // Debug: Log the created pipeline

    const output = await classifier(base64Image);
    console.log('Classification output:', output); // Debug: Log the classification output
    return output;
  } catch (error) {
    console.error('Error during classification:', error); // Debug: Log any errors
    throw error;
  }
};


export default classifyImage;

// import { pipeline } from "@xenova/transformers";

// const classifyImage = async (imageUrl) => {
//   // Initialize the image classification pipeline
//     console.log("Classifying image...");
//   const classifier = await pipeline(
//     "image-classification",
//     "Xenova/vit-base-patch16-224"
//   );

//   // Run the classifier on the provided image URL
//   const output = await classifier(imageUrl);
//    console.log("Classification output:", output);
//   return output;
// };

// export default classifyImage;
