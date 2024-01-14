import React from "react";
import Box from "@mui/material/Box";
import AppBarView from "../navigation/AppBarView";

type MainLayoutProps = {
    children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
    <Box
        className="MainLayout_parent"
        sx={{
            maxWidth: "800px",
            margin: 'auto',
        }}
    >
        <Box
            className="AppBarView_parent"
            sx={{
                position: "fixed",
                top: 0,
                zIndex: 10,
            }}
        >
            <AppBarView />
        </Box>
        <Box
            className="MainLayout_children"
            sx={{
                width: "100%",
            }}
        >
            {children}
        </Box>
    </Box>
);

export default MainLayout;