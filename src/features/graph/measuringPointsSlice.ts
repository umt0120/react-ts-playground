import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { MeasuringPoint } from "../../types/common";
import type { Color, PointStyle } from "chart.js";

const initialState = {
  measuringPoints: [
    { id: 1, name: "nodule_base", borderColor: "red" as Color, pointStyle: "rect" as PointStyle, x: 0.0, y: 0.0 },
    { id: 2, name: "nodule_peak", borderColor: "red" as Color, pointStyle: "circle" as PointStyle, x: 0.0, y: 0.0 },
    { id: 3, name: "nodule_end", borderColor: "red" as Color, pointStyle: "star" as PointStyle, x: 0.0, y: 0.0 },
    { id: 4, name: "parenchyma_base", borderColor: "blue" as Color, pointStyle: "rect" as PointStyle, x: 0.0, y: 0.0 },
    {
      id: 5,
      name: "parenchyma_peak",
      borderColor: "blue" as Color,
      pointStyle: "circle" as PointStyle,
      x: 0.0,
      y: 0.0,
    },
  ],
  selectedMeasuringPointId: 1,
};

const measuringPointsSlice = createSlice({
  name: "measuringPoints",
  initialState: initialState,
  reducers: {
    updateMeasuringPoint: (state, action: PayloadAction<MeasuringPoint>) => {
      const { id, x, y } = action.payload;
      const index = state.measuringPoints.findIndex((mp) => mp.id === id);
      state.measuringPoints[index].x = x;
      state.measuringPoints[index].y = y;
    },
    selectMeasuringPoint: (state, action: PayloadAction<number>) => {
      state.selectedMeasuringPointId = action.payload;
    },
  },
});

export const { updateMeasuringPoint, selectMeasuringPoint } = measuringPointsSlice.actions;

export default measuringPointsSlice.reducer;
