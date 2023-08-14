import React, { useRef, useEffect, useState } from "react";
import { Chart } from "chart.js/auto";
import { Rectangle, FrameData, ResizeDirection } from "../types/common";

export const VideoUploader: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  // const rectangleRef = useRef<Rectangle>({ x: 50, y: 50, width: 100, height: 100 });
  const rectangleRef = useRef<Rectangle[]>([
    { id: 1, name: "Nodule", color: "red", x: 50, y: 50, width: 100, height: 100 },
    { id: 2, name: "Parenchyma", color: "blue", x: 100, y: 50, width: 100, height: 100 },
  ]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [frameDataList, setFrameDataList] = useState<FrameData[]>([]);
  const chartRef = useRef<Chart | null>(null);
  const [videoWidth, setVideoWidth] = useState<number>(0);
  const [videoHeight, setVideoHeight] = useState<number>(0);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>("outside");
  const [lastMousePosition, setLastMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [graphXAxisMax, setGraphXAxisMax] = useState<number>(1);

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
      // x軸の最大値（分単位に変換して切り上げ）
      setGraphXAxisMax(Math.ceil(video.duration / 60.0));
    };

    video.ontimeupdate = () => {
      setCurrentTime(video.currentTime);
    };
  };

  // カメラアクセス
  const requestCameraAccess = async () => {
    try {
      // ユーザにカメラデバイスへのアクセス許可を求める
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      setVideoDevices(devices.filter((device) => device.kind === "videoinput"));
      // とりあえずデフォルト5分
      setGraphXAxisMax(5);
    } catch (error) {
      console.error("Error accessing the camera", error);
    }
  };

  useEffect(() => {
    if (
      chartRef.current &&
      chartRef.current.options &&
      chartRef.current.options.scales &&
      chartRef.current.options.scales.x
    ) {
      chartRef.current.options.scales.x.max = graphXAxisMax * 60;
      chartRef.current.update();
    }
  }, [graphXAxisMax]);

  useEffect(() => {
    if (videoDevices.length > 0) {
      setSelectedDeviceId(videoDevices[0].deviceId);
    }
  }, [videoDevices]);

  const handleVideoLoad = () => {
    if (videoRef.current) {
      const videoElement = videoRef.current;
      setVideoWidth(videoElement.videoWidth);
      setVideoHeight(videoElement.videoHeight);
    }
  };

  const handlePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (!video!.srcObject && selectedDeviceId) {
      video!.srcObject = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDeviceId } },
      });
    }

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

  const handleSelectedDeviceIdOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDeviceId(event.target.value);
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

  // マウスカーソルの座標、矩形座標、矩形の枠線の太さをもとにして、カーソル位置と矩形の位置関係を返す関数
  const getCursorLocation = (
    mouseX: number,
    mouseY: number,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number,
    borderThickness: number,
  ) => {
    const nearLeft = mouseX < rectX + borderThickness;
    const nearRight = mouseX > rectX + rectWidth - borderThickness;
    const nearTop = mouseY < rectY + borderThickness;
    const nearBottom = mouseY > rectY + rectHeight - borderThickness;

    if (nearTop && nearLeft) {
      return "top-left";
    } else if (nearTop && nearRight) {
      return "top-right";
    } else if (nearBottom && nearLeft) {
      return "bottom-left";
    } else if (nearBottom && nearRight) {
      return "bottom-right";
    } else if (nearLeft) {
      return "left";
    } else if (nearRight) {
      return "right";
    } else if (nearTop) {
      return "top";
    } else if (nearBottom) {
      return "bottom";
    } else if (mouseX >= rectX && mouseX <= rectX + rectWidth && mouseY >= rectY && mouseY <= rectY + rectHeight) {
      return "inside";
    } else {
      return "outside";
    }
  };

  const changeCursorStyleOnCanvas = (canvas: HTMLCanvasElement, cursorLocation: ResizeDirection) => {
    switch (cursorLocation) {
      case "left":
      case "right":
        canvas.style.cursor = "ew-resize";
        break;
      case "top":
      case "bottom":
        canvas.style.cursor = "ns-resize";
        break;
      case "top-left":
      case "bottom-right":
        canvas.style.cursor = "nwse-resize";
        break;
      case "top-right":
      case "bottom-left":
        canvas.style.cursor = "nesw-resize";
        break;
      case "inside":
        canvas.style.cursor = "grab";
        break;
      case "outside":
        canvas.style.cursor = "default";
        break;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const rect = canvas.getBoundingClientRect();

    const handleMouseDown = (event: MouseEvent) => {
      // 既存のクリック判定のロジック
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // TODO: 画面サイズに応じて変更する必要あり
      const borderThickness = 2;

      const cursorLocation = getCursorLocation(
        mouseX,
        mouseY,
        rectangleRef.current.x,
        rectangleRef.current.y,
        rectangleRef.current.width,
        rectangleRef.current.height,
        borderThickness,
      );

      switch (cursorLocation) {
        case "left":
        case "right":
        case "top":
        case "bottom":
        case "top-left":
        case "top-right":
        case "bottom-left":
        case "bottom-right":
          setIsResizing(true);
          setResizeDirection(cursorLocation);
          break;
        case "inside":
          setIsDragging(true);
          break;
        case "outside":
          break;
      }

      changeCursorStyleOnCanvas(canvas, cursorLocation);
      setLastMousePosition({ x: mouseX, y: mouseY });
    };

    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      if (isResizing && resizeDirection) {
        switch (resizeDirection) {
          case "left":
            rectangleRef.current.width += rectangleRef.current.x - mouseX;
            rectangleRef.current.x = mouseX;
            break;
          case "right":
            rectangleRef.current.width = mouseX - rectangleRef.current.x;
            break;
          case "top":
            rectangleRef.current.height += rectangleRef.current.y - mouseY;
            rectangleRef.current.y = mouseY;
            break;
          case "bottom":
            rectangleRef.current.height = mouseY - rectangleRef.current.y;
            break;
          case "top-left":
            rectangleRef.current.width += rectangleRef.current.x - mouseX;
            rectangleRef.current.height += rectangleRef.current.y - mouseY;
            rectangleRef.current.x = mouseX;
            rectangleRef.current.y = mouseY;
            break;
          case "top-right":
            rectangleRef.current.width = mouseX - rectangleRef.current.x;
            rectangleRef.current.height += rectangleRef.current.y - mouseY;
            rectangleRef.current.y = mouseY;
            break;
          case "bottom-left":
            rectangleRef.current.width += rectangleRef.current.x - mouseX;
            rectangleRef.current.height = mouseY - rectangleRef.current.y;
            rectangleRef.current.x = mouseX;
            break;
          case "bottom-right":
            rectangleRef.current.width = mouseX - rectangleRef.current.x;
            rectangleRef.current.height = mouseY - rectangleRef.current.y;
            break;
          default:
            break;
        }
      } else if (isDragging && lastMousePosition) {
        rectangleRef.current = {
          ...rectangleRef.current,
          x: mouseX - rectangleRef.current.width / 2,
          y: mouseY - rectangleRef.current.height / 2,
        };
        setLastMousePosition({ x: mouseX, y: mouseY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection("outside");
      setLastMousePosition(null);
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
      const currentTimestamp = video.currentTime; // video currentTime is in seconds

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
      canvas.addEventListener("mouseleave", handleMouseUp);
    };
  }, [isDragging, isResizing]);

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
          animation: false,
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
              min: 0,
              max: 255,
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
      {setVideoDevices.length > 0 && (
        <select value={selectedDeviceId || ""} onChange={handleSelectedDeviceIdOnChange}>
          {videoDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      )}
      {/* カメラアクセス */}
      <button onClick={requestCameraAccess}>Start Camera</button>
      {selectedDeviceId && (
        <input
          type="range"
          min="1"
          max="10"
          value={graphXAxisMax}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setGraphXAxisMax(Number(event.target.value))}
        />
      )}
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
