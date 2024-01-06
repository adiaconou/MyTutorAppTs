
import React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import AppBarView from "../navigation/AppBarView";

type MainLayoutProps = {
    children: React.ReactNode;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => (
    <Box
        sx={{
            display: "flex",
            flexDirection: "column",
        }}
    >
        <Box
            className="AppBarView_parent"
            sx={{ position: "fixed", top: 0, zIndex: 10, width: "100%" }}
        >
            <AppBarView />
        </Box>
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                alignItems: "center",
            }}
        >
            <Container
                maxWidth="md"
                sx={{ flexGrow: 1, paddingLeft: "0px", paddingRight: "0px" }}
            >
                {children}
            </Container>
        </Box>
    </Box>
);

export default MainLayout;