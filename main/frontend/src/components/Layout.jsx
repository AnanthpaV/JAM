import { Outlet } from "react-router-dom";
import Interface from "./Interface";
import React from "react";
import "./layout.css";

export default function Layout(){
    return(
        <div className="layout">
            <Interface/>
            <div className="outlet">
            <Outlet/>
            </div>
        </div>
    );
}