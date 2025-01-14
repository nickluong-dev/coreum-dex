import BigNumber from "bignumber.js";
import classNames from "classnames";
import { CSSProperties, ReactNode } from "react";

export interface FormatNumberProps {
  /** Sets the number to be formatted. */
  number: number | string;
  /** String(s) to add classnames to the component. */
  className?: string;
  /** Font size for the component. Refer to the FontSize enum */
  fontSize?: number | string;
  /** Boolean to determine if the component is inside a ```<p/>``` tag. If false, all style props and classname will be ignored. */
  insideElement?: boolean;
  /** Boolean to determine if the component should display small decimals. If true, the decimals will appear inside a ```<span/>``` tag. */
  smallDecimals?: boolean;
  customStyle?: CSSProperties;
  precision?: number;
  prefix?: string | ReactNode;
  suffix?: string | ReactNode;
}

export function FormatNumber(props: FormatNumberProps) {
  const {
    number,
    className = "",
    fontSize,
    insideElement = true,
    smallDecimals = true,
    customStyle,
    precision,
    prefix,
    suffix,
  } = props;

  let formatted;
  const num = typeof number === "string" ? number : new BigNumber(number);
  const [ints, decimals] = (
    typeof num === "string" ? num : num.toFormat()
  ).split(".");
  let bigInts: string | BigNumber = ints;

  if (!ints.includes(",")) {
    bigInts = ints === "-0" ? ints : new BigNumber(ints).toFormat();
  }

  let finalDecimals = decimals || "";

  if (precision) {
    const decsArr = finalDecimals.split("");

    if (decsArr.length < precision) {
      const numZero = precision - decsArr.length;
      for (let i = 0; i < numZero; i++) {
        decsArr.push("0");
      }
      finalDecimals = decsArr.join("");
    } else if (decsArr.length > precision) {
      finalDecimals = decsArr.slice(0, precision).join("");
    }
  }

  formatted = insideElement ? (
    <p
      className={classNames("format__number", className)}
      style={{
        ...(fontSize && { fontSize: fontSize }),
        ...customStyle,
      }}
    >
      {prefix && prefix}
      {bigInts === "NaN" ? "--" : bigInts}
      {finalDecimals && (
        <span className={`${smallDecimals ? "decimal" : ""}`}>
          .{finalDecimals}
        </span>
      )}
      {suffix && suffix}
    </p>
  ) : (
    <>
      {prefix && prefix}
      {bigInts === "NaN" ? "--" : bigInts}
      {finalDecimals && (
        <span className={`${smallDecimals ? "decimal" : ""}`}>
          .{finalDecimals}
        </span>
      )}
      {suffix && suffix}
    </>
  );

  return formatted;
}
