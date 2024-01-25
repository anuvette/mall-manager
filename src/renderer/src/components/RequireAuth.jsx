import { Navigate, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../customHooks/useAuth";

const RequireAuth = (props) => {
    const { token, roleInSession } = useAuth();
    const navigate = useNavigate();

    if (!token) {
        return <Navigate to="/SignIn"/>; 
    }

    if (roleInSession.toLowerCase() === 'superuser' || props.allowedRole.toLowerCase() === 'all') {
        return <Outlet />;
    }

    if (props.allowedRole.toLowerCase() !== roleInSession.toLowerCase()) {
        return <Navigate to={"/Home/forbidden"}/>
    }

    return <Outlet />;
}

export default RequireAuth;