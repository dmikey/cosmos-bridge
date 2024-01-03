import React from "react";
import { Layout, Menu, Alert } from "antd";
const { Header, Content, Footer } = Layout;

export default function MainContainer(props: any) {
  return (
    <Layout className="layout" style={{ height: "100%" }}>
      <Alert
        style={{ textAlign: "center" }}
        message="AKASH-TESTNET-6 TO ETHEREUM ROPSTEN"
        type="warning"
      />
      <Header>
        <div className="logo" />
      </Header>
      <Content style={{ padding: "0 50px" }}>
        <div className="site-layout-content" style={{ height: "100%" }}>
          {props.children}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>Powered by Akash Network</Footer>
    </Layout>
  );
}
