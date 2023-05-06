import React from "react";

export default function AppBarViewModel() {

    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const handleMenuClick = () => {
      setDrawerOpen(true);
    };
  
    const handleClose = () => {
      setDrawerOpen(false);
    };

    const getDrawerOpen = (): boolean => {
        return drawerOpen;
    }
    
    return {
        handleMenuClick,
        handleClose,
        getDrawerOpen
    }
}