import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";
import type { FrameData, MeasuringPoint, Rectangle } from "../../types/common";
import { RootState } from "../../app/store";
import { MeasuringPosition, TICDataCategory } from "../../types/common";

export interface TicData {
  id: number;
  name: string;
  category: TICDataCategory;
  frameData: FrameData[];
  roi: Rectangle;
  measuringPoints: MeasuringPoint[];
}

const initialState = [
  {
    id: 1,
    name: "nodule",
    category: TICDataCategory.Nodule,
    frameData: [],
    roi: {
      id: 1,
      name: "nodule",
      category: TICDataCategory.Nodule,
      color: "red",
      borderThickness: 2,
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    },
    measuringPoints: [
      {
        parentId: 1,
        name: "nodule_base",
        category: TICDataCategory.Nodule,
        position: MeasuringPosition.Base,
        borderColor: "red",
        pointStyle: "rect",
        x: 0.0,
        y: 0.0,
      } as MeasuringPoint,
      {
        parentId: 1,
        name: "nodule_peak",
        category: TICDataCategory.Nodule,
        position: MeasuringPosition.Peak,
        borderColor: "red",
        pointStyle: "circle",
        x: 0.0,
        y: 0.0,
      } as MeasuringPoint,
      {
        parentId: 1,
        name: "nodule_end",
        category: TICDataCategory.Nodule,
        position: MeasuringPosition.End,
        borderColor: "red",
        pointStyle: "star",
        x: 0.0,
        y: 0.0,
      } as MeasuringPoint,
    ],
  } as TicData,
  {
    id: 2,
    name: "parenchyma",
    category: TICDataCategory.Nodule,
    frameData: [],
    roi: {
      id: 2,
      name: "parenchyma",
      category: TICDataCategory.Nodule,
      color: "blue",
      borderThickness: 2,
      x: 100,
      y: 50,
      width: 100,
      height: 100,
    },
    measuringPoints: [
      {
        parentId: 2,
        name: "parenchyma_base",
        category: TICDataCategory.Parenchyma,
        position: MeasuringPosition.Base,
        borderColor: "blue",
        pointStyle: "rect",
        x: 0.0,
        y: 0.0,
      } as MeasuringPoint,
      {
        parentId: 2,
        name: "parenchyma_peak",
        category: TICDataCategory.Parenchyma,
        position: MeasuringPosition.Peak,
        borderColor: "blue",
        pointStyle: "circle",
        x: 0.0,
        y: 0.0,
      } as MeasuringPoint,
    ],
  } as TicData,
];

const ticDataSlice = createSlice({
  name: "ticData",
  initialState: initialState,
  reducers: {
    updateMeasuringPoint: (
      state,
      action: PayloadAction<{ category: TICDataCategory; position: MeasuringPosition; x: number; y: number }>,
    ) => {
      const { category, position, x, y } = action.payload;
      const ticDataIndex = state.findIndex((td) => td.category === category);
      const measuringPointIndex = state[ticDataIndex].measuringPoints.findIndex(
        (mp) => mp.category === category && mp.position === position,
      );
      state[ticDataIndex].measuringPoints[measuringPointIndex].x = x;
      state[ticDataIndex].measuringPoints[measuringPointIndex].y = y;
    },
    pushFrameData: (state, action: PayloadAction<{ category: TICDataCategory; frameData: FrameData }>) => {
      const { category, frameData } = action.payload;
      const ticDataIndex = state.findIndex((td) => td.category === category);
      state[ticDataIndex].frameData.push(frameData);
    },
  },
});


export const contrastRatios = createSelector(
  (state: RootState) => state.ticData,
  (ticData) => {
    let noduleBaseValue: number | undefined;
    let nodulePeakValue: number | undefined;
    let parenchymaBaseValue: number | undefined;
    let parenchymaPeakValue: number | undefined;

    for (const data of ticData) {
      if (data.category === TICDataCategory.Nodule) {
        noduleBaseValue = data.measuringPoints.find((point) => point.position === MeasuringPosition.Base)?.y;
        nodulePeakValue = data.measuringPoints.find((point) => point.position === MeasuringPosition.Peak)?.y;
      } else if (data.category === TICDataCategory.Parenchyma) {
        parenchymaBaseValue = data.measuringPoints.find((point) => point.position === MeasuringPosition.Base)?.y;
        parenchymaPeakValue = data.measuringPoints.find((point) => point.position === MeasuringPosition.Peak)?.y;
      }
    }

    if (
      noduleBaseValue !== undefined &&
      nodulePeakValue !== undefined &&
      parenchymaBaseValue !== undefined &&
      parenchymaPeakValue !== undefined
    ) {
      const contrastRatio = (nodulePeakValue - noduleBaseValue) / (parenchymaPeakValue - parenchymaBaseValue);
      return contrastRatio;
    }

    return undefined; // Handle the case where the necessary data is not found
  },
);

export const { updateMeasuringPoint, pushFrameData } = ticDataSlice.actions;
export default ticDataSlice.reducer;
