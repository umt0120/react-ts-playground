import React, { useRef, useEffect, useState } from "react";
// import { Chart } from "chart.js/auto";
import { Chart, ChartEvent, registerables } from "chart.js";
import { Rectangle, FrameData, MousePosition, MeasuringPoint } from "../types/common";
import { getNearestRectangle } from "../lib/rectangle";
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, LineController } from "chart.js";
import { getRelativePosition } from "chart.js/helpers";
import { MeasuringPointTable } from "./MeasuringPointTable";

Chart.register(...registerables);

export const VideoUploader: React.FC = () => {
  // ========== Video関連 ==========
  // Video要素の参照
  const videoRef = useRef<HTMLVideoElement>(null);
  // Video要素の幅
  const [videoWidth, setVideoWidth] = useState<number>(0);
  // Video要素の高さ
  const [videoHeight, setVideoHeight] = useState<number>(0);
  // Videoの長さ
  const [duration, setDuration] = useState<number>(0);
  // Video現在の時刻
  const [currentTime, setCurrentTime] = useState<number>(0);

  // ========== Camera関連 ==========
  // カメラデバイスのリスト
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  // 選択されたカメラデバイスのID
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // ========== グラフ関連 ==========
  // 輝度グラフの参照
  const chartRef = useRef<Chart | null>(null);
  // 輝度グラフのx軸の最大値
  const [graphXAxisMax, setGraphXAxisMax] = useState<number>(1);

  // ========== Canvas関連 ==========
  // Canvas要素の参照
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // ROIの参照リスト
  const rectangleRef = useRef<Rectangle[]>([
    new Rectangle(1, "Nodule", "red", 2, 50, 50, 100, 100),
    new Rectangle(2, "Parenchyma", "blue", 2, 100, 50, 100, 100),
  ]);

  // ROIの輝度データ
  const [frameDataList, setFrameDataList] = useState<{ rectangle: Rectangle; frameData: FrameData[] }[]>([
    {
      rectangle: { id: 1, name: "Nodule", color: "red", borderThickness: 2, x: 50, y: 50, width: 100, height: 100 },
      frameData: [],
    },
    {
      rectangle: {
        id: 2,
        name: "Parenchyma",
        color: "blue",
        borderThickness: 2,
        x: 100,
        y: 50,
        width: 100,
        height: 100,
      },
      frameData: [],
    },
  ]);
  // ROIの輝度データの総数
  const totalFrameDataLengths = frameDataList.reduce((prev, current) => prev + current.frameData.length, 0);
  // ROIがドラッグ中かどうか
  const [draggingMousePosition, setDraggingMousePosition] = useState<MousePosition>(MousePosition.OutSide);

  // ========== 計測点関連 ==========
  const [measuringPoints, setMeasuringPoints] = useState<MeasuringPoint[]>([
    new MeasuringPoint(1, "nodule_base", 0.0, 0.0),
    new MeasuringPoint(2, "nodule_peak", 0.0, 0.0),
    new MeasuringPoint(3, "nodule_end", 0.0, 0.0),
    new MeasuringPoint(4, "parenchyma_base", 0.0, 0.0),
    new MeasuringPoint(5, "parenchyma_peak", 0.0, 0.0),
  ]);
  const [selectedMeasuringPointId, setSelectedMeasuringPointId] = useState<number | null>(null);

  // ========== useEffect ==========
  // デバイスが選択されたら、最初のデバイスを選択するuseEffect
  useEffect(() => {
    if (videoDevices.length > 0) {
      setSelectedDeviceId(videoDevices[0].deviceId);
    }
  }, [videoDevices]);

  // Canvasの描画を行うuseEffect
  useEffect(() => {
    // Video要素とCanvas要素の参照を取得
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Canvasのコンテキストを取得
    const context = canvas.getContext("2d");
    if (!context) return;

    // Canvasの描画領域を取得
    const rect = canvas.getBoundingClientRect();

    // マウスクリック時のコールバック
    const handleMouseDown = (event: MouseEvent) => {
      //マウスの位置を取得
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // マウスの位置から最も近いROIと、当該ROIとマウス座標の位置関係を取得
      const { mousePosition } = getNearestRectangle(mouseX, mouseY, rectangleRef.current);
      setDraggingMousePosition(mousePosition);
      // マウスの位置によってカーソルの形状を変更
      changeCursorStyleOnCanvas(canvas, mousePosition);
    };

    // マウス移動時のコールバック
    const handleMouseMove = (event: MouseEvent) => {
      //　マウスの位置を取得
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // マウスの位置から最も近いROIと、当該ROIとマウス座標の位置関係を取得
      const { rectangle } = getNearestRectangle(mouseX, mouseY, rectangleRef.current);

      // マウスダウン時に記憶しておいた、最寄りのROIに対するマウスの位置関係によって処理を分岐
      switch (draggingMousePosition) {
        // 枠線上でマウスダウンされていた場合は、ROIのリサイズを行う
        case MousePosition.OnLeftLine:
          rectangle.width += rectangle.x - mouseX;
          rectangle.x = mouseX;
          break;
        case MousePosition.OnRightLine:
          rectangle.width = mouseX - rectangle.x;
          break;
        case MousePosition.OnTopLine:
          rectangle.height += rectangle.y - mouseY;
          rectangle.y = mouseY;
          break;
        case MousePosition.OnBottomLine:
          rectangle.height = mouseY - rectangle.y;
          break;
        case MousePosition.OnTopLeftCorner:
          rectangle.width += rectangle.x - mouseX;
          rectangle.height += rectangle.y - mouseY;
          rectangle.x = mouseX;
          rectangle.y = mouseY;
          break;
        case MousePosition.OnTopRightCorner:
          rectangle.width = mouseX - rectangle.x;
          rectangle.height += rectangle.y - mouseY;
          rectangle.y = mouseY;
          break;
        case MousePosition.OnBottomLeftCorner:
          rectangle.width += rectangle.x - mouseX;
          rectangle.height = mouseY - rectangle.y;
          rectangle.x = mouseX;
          break;
        case MousePosition.OnBottomRightCorner:
          rectangle.width = mouseX - rectangle.x;
          rectangle.height = mouseY - rectangle.y;
          break;
        case MousePosition.Inside:
          // ドラッグ時は、マウスの移動量に合わせてROIの位置を変更
          rectangle.x = mouseX - rectangle.width / 2;
          rectangle.y = mouseY - rectangle.height / 2;
          break;
        default:
          break;
      }
    };

    // マウスアップ時のコールバック
    const handleMouseUp = () => {
      setDraggingMousePosition(MousePosition.OutSide);
      // setIsResizing(false);
    };

    // Canvasにイベントリスナーを登録
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);

    // Canvasの描画 (requestAnimationFrameを使って再帰的に描画)
    const drawFrame = () => {
      // ビデオが一時停止中または終了している場合は何もしない
      if (video.paused || video.ended) return;

      // Canvasにビデオのフレームを描画
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // ビデオの現在の時刻を取得(秒)
      const currentTimestamp = video.currentTime;
      // ROIごとに輝度を計算
      rectangleRef.current.forEach((rectangle) => {
        // ROIの枠線を描画
        context.strokeStyle = rectangle.color;
        context.lineWidth = rectangle.borderThickness;
        context.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        // ROI部分の画像を取得
        const roi = context.getImageData(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        // ROI部分の平均輝度を計算
        const averageLuminance = getAverageLuminance(roi);
        // ROIの輝度データ
        const frameData: FrameData = {
          timestamp: currentTimestamp,
          averageLuminance: averageLuminance,
        };
        // ROIの輝度データを保存
        setFrameDataList((prev) => {
          // idが一致するROIのデータを取得
          const index = prev.findIndex((data) => data.rectangle.id === rectangle.id);
          if (index !== -1) {
            // ROIの輝度データを追加
            prev[index].frameData.push(frameData);
          }
          return prev;
        });
      });
      // 再帰的に次のフレームの描画をリクエスト
      requestAnimationFrame(drawFrame);
    };

    // ビデオの再生時にフレームを描画するイベントリスナーを登録
    video.addEventListener("play", drawFrame);

    return () => {
      // コールバック削除
      video.removeEventListener("play", drawFrame);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mouseleave", handleMouseUp);
    };
  }, [draggingMousePosition]);

  // 輝度グラフの描画を行うuseEffect
  useEffect(() => {
    if (chartRef.current === null && frameDataList.length > 0) {
      // 輝度グラフへの参照を取得
      const ctx = document.getElementById("luminanceChart") as HTMLCanvasElement;
      // 輝度グラフのデータ
      // TODO: 点を描画する場合はここでデータを追加すれば良い
      const chartDatasets = frameDataList.map((data) => ({
        label: data.rectangle.name,
        data: data.frameData.map((frameData) => ({ x: frameData.timestamp, y: frameData.averageLuminance })),
        borderColor: data.rectangle.color,
        fill: false,
      }));
      chartDatasets.push({
        label: "Point1",
        data: [{ x: 10, y: 10 }],
        borderColor: "black",
        fill: false,
      });
      // 輝度グラフを描画
      chartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: [],
          datasets: chartDatasets,
        },
        options: {
          // パフォーマンス優先のため、アニメーションを無効にする
          animation: false,
          // クリックイベントのみ有効にする
          events: ["click"],
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
          onClick: graphOnClick,
        },
      });
    }
  }, []);

  // x軸の最大値が変更されたら、グラフのx軸の最大値を変更するuseEffect
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

  // 輝度グラフのデータを更新するuseEffect
  useEffect(() => {
    if (chartRef.current && frameDataList.length > 0) {
      // フレームごとの輝度データごとに
      frameDataList.forEach((data) => {
        // 輝度グラフのデータを更新
        chartRef.current?.data.datasets.forEach((dataset) => {
          // ROIの名前が一致するデータセットを探す
          if (dataset.label === data.rectangle.name) {
            // データを更新
            dataset.data = data.frameData.map((frameData) => ({
              x: frameData.timestamp,
              y: frameData.averageLuminance,
            }));
          }
        });
      });
      // 輝度グラフを更新
      chartRef.current.update();
    }
  }, [totalFrameDataLengths]);

  // 計測点の描画を行うuseEffect
  useEffect(() => {
    // Canvas要素の参照を取得
    const canvas = canvasRef.current;
    if (!canvas) return;
  }, [measuringPoints]);

  // ========== コールバック関数 ==========
  // ファイル入力時のコールバック
  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    // ファイルを取得
    const file = event.target.files?.[0];
    if (!file) return;

    // ファイルのURLを取得
    const url = URL.createObjectURL(file);

    // Video要素の参照を取得
    const video = videoRef.current;
    if (!video) return;

    // Video要素にファイルを設定
    video.src = url;
    video.load();

    // Video要素のメタデータが読み込まれたら
    video.onloadedmetadata = () => {
      // Videoの長さを設定
      setDuration(video.duration);
      // x軸の最大値（分単位に変換して切り上げ）を設定
      setGraphXAxisMax(Math.ceil(video.duration / 60.0));
    };
    // Video要素の再生位置が変更されたら
    video.ontimeupdate = () => {
      // Videoの現在の時刻を設定
      setCurrentTime(video.currentTime);
    };
  };

  // カメラアクセス時のコールバック
  const requestCameraAccess = async () => {
    try {
      // ユーザにカメラデバイスへのアクセス許可を求める
      await navigator.mediaDevices.getUserMedia({ video: true });
      // カメラデバイスのリストを取得
      const devices = await navigator.mediaDevices.enumerateDevices();
      // カメラデバイスのリストを設定
      setVideoDevices(devices.filter((device) => device.kind === "videoinput"));
      // カメラからの映像取り込み時はデフォルト5分でx軸の最大値を設定する
      setGraphXAxisMax(5);
    } catch (error) {
      console.error("Error accessing the camera", error);
    }
  };

  // Video要素の読み込み時のコールバック
  const handleVideoLoad = () => {
    if (videoRef.current) {
      // Video要素の幅と高さを設定
      const videoElement = videoRef.current;
      setVideoWidth(videoElement.videoWidth);
      setVideoHeight(videoElement.videoHeight);
    }
  };

  // 再生ボタンクリック時のコールバック
  const handlePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    // カメラからの映像取り込み時は、選択されたカメラデバイスの映像を取り込む
    if (!video!.srcObject && selectedDeviceId) {
      video!.srcObject = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDeviceId } },
      });
    }

    // 再生
    video.play();
  };

  // 停止ボタンクリック時のコールバック
  const handlePause = () => {
    const video = videoRef.current;
    if (!video) return;

    // 停止
    video.pause();
  };

  // シークバー変更時のコールバック
  const handleSeekChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    // シークバーの値に合わせてビデオの再生位置を変更
    video.currentTime = Number(event.target.value);
  };

  // カメラデバイス選択時のコールバック
  const handleSelectedDeviceIdOnChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // 選択されたカメラデバイスのIDを設定
    setSelectedDeviceId(event.target.value);
  };

  // ========== その他の関数 ==========
  // 画像の平均輝度を計算する関数
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

  // マウスの位置によってカーソルの形状を変更する関数
  const changeCursorStyleOnCanvas = (canvas: HTMLCanvasElement, mousePosition: MousePosition) => {
    switch (mousePosition) {
      case MousePosition.OnLeftLine:
      case MousePosition.OnRightLine:
        // 左側・右側の境界線上にマウスがある場合は左右リサイズカーソル
        canvas.style.cursor = "ew-resize";
        break;
      case MousePosition.OnTopLine:
      case MousePosition.OnBottomLine:
        // 上側・下側の境界線上にマウスがある場合は上下リサイズカーソル
        canvas.style.cursor = "ns-resize";
        break;
      case MousePosition.OnTopLeftCorner:
      case MousePosition.OnBottomRightCorner:
        // 左上・右下の境界線上にマウスがある場合は左上右下リサイズカーソル
        canvas.style.cursor = "nwse-resize";
        break;
      case MousePosition.OnTopRightCorner:
      case MousePosition.OnBottomLeftCorner:
        // 右上・左下の境界線上にマウスがある場合は右上左下リサイズカーソル
        canvas.style.cursor = "nesw-resize";
        break;
      case MousePosition.Inside:
        // ROI内にマウスがある場合はドラッグカーソル
        canvas.style.cursor = "grab";
        break;
      default:
        // それ以外はデフォルトカーソル
        canvas.style.cursor = "default";
        break;
    }
  };

  // 計測点の情報を更新する関数
  const updateMeasuringPoint = (x: number, y: number) => {
    const updatedMeasuringPoints = measuringPoints.map((point) =>
      point.id === selectedMeasuringPointId ? { ...point, x: x, y: y } : point,
    );
    setMeasuringPoints(updatedMeasuringPoints);
  };

  const graphOnClick = (event: ChartEvent) => {
    if (!chartRef.current) return;

    // FIXME: Chart初期化時の処理をオブジェクトベタ書きしているため、型エラーが出る。後で直す
    // @ts-expect-error
    const canvasPosition = getRelativePosition(event, chartRef.current);

    // Substitute the appropriate scale IDs
    const dataX = chartRef.current.scales.x.getValueForPixel(canvasPosition.x);
    const dataY = chartRef.current.scales.y.getValueForPixel(canvasPosition.y);
    if (dataX === undefined || dataY === undefined) return;
    updateMeasuringPoint(dataX, dataY);
  };

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

      <div>selected: {selectedMeasuringPointId}</div>
      {/* MeasuringPointの一覧 */}
      <MeasuringPointTable
        measuringPoints={measuringPoints}
        selectedMeasuringPointId={selectedMeasuringPointId}
        setSelectedMeasuringPointId={setSelectedMeasuringPointId}
      />

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
