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
  const isSelected = selectedMeasuringPointId === props.point.parentId;
  const selectedStyle = isSelected ? "bg-blue-500 text-white" : "";
  const handleClick = () => {
    dispatch(selectMeasuringPoint(props.point.parentId));
  };
  return (
    <tr
      key={props.point.parentId}
      id={"measuring-props.point-" + props.point.parentId}
      className={"hover:bg-blue-100 cursor-pointer " + selectedStyle}
      onClick={handleClick}
    >
      <td>{props.point.name}</td>
      <td>{props.point.x}</td>
      <td>{props.point.y}</td>
    </tr>
  );
};
