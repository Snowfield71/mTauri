import { Router } from "vue-router";
import { optionData } from "./index.types";

export const navTo = (router: Router, options: optionData) => {
  router
    .push({
      name: options.name,
      query: options.query
        ? Object.fromEntries(
            Object.entries(options.query).filter(
              ([_, v]) => v !== null && v !== undefined,
            ),
          )
        : undefined,
    })
    .catch((err: Error) => {
      console.error("[Navigation] 失败:", err);
    });
};

export const toggleState = (stateName: boolean): boolean => {
  return !stateName;
};

export const debounce = <T>(
  func: (this: T, ...args: any[]) => void,
  wait: number,
) => {
  let timeout: NodeJS.Timeout;

  return function (this: T, ...args: any[]) {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
};
