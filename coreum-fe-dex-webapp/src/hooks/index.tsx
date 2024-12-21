import { useState } from "react";
import {
  autoUpdate,
  shift,
  Placement,
  computePosition,
} from "@floating-ui/react";

export enum TooltipPosition {
  TOP = "top",
  TOP_RIGHT = "top-end",
  TOP_LEFT = "top-start",
  RIGHT = "right",
  BOTTOM = "bottom",
  BOTTOM_LEFT = "bottom-start",
  BOTTOM_RIGHT = "bottom-end",
  LEFT = "left",
}

export const useTooltip = () => {
  const [isShown, setIsShown] = useState(false);

  const showTooltip = (
    element: HTMLElement,
    content: any,
    position: TooltipPosition,
    width?: string
  ) => {
    let tooltip = document.getElementById("tooltip-message");

    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = "tooltip-message";
      tooltip.style.width = width ? width : "fit-content";
    }
    tooltip.innerHTML = content;

    function wrapper(referenceEl: HTMLElement, floatingEl: HTMLElement) {
      return computePosition(referenceEl, floatingEl, {
        placement: position as Placement,
        middleware: [shift()],
      });
    }
    const cleanup = autoUpdate(element, tooltip, () => {
      if (!tooltip) return;
      wrapper(element, tooltip).then(({ x, y }) => {
        Object.assign(tooltip.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      });
    });
    document.getElementById("root")!.appendChild(tooltip);
    cleanup();
  };

  const hideTooltip = () => {
    const tooltip = document.getElementById("tooltip-message");
    if (tooltip) {
      tooltip.style.opacity = "0"; // Fade out
      // Delay removal to allow for transition
      setIsShown(false);
      tooltip.remove();
    }
  };

  return {
    showTooltip,
    hideTooltip,
    isShown,
  };
};
