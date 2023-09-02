import { configureStore } from "@reduxjs/toolkit";
import measuringPointsReducer from "../features/graph/measuringPointsSlice";

export const store = configureStore({
  reducer: {
    measuringPoints: measuringPointsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
