import React, { useState } from "react";

const Login = ({ login, logErr, lengthErr }) => {
    const [pass, setPass] = useState("");

    const onPassChange = (e) => {
        setPass(e.target.value);
    }

    const handleLogin = () => {
        login(pass);
    }

    let renderLogErr, renderLengthErr;

    logErr ? renderLogErr = <span className='login-error'>Incorrect password</span> : null

    lengthErr ? renderLengthErr = <span className='login-error'>Password must be longer than 5 char.</span> : null

    return (
        <div className="login-container">
            <div className="login">
                <h2 className="uk-modal-title uk-text-center">Authorization</h2>
                <div className="uk-margin-top uk-text-lead">Password:</div>
                <input
                    type="password"
                    id=""
                    className="uk-input uk-margin-top"
                    laceholder="Password"
                    value={pass}
                    onChange={onPassChange} />
                {renderLengthErr}{renderLogErr}
                <button
                    className="uk-button uk-button-primary uk-margin-top"
                    type="button"
                    onClick={handleLogin}>Enter</button>
            </div>
        </div>
    )
}

export default Login;