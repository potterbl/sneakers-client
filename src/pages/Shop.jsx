import React from 'react';
import Navbar from "../components/Navbar";
import Carousel from "../components/Carousel";
import '../style/Shop.css'
import Items from "../components/Items";
const Shop = (props) => {
    return (
        <div>
            <Navbar user={props.user} setIsLoggedIn={props.setIsLoggedIn}/>
            <hr/>
            <div className="shop-container">
                <Carousel user={props.user}/>
                <Items setUserInfo={props.setUserInfo} user={props.user} userInfo={props.userInfo}/>
            </div>
        </div>
    );
};

export default Shop;