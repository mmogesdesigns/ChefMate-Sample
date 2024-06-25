import React, { useState, useEffect } from "react";
import {
  env,
  AutoProcessor,
  AutoModel,
  RawImage,
} from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.15.1";

env.allowLocalModels = false;

const EXAMPLE_URL =
  "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/city-streets.jpg";
const THRESHOLD = 0.25;

const ImageUpload = () => {
  const [status, setStatus] = useState("Loading model...");
  const [processor, setProcessor] = useState(null);
  const [model, setModel] = useState(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const processor = await AutoProcessor.from_pretrained(
          "Xenova/yolov9-c_all"
        );
        processor.feature_extractor.size = { shortest_edge: 256 };
        const model = await AutoModel.from_pretrained("Xenova/yolov9-c_all");
        setProcessor(() => processor);
        setModel(() => model);
        setStatus("Ready");
      } catch (error) {
        setStatus("Error loading model");
        console.error("Error loading model:", error);
      }
    };

    loadModel();
  }, []);

  const detect = async (url) => {
    if (!processor || !model) {
      setStatus("Model not ready");
      return;
    }

    try {
      setStatus("Analysing...");
      const image = await RawImage.fromURL(url);
      const ar = image.width / image.height;
      const [cw, ch] = ar > 1 ? [640, 640 / ar] : [640 * ar, 640];
      const container = document.getElementById("container");
      container.style.width = `${cw}px`;
      container.style.height = `${ch}px`;
      container.style.backgroundImage = `url(${url})`;

      const inputs = await processor(image);
      const { outputs } = await model(inputs);
      setStatus("");
      const sizes = inputs.reshaped_input_sizes[0].reverse();
      outputs
        .tolist()
        .forEach((x) => renderBox(x, sizes, model.config.id2label));
    } catch (error) {
      setStatus("Error during detection");
      console.error("Error during detection:", error);
    }
  };

  const renderBox = ([xmin, ymin, xmax, ymax, score, id], [w, h], labels) => {
    if (score < THRESHOLD) return;
    const color =
      "#" +
      Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, 0);
    const boxElement = document.createElement("div");
    boxElement.className = "bounding-box";
    Object.assign(boxElement.style, {
      borderColor: color,
      left: (100 * xmin) / w + "%",
      top: (100 * ymin) / h + "%",
      width: (100 * (xmax - xmin)) / w + "%",
      height: (100 * (ymax - ymin)) / h + "%",
    });
    const labelElement = document.createElement("span");
    labelElement.textContent = labels[id];
    labelElement.className = "bounding-box-label";
    labelElement.style.backgroundColor = color;
    boxElement.appendChild(labelElement);
    const container = document.getElementById("container");
    container.appendChild(boxElement);
  };

  const handleExampleClick = (e) => {
    e.preventDefault();
    detect(EXAMPLE_URL);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e2) => {
      const dataUrl = e2.target.result;
      detect(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h1>ChefMate</h1>
      <p id="status">{status}</p>
      <input type="file" id="upload" onChange={handleFileChange} />
      <button id="example" onClick={handleExampleClick}>
        Use Example Image
      </button>
      <div
        id="container"
        style={{
          position: "relative",
          margin: "20px 0",
          width: "640px",
          height: "auto",
        }}
      ></div>
      <style>
        {`
          .bounding-box {
            position: absolute;
            border: 2px solid;
          }
          .bounding-box-label {
            position: absolute;
            top: -20px;
            left: 0;
            padding: 2px 4px;
            font-size: 12px;
            color: #fff;
          }
        `}
      </style>
    </div>
  );
};


export default ImageUpload;
