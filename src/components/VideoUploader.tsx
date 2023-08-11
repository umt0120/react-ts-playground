import React, { useRef, useEffect, useState } from "react";
import { Chart } from "chart.js/auto";

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FrameData {
  timestamp: number; // milliseconds
  averageLuminance: number;
}

export const VideoUploader: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const rectangleRef = useRef<Rectangle>({ x: 50, y: 50, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [frameDataList, setFrameDataList] = useState<FrameData[]>([]);
  const chartRef = useRef<Chart | null>(null);
  const [videoWidth, setVideoWidth] = useState<number>(0);
  const [videoHeight, setVideoHeight] = useState<number>(0);

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

  // カメラアクセス
  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current!.srcObject = stream;
      videoRef.current!.play();
    } catch (error) {
      console.error("Error accessing the camera", error);
    }
  };

  const handleVideoLoad = () => {
    if (videoRef.current) {
      const videoElement = videoRef.current;
      setVideoWidth(videoElement.videoWidth);
      setVideoHeight(videoElement.videoHeight);

    }
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

  const getAverageLuminance = (imageData: ImageData) => {
    let luminanceSum = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      const r = imageData.data[i];
      const g = imageData.data[i + 1];
      const b = imageData.data[i + 2];
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      luminanceSum += luminance;
    }
    return luminanceSum / (imageData.data.length / 4);
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

    const drawFrame = () => {
      if (video.paused || video.ended) return;

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

      const averageLuminance = getAverageLuminance(imageData);
      const currentTimestamp = video.currentTime * 1000; // video currentTime is in seconds

      const frameData: FrameData = {
        timestamp: currentTimestamp,
        averageLuminance: averageLuminance,
      };
      setFrameDataList((prev) => [...prev, frameData]);

      // 再帰的に次のフレームの描画をリクエスト
      requestAnimationFrame(drawFrame);
    };

    video.addEventListener("play", drawFrame);

    return () => {
      video.removeEventListener("play", drawFrame);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (chartRef.current === null) {
      const ctx = document.getElementById("luminanceChart") as HTMLCanvasElement;
      chartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: "Average Luminance",
              data: [],
              borderColor: "blue",
              fill: false,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: "linear",
              position: "bottom",
              title: {
                display: true,
                text: "Timestamp (ms)",
              },
            },
            y: {
              title: {
                display: true,
                text: "Average Luminance",
              },
            },
          },
        },
      });
    }
  }, []);

  useEffect(() => {
    if (chartRef.current && frameDataList.length > 0) {
      const lastFrameData = frameDataList[frameDataList.length - 1];

      chartRef.current.data.datasets[0].data.push({
        x: lastFrameData.timestamp,
        y: lastFrameData.averageLuminance,
      });

      chartRef.current.update();
    }
  }, [frameDataList]);

  return (
    <div>
      {/* 画像入力 */}
      <input type="file" accept="video/*" onChange={handleUpload} />
      {/* カメラアクセス */}
      <button onClick={requestCameraAccess}>Start Camera</button>
      {/* 再生・停止ボタン */}
      <button onClick={handlePlay}>Play</button>
      <button onClick={handlePause}>Pause</button>

      {/* 現在フレームの輝度 */}
      <p>Brightness: {frameDataList.length}</p>

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
      {/* <video ref={videoRef} style={{ display: "none" }} /> */}
      <video
        ref={videoRef}
        style={{ display: "none" }}
        width={videoWidth}
        height={videoHeight}
        playsInline
        onLoadedData={handleVideoLoad}
      />

      {/* フレームを描画するCanvas */}
      <canvas ref={canvasRef} width="640" height="480" />
      {/* 輝度グラフ */}
      <canvas id="luminanceChart" width="640" height="200"></canvas>
    </div>
  );
};
