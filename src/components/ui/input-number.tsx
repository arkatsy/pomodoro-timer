import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InputNumberProp extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
}

// Works only with positive integers
const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProp>(
  ({ className, min = 0, max = Infinity, step = 1, defaultValue, ...props }, ref) => {
    const [value, setValue] = React.useState(defaultValue || 0);

    const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      const newValue = Number(value);
      if (newValue < min || isNaN(newValue)) {
        return;
      }

      if (newValue > max) {
        setValue(max);
        return;
      } else setValue(newValue);
    };

    const onPlusClick = () => {
      const newValue = value + step;
      if (newValue > max) return;
      setValue(newValue);
    };

    const onMinusClick = () => {
      const newValue = value - step;
      if (newValue < min) return;
      setValue(newValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onPlusClick();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onMinusClick();
      }
    };

    return (
      <div className="relative flex w-full max-w-[185px] items-center">
        <Input
          aria-valuemax={max}
          aria-valuemin={min}
          aria-valuenow={value}
          inputMode="numeric"
          className={cn("mr-2", className)}
          onInput={onInput}
          value={value}
          onKeyDown={handleKeyDown}
          {...props}
        />
        <div className="absolute right-2 top-0">
          <Button
            name="increment"
            aria-label="increment"
            variant="outline"
            type="button"
            className="rounded-none"
            onClick={onPlusClick}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
          <Button
            name="decrement"
            aria-label="decrement"
            variant="outline"
            type="button"
            className="rounded-l-none border-l-0"
            onClick={onMinusClick}
          >
            <MinusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  },
);

InputNumber.displayName = "Input Number";

export default InputNumber;
