import { MeasuringPoint } from "../types/common";

type Props = {
  point: MeasuringPoint;
  selectedMeasuringPointId: number | null;
  setSelectedMeasuringPointId: (id: number) => void;
};

export const MeasuringPointRow = (props: Props) => {
  const isSelected = props.selectedMeasuringPointId === props.point.id;
  const selectedStyle = isSelected ? "bg-blue-500 text-white" : "";
  return (
    <tr key={props.point.id}
    id={"measuring-props.point-" + props.point.id}
    className={"hover:bg-blue-100 cursor-pointer " + selectedStyle}
    onClick={() => props.setSelectedMeasuringPointId(props.point.id)}
    >
      <td>{props.point.name}</td>
      <td>{props.point.x}</td>
      <td>{props.point.y}</td>
    </tr>
  );
};
