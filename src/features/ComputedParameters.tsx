import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import { TICDataCategory, MeasuringPosition } from "../types/common";

const contrastRatios = createSelector(
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

export { contrastRatios };
