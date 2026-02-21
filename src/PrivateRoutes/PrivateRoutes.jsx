import Layout from "pages/Layout";
import React from "react";
import { Navigate, Route } from "react-router-dom";
import { commonRoute } from "utils/constants";

const PrivateRoutes = ({
  isRouting,
  component,
  isBack,
  headerText,
  layoutId,
  path,
  key,
}) => {
  return isRouting ? (
    <Route
      key={key}
      path={path}
      element={
        <Layout
          layoutId={layoutId || ""}
          isBack={isBack}
          headerText={headerText}
        >
          {component}
        </Layout>
      }
    />
  ) : (
    <Route
      key={key}
      path={path}
      element={<Navigate to={commonRoute.faq} replace />}
    />
  );
};

export default PrivateRoutes;
