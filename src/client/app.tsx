import React, { useEffect } from "react";
import MainContainer from "./containers/main";
import Eth from "./components/eth";

export default function App(props: any) {
  return (
    <>
      <MainContainer style={{ height: "100%" }}>
        <div style={{ height: "100%", backgroundColor: "#fff" }}>
          <Eth />
        </div>
      </MainContainer>
    </>
  );
}
