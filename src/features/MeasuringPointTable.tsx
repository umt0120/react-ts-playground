import { RootState } from "../app/store";
import { MeasuringPointRow } from "./MeasuringPointRow";
import { useSelector } from "react-redux";

export const MeasuringPointTable = () => {
  const measuringPoints = useSelector((state: RootState) => state.measuringPoints);
  return (
    <table>
      <caption>Measuring Points</caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">X</th>
          <th scope="col">Y</th>
        </tr>
      </thead>
      <tbody>
        {measuringPoints.measuringPoints.map((point) => (
          <MeasuringPointRow key={point.id} point={point} />
        ))}
      </tbody>
    </table>
  );
};
