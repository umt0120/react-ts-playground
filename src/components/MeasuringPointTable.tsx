import { MeasuringPoint } from "../types/common";

type Props = {
  measuringPoints: MeasuringPoint[];
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
          <tr
            key={point.id}
            id={"measuring-point-" + point.id}
            onClick={() => {
              const elm = document.getElementById("measuring-point-" + point.id);
              elm?.style.setProperty("background-color", "red");
              props.setSelectedMeasuringPointId(point.id);
            }}
          >
            <td>{point.name}</td>
            <td>{point.x}</td>
            <td>{point.y}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};


