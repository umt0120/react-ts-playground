import { MeasuringPoint } from "../types/common";
import { MeasuringPointRow } from "./MeasuringPointRow";

type Props = {
  measuringPoints: MeasuringPoint[];
  selectedMeasuringPointId: number | null;
  setSelectedMeasuringPointId: (id: number) => void;
};

export const MeasuringPointTable = (props: Props) => {
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
        {props.measuringPoints.map((point) => (
          <MeasuringPointRow
            key={point.id}
            point={point}
            selectedMeasuringPointId={props.selectedMeasuringPointId}
            setSelectedMeasuringPointId={props.setSelectedMeasuringPointId}
          />
        ))}
      </tbody>
    </table>
  );
};
