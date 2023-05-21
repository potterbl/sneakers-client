import React from 'react';
import '../style/Carousel.css'
import cermit from '../images/cermit.png'
import blazer from '../images/blazer.png'
import {collection, getDocs, doc, query, updateDoc, where} from "firebase/firestore";
import {db} from "../firebase";
const Carousel = (props) => {
    const handleAdd = async () => {
        const querySnapshot = await getDocs(query(collection(db, 'userinfo'), where('uid', '==', props.user.uid)));
        const queryData = querySnapshot.docs.map((doc) => doc.data());
        const cartItems = queryData[0].cart;
        const newItem = { itemId: 'NBMS2', itemCost: 39 };
        const isItemExists = cartItems.some((item) => item.itemId === newItem.itemId); // Проверяем, есть ли уже такой элемент в корзине

        if (isItemExists) {
        } else {
            cartItems.push(newItem);
            await updateDoc(doc(db, 'userinfo', querySnapshot.docs[0].id), { cart: cartItems });
        }
    };

    return (
        <div className="carousel-wrapper">
            <div className="carousel-text">
                <h1><span>Blazer Mid,</span><br/>Forever!</h1>
                <button onClick={handleAdd}>Buy</button>
            </div>
            <div className="carousel-cermit">
                <img src={cermit} alt=""/>
            </div>
            <div className="carousel-image">
                <img src={blazer} alt=""/>
            </div>
        </div>
    );
};

export default Carousel;