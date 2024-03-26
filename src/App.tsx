import React from 'react'
import { LoadUserInfoWithThrottling } from "./LoadUserInfoWithThrottlingHook";

export const App = () => {
  return (
    <div
      style={{
        margin: "0 auto",
        width: "25rem",
        textAlign: "center",
        marginTop: "25rem"

      }}
    >
      <LoadUserInfoWithThrottling />
    </div>
  )
};