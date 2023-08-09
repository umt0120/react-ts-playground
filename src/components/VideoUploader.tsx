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
  const rectangleRef = useRef<Rectangle>({ x: 50, y: 50, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(0);

  // ファイル入力時のコールバック
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    const video = videoRef.current;
    if (!video) return;

    video.src = url;
    video.load();

    video.onloadedmetadata = () => {
      setDuration(video.duration);
    };

    video.ontimeupdate = () => {
      setCurrentTime(video.currentTime);
    };
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

    const rect = canvas.getBoundingClientRect();

    const handleMouseDown = (event: MouseEvent) => {
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      if (
        mouseX >= rectangleRef.current.x &&
        mouseX <= rectangleRef.current.x + rectangleRef.current.width &&
        mouseY >= rectangleRef.current.y &&
        mouseY <= rectangleRef.current.y + rectangleRef.current.height
      ) {
        setIsDragging(true);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      if (isDragging) {
        rectangleRef.current = {
          ...rectangleRef.current,
          x: mouseX - rectangleRef.current.width / 2,
          y: mouseY - rectangleRef.current.height / 2,
        };
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    video.addEventListener("play", function () {
      const interval = setInterval(function () {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.strokeStyle = "red";
        context.strokeRect(
          rectangleRef.current.x,
          rectangleRef.current.y,
          rectangleRef.current.width,
          rectangleRef.current.height,
        );

        const imageData = context.getImageData(
          rectangleRef.current.x,
          rectangleRef.current.y,
          rectangleRef.current.width,
          rectangleRef.current.height,
        );
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

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div>
      {/* 画像入力 */}
      <input type="file" accept="video/*" onChange={handleUpload} />
      {/* 再生・停止ボタン */}
      <button onClick={handlePlay}>Play</button>
      <button onClick={handlePause}>Pause</button>

      {/* 現在フレームの輝度 */}
      <p>Brightness: {brightness}</p>

      <div style={{ width: "640px" }}>
        {/* シークバー */}
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeekChange}
          style={{ width: "100%" }}
        />

        {/* 現在時刻 */}
        <p>
          Current Time: {Math.round(currentTime)} / {Math.round(duration)} seconds
        </p>
        {/* シークバー目盛り */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {Array.from({ length: Math.floor(duration / 10) + 1 }, (_, i) => (
            <span key={i}>{i * 10}</span>
          ))}
        </div>
      </div>
      {/* 動画 */}
      <video ref={videoRef} style={{ display: "none" }} />
      {/* フレームを描画するCanvas */}
      <canvas ref={canvasRef} width="640" height="480" />
    </div>
  );
};
