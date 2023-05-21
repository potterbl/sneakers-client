import './App.css';
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import {useState} from "react";
import Shop from "./pages/Shop";
import Container from "./components/Container";
import Login from "./components/Login";
import Favorites from "./pages/Favorites";

function App() {
    const [user, setUser] = useState(null)
    const [userInfo, setUserInfo] = useState(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    return (
        <BrowserRouter>
            <Container>
                <Routes>
                    {/*<Route*/}
                    {/*    path='/'*/}
                    {/*    element={user ? <Chat/> : <Navigate to={'/login'}/>}*/}
                    {/*/>*/}
                    <Route
                        path='/login'
                        element={isLoggedIn ? <Navigate to='/'/> :
                            <Login
                                setIsLoggedIn={setIsLoggedIn}
                                user={user}
                                setUser={setUser}
                                setUserInfo={setUserInfo}
                                userInfo={userInfo}
                            />}
                    />
                    <Route
                        path={'/'}
                        element={isLoggedIn ? <Shop
                                setIsLoggedIn={setIsLoggedIn}
                                setUserInfo={setUserInfo}
                                user={user}
                                userInfo={userInfo}
                            /> :
                            <Navigate to='/login'/>}
                    />
                    <Route
                        path={'/favorites'}
                        element={isLoggedIn ? <Favorites
                                setIsLoggedIn={setIsLoggedIn}
                                setUserInfo={setUserInfo}
                                user={user}
                                userInfo={userInfo}
                            /> :
                            <Navigate to='/login'/>}
                    />
                    <Route
                        path="*"
                        element={<Navigate to="/"/>}
                    />
                </Routes>
            </Container>
        </BrowserRouter>
    );
}

export default App;
