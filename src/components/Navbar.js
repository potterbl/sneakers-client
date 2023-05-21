import React, {useEffect, useState} from 'react';
import '../style/Navbar.css'
import {collection, onSnapshot, query, where} from "firebase/firestore";
import {db} from "../firebase";
import Cart from "./Cart";
import {useNavigate} from "react-router-dom";
const Navbar = (props) => {
    const navigate = useNavigate()

    const [price, setPrice] = useState(0)
    const [isCart, setIsCart] = useState(false)

    const [isProfile, setIsProfile] = useState(false)

    const goFav = () => {
        navigate('/favorites')
    }

    useEffect(() => {
        if (props.user) {
            const fetchInfo = onSnapshot(
                query(collection(db, "userinfo"), where("uid", "==", props.user.uid)),
                (querySnapshot) => {
                    const queryData = querySnapshot.docs.map((doc) => doc.data());
                    const totalPrice = queryData[0].cart.reduce(
                        (accumulator, cartItem) => accumulator + cartItem.itemCost,
                        0
                    );
                    setPrice(totalPrice);
                }
            )

            return () => {
                fetchInfo()
            }
        }
    }, [props.user]);

    const logout = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('auth')
        props.setIsLoggedIn(false)
    }
    const handleProfile = () => {
        setIsProfile(!isProfile)
    }

    return (
        <div className="navbar">
            <div className="nav-left">
                <button className="logo"></button>
                <div className="nav-title">
                    <h2>SNEAKERS SHOP</h2>
                    <p>Best sneakers shop</p>
                </div>
            </div>
            <div className="nav-right">
                <button
                    className="nav-cart"
                    onClick={() => setIsCart(true)}
                >
                    {price} USD
                </button>
                {isCart ? (
                    <Cart
                        isCart={isCart}
                        setIsCart={setIsCart}
                        user={props.user}
                    />
                    ) : null}
                <button
                    className="nav-likes"
                    onClick={goFav}
                >

                </button>
                <button
                    className="nav-profile"
                    onClick={handleProfile}
                >

                </button>
                {isProfile ? (
                    <button
                        className="profile"
                        onClick={logout}
                    >
                        Log out
                    </button>
                    ) : null}
            </div>
        </div>
    );
};

export default Navbar;