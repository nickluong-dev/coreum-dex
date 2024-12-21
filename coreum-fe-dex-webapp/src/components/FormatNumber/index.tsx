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
  fillZero?: boolean;
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
    fillZero = false,
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
  let finalDecimals = decimals;

  if (precision) {
    const decsArr = decimals?.split("");
    if (decimals?.length > precision) {
      let newDecs = [];

      for (var i = 0; i < precision; i++) {
        newDecs.push(decsArr[i]);
      }

      finalDecimals = newDecs.join("");
    } else if (decimals?.length <= precision && fillZero) {
      let newDecs = [...decsArr];
      const numZero = precision - decimals.length;
      for (var i = 0; i < numZero; i++) {
        newDecs.push("0");
      }
      finalDecimals = newDecs.join("");
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
      {decimals && (
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
      {decimals &&
        (smallDecimals ? (
          <span className={`${smallDecimals ? "decimal" : ""}`}>
            .{finalDecimals}
          </span>
        ) : (
          `.${finalDecimals}`
        ))}
      {suffix && suffix}
    </>
  );

  return formatted;
}
