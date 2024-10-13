import { Link } from "react-router-dom"
import React from "react"
export default function NotFound(){
    return(
        <section className="section_reg">
        <div className="not-found nf">
            <h1>404 | not Found</h1>
            <h2>go to <Link to="/login">login</Link> page</h2>
            <h2>go to <Link to="/register">Register</Link> page</h2>
        </div>
        </section>
    )
}