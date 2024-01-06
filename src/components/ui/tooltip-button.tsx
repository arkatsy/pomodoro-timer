import { ComponentProps, ElementRef, forwardRef } from "react";
import { Button } from "./button";
import { DialogTrigger } from "./dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

type ButtonWithTooltipProps = ComponentProps<typeof Button> & {
  tooltip: string;
};

const TooltipButton = forwardRef<ElementRef<typeof DialogTrigger>, ButtonWithTooltipProps>(
  ({ children, tooltip, ...props }, ref) => {
    return (
      <TooltipProvider disableHoverableContent delayDuration={650}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button {...props} ref={ref}>
              {children}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);

export default TooltipButton;
