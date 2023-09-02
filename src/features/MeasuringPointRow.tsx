import { MeasuringPoint } from "../types/common";
import { useSelector, useDispatch } from "react-redux";
import { selectMeasuringPoint } from "./graph/measuringPointsSlice";
import { RootState } from "../app/store";

type Props = {
  point: MeasuringPoint;
};

export const MeasuringPointRow = (props: Props) => {
  const selectedMeasuringPointId = useSelector((state: RootState) => state.measuringPoints.selectedMeasuringPointId);
  const dispatch = useDispatch();
  const isSelected = selectedMeasuringPointId === props.point.id;
  const selectedStyle = isSelected ? "bg-blue-500 text-white" : "";
  const handleClick = () => {
    dispatch(selectMeasuringPoint(props.point.id));
  };
  return (
    <tr
      key={props.point.id}
      id={"measuring-props.point-" + props.point.id}
      className={"hover:bg-blue-100 cursor-pointer " + selectedStyle}
      onClick={handleClick}
    >
      <td>{props.point.name}</td>
      <td>{props.point.x}</td>
      <td>{props.point.y}</td>
    </tr>
  );
};
