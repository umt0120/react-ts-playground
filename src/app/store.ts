import { configureStore } from "@reduxjs/toolkit";
import measuringPointsReducer from "../features/graph/measuringPointsSlice";
import ticDataReducer from "../features/tic/ticDataSlice";

export const store = configureStore({
  reducer: {
    measuringPoints: measuringPointsReducer,
    ticData: ticDataReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
