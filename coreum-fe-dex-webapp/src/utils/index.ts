import BigNumber from "bignumber.js";

export const toFixedDown = (
  float: number | BigNumber,
  decimals: number
): string => {
  let zeros: string[] = [];

  for (let i = 0; i < decimals; i++) {
    zeros.push("0");
  }

  let zerosString = zeros.join("");
  let factor = new BigNumber(`1${zerosString}`);

  let newAmount: BigNumber;
  let numeralFloat = BigNumber.isBigNumber(float)
    ? float
    : new BigNumber(float);
  if (factor.gt(0)) {
    newAmount = numeralFloat.decimalPlaces(decimals, BigNumber.ROUND_DOWN);
  } else {
    newAmount = new BigNumber(0);
  }

  return newAmount.toFormat();
};

export const minus = (
  a: number | BigNumber,
  b: number | BigNumber
): BigNumber => {
  let x = typeof a === "number" ? new BigNumber(a) : a;
  let y = typeof b === "number" ? new BigNumber(b) : b;
  return x.minus(y);
};

export const multiply = (a: number | string, b: number | string): BigNumber => {
  let x = new BigNumber(a);
  let y = new BigNumber(b);
  return x.multipliedBy(y);
};

export const divide = (a: number | string, b: number | string): BigNumber => {
  let x = new BigNumber(a);
  let y = new BigNumber(b);
  return x.dividedBy(y);
};

export const noExponents = (number: number) => {
  let expRegex = /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)/g;
  if (!expRegex.test(String(number))) return resolveAndFixPrecision(number);

  var data = String(number).split(/[eE]/);

  var z = "",
    sign = number < 0 ? "-" : "",
    str = data[0].replace(".", ""),
    mag = Number(data[1]) + 1;

  if (mag < 0) {
    z = sign + "0.";
    while (mag++) z += "0";
    return z + str.replace(/^\-/, "");
  }
  mag -= str.length;

  while (mag--) z += "0";

  return str + z;
};

export const resolveAndFixPrecision = (num: string | number): string => {
  let precision = 2;
  let amount = typeof num === "number" ? num : Number(num);
  if (amount > 10000) {
    precision = 2;
  } else if (amount > 100) {
    precision = 4;
  } else if (amount >= 1) {
    precision = 6;
  } else if (amount < 1) {
    precision = 8;
  } else if (amount < 0.00000001) {
    precision = 12;
  }
  const fixed = toFixedDown(amount, precision);
  if (fixed === "NaN" || Number.isNaN(fixed) || fixed === "0") {
    return num.toString();
  }
  return fixed;
};

export const getAvgPriceFromOBbyVolume = (ob: number[][], volume: string) => {
  let remaining = Number(volume) > 0 ? Number(volume) : 0.000001;

  let factor = 0;
  let sumV = 0;
  let sumP = 0;
  if (typeof ob === "undefined") {
    return 0;
  }

  if (!ob.length) {
    return 0;
  }

  // let obToCheck = action === "buy" ? ob.reverse() : ob;

  ob.map((o) => {
    if (remaining > 0) {
      if (Number(o[1]) >= remaining) {
        factor = remaining;
        remaining = 0;
      } else {
        remaining = remaining - Number(o[1]);
        factor = Number(o[1]);
      }
      sumV += factor;
      sumP += o[0] * factor;
    }
  });
  return divide(sumP, sumV).valueOf();
};

export const truncate = (n: number | string) => {
  const number = String(n).replaceAll(",", "");

  const num = number.replace(/^([0-9\.]{1,15}).*/g, (_, b) => b);

  return num;
};

enum WalletType {
  KEPLR = "keplr",
  LEAP = "leap",
  VECTIS = "vectis",
  COSMOSTATION = "cosmostation",
  WALLETCONNECT = "walletconnect",
  WC_KEPLR_MOBILE = "wc_keplr_mobile",
  WC_LEAP_MOBILE = "wc_leap_mobile",
  WC_COSMOSTATION_MOBILE = "wc_cosmostation_mobile",
  WC_CLOT_MOBILE = "wc_clot_mobile",
  METAMASK_SNAP_LEAP = "metamask_snap_leap",
  METAMASK_SNAP_COSMOS = "metamask_snap_cosmos",
  STATION = "station",
  XDEFI = "xdefi",
  CAPSULE = "capsule",
  COSMIFRAME = "cosmiframe",
  COMPASS = "compass",
  INITIA = "initia",
}

export const SUPPORTED_WALLETS = [
  WalletType.LEAP,
  WalletType.COSMOSTATION,
  WalletType.KEPLR,
];
