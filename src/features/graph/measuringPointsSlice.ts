import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { MeasuringPoint } from "../../types/common";

const initialState = {
  measuringPoints: [
    {id: 1, name: "nodule_base", x: 0.0, y: 0.0},
    {id: 2, name: "nodule_peak",x:  0.0, y: 0.0},
    {id: 3, name: "nodule_end",x:  0.0,y:  0.0},
    {id: 4, name: "parenchyma_base",x:  0.0,y:  0.0},
    {id: 5, name: "parenchyma_peak",x:  0.0,y:  0.0},


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
