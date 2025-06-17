"use client";

import { FC, PropsWithChildren } from "react";
import { useScriptInjection } from "../hooks/useScriptInjection";

export const ScriptLayout: FC<PropsWithChildren> = ({ children }) => {
  // Hook này sẽ tự động inject scripts vào các vị trí thích hợp
  useScriptInjection();

  return <>{children}</>;
};
