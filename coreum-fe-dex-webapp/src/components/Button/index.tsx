import React from "react";
import "./Button.scss";

interface ButtonProps {
  label: string;
  image?: string;
  onClick?: () => void;
  className?: string;
  variant?: ButtonVariantType;
  height?: string | number;
  width?: string | number;
}

export const ButtonVariant = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
};

export type ButtonVariantType =
  (typeof ButtonVariant)[keyof typeof ButtonVariant];

const Button: React.FC<ButtonProps> = ({
  label,
  image,
  onClick,
  className,
  variant = ButtonVariant.PRIMARY,
  height,
  width,
}) => {
  return (
    <button
      className={`button button-${variant} ${className || ""}`}
      onClick={onClick}
      style={{ height, width }}
    >
      {image && <img src={image} alt={label} className="button-image" />}
      <span className="button-label">{label}</span>
    </button>
  );
};

export default Button;
