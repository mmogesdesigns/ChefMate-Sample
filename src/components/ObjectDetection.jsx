
import React, { useState, useEffect } from "react";
import { createWorker } from "../WorkerSerup";
const ObjectDetection = () => {
  const workerRef = useRef(null);
  const [image, setImage] = useState(null);
  const [results, setResults] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
      });
    }

    const onMessageReceived = (e) => {
      const { status, result } = e.data;
      console.log("Message received from worker:", e.data);
      setStatus(status);
      if (status === "complete") {
        setResults(result);
      }
    };

    workerRef.current.addEventListener("message", onMessageReceived);

    return () => {
      workerRef.current.removeEventListener("message", onMessageReceived);
    };
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log("Image uploaded:", e.target.result);
      setImage(e.target.result);
      setResults(null);
      setStatus("processing");
      workerRef.current.postMessage({ image: e.target.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h1>Object Detection</h1>
      <input type="file" onChange={handleImageUpload} />
      {image && (
        <img src={image} alt="Uploaded" style={{ maxWidth: "500px" }} />
      )}
      {status === "processing" && <p>Processing...</p>}
      {results && (
        <div>
          <h2>Detection Results</h2>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};
export default ObjectDetection;
