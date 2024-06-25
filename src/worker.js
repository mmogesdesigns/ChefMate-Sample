import { pipeline } from "@xenova/transformers";

class MyTranslationPipeline {
  static task = "object-detection";
  static model = "Xenova/detr-resnet-50";
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }

    return this.instance;
  }
}

self.onmessage = async (event) => {
  const { image } = event.data;
  console.log("Received image in worker:", image);
  const detector = await MyObjectDetectionPipeline.getInstance();
  const result = await detector(image, { threshold: 0.9 });
  console.log("Detection result:", result);
  self.postMessage({ status: "complete", result });
};
// const detector = await pipeline('object-detection', 'Xenova/detr-resnet-50');

// const img = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/cats.jpg';
// const output = await detector(img, { threshold: 0.9 });


