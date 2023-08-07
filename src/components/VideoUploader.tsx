import React, { useRef, useEffect, useState } from "react";

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const VideoUploader: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [rectangle, setRectangle] = useState<Rectangle>({ x: 50, y: 50, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(0);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    const video = videoRef.current;
    if (!video) return;

    video.src = url;
    video.play();
  };

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    video.play();
  };

  const handlePause = () => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();
  };

  const handleSeekChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Number(event.target.value);
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    video.addEventListener("loadedmetadata", function () {
      setDuration(video.duration);
    });

    video.addEventListener("timeupdate", function () {
      setCurrentTime(video.currentTime);
    });

    // video.addEventListener("play", function () {
    //   const interval = setInterval(function () {
    //     context.drawImage(video, 0, 0, canvas.width, canvas.height);
    //   }, 20);
    //   return () => clearInterval(interval);
    // });

    const handleMouseDown = (event: MouseEvent) => {
      console.log("mouse down")
      if (
        event.clientX >= rectangle.x &&
        event.clientX <= rectangle.x + rectangle.width &&
        event.clientY >= rectangle.y &&
        event.clientY <= rectangle.y + rectangle.height
      ) {
        setIsDragging(true);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        setRectangle({
          ...rectangle,
          x: event.clientX - rectangle.width / 2,
          y: event.clientY - rectangle.height / 2,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [rectangle, isDragging]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    video.addEventListener("play", function () {
      const interval = setInterval(function () {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.strokeStyle = "red";
        context.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

        const imageData = context.getImageData(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        let totalBrightness = 0;

        for (let i = 0; i < imageData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];

          totalBrightness += 0.299 * r + 0.587 * g + 0.114 * b;
        }

        setBrightness(totalBrightness / (imageData.data.length / 4));
      }, 20);

      return () => clearInterval(interval);
    });
  }, [rectangle]);

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleUpload} />
      <button onClick={handlePlay}>Play</button>
      <button onClick={handlePause}>Pause</button>
      <p>Brightness: {brightness}</p>
      <div style={{ width: "640px" }}>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeekChange}
          style={{ width: "100%" }}
        />
        <p>
          Current Time: {Math.round(currentTime)} / {Math.round(duration)} seconds
        </p>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {Array.from({ length: Math.floor(duration / 10) + 1 }, (_, i) => (
            <span key={i}>{i * 10}</span>
          ))}
        </div>
      </div>
      <video ref={videoRef} style={{ display: "none" }} />
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
};
