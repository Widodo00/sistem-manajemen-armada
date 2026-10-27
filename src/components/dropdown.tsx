import Select, { type MultiValue, type SingleValue } from "react-select";
import type { OptionInterface } from "../types/general";

export default function Dropdown({
  option,
  value,
  disable = false,
  placeholder,
  handleOnChange,
  multi = false,
}: {
  option: OptionInterface[];
  value: OptionInterface;
  disable?: boolean;
  placeholder: string;
  handleOnChange: (value: number | string | null | MultiValue<OptionInterface> | SingleValue<OptionInterface>) => void;
  multi?: boolean;
}) {
  return (
    <Select<OptionInterface, boolean>
      options={option}
      value={value}
      isDisabled={disable}
      placeholder={placeholder}
      onChange={(evt) => handleOnChange(evt)}
      isMulti={multi}
      styles={{
        indicatorSeparator: () => ({ display: "none" }),
      }}
    />
  );
}
