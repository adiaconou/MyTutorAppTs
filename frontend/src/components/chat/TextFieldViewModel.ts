import { useState } from "react";

interface TextFieldViewModelProps {
  onSubmit: (inputValue: string) => void;
}

export function useTextFieldViewModel({ onSubmit }: TextFieldViewModelProps) {
    const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (
    event?: React.MouseEvent<SVGSVGElement> | React.FormEvent<HTMLFormElement>
  ) => {
    event?.preventDefault();
    onSubmit(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  const handleBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    event.preventDefault();
  };

  return {
    inputValue,
    handleInputChange,
    handleSubmit,
    handleKeyPress,
    handleBlur,
  };
};
