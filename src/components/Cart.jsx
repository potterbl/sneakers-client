import React, {useEffect, useState} from 'react';
import '../style/Cart.css'
import {collection, getDocs, query, updateDoc, where} from "firebase/firestore";
import {db} from "../firebase";
import box from '../images/box.jpg'
import purchased from '../images/purchased.png'
const Cart = (props) => {
    const [items, setItems] = useState(null)
    const [userInfo, setUserInfo] = useState(null)
    const [summary, setSummary] = useState(0)
    const [isEmpty, setIsEmpty] = useState(false)
    const [isPurchased, setIsPurchased] = useState(false)

    useEffect(() => {
        document.body.classList.add('no-scroll')
        const fetchData = async () => {
            const querySnapshotUserinfo = await getDocs(query(collection(db, 'userinfo'), where('uid', '==', props.user.uid)))
            const queryDataUserinfo = querySnapshotUserinfo.docs.map((doc) => doc.data())
            setUserInfo(queryDataUserinfo[0])
            if(queryDataUserinfo[0].cart.length <= 0){
                setIsEmpty(true)
            }
        }
        const fetchItems = async () => {
            const querySnapshotItems = await getDocs(collection(db, 'items'));
            const queryDataItems = querySnapshotItems.docs.map((doc) => doc.data());
            setItems(queryDataItems)
        }
        fetchItems()
        fetchData()
    }, [props.user.uid]);

    const removeCart = async (itemId) => {
        const querySnapshot = await getDocs(query(collection(db, "userinfo"), where("uid", "==", props.user.uid)));
        querySnapshot.forEach((doc) => {
            const cart = doc.data().cart;
            const updatedCart = cart.filter(item => item.itemId !== itemId);
            updateDoc(doc.ref, {
                cart: updatedCart
            });
        });
        setUserInfo(prevUserInfo => ({
            ...prevUserInfo,
            cart: prevUserInfo.cart.filter(item => item.itemId !== itemId)
        }));

        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    useEffect(() => {
        if(userInfo){
            setSummary(userInfo.cart.reduce((total, cartItem) => total + cartItem.itemCost, 0));
        }
    }, [userInfo]);

    const purchase = async () => {
        const querySnapshot = await getDocs(query(collection(db, "userinfo"), where("uid", "==", props.user.uid)));
        querySnapshot.forEach((doc) => {
            updateDoc(doc.ref, {
                cart: []
            })
        })
        setIsPurchased(true)
    }

    return (
        <div
            style={{'display': props.isCart ? 'flex' : 'none'}}
            className={'cart-wrapper'}
            onClick={() => {
                props.setIsCart(false)
                document.body.classList.remove('no-scroll')
            }}
        >
            {items !== null && userInfo !== null && isEmpty ? (
                <div
                    className={`${props.isCart ? 'cart-anim' : ''} cart-empty`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2>Cart</h2>
                    <div className="empty-wrapper">
                        <div className="empty">
                            <img src={box} alt=""/>
                            <div className="empty-text">
                                <h3>Cart is empty</h3>
                                <p>Add at least one <br/> sneaker to do a purchase</p>
                            </div>
                            <button
                                className={'empty-button'}
                                onClick={() => {
                                    props.setIsCart(false)
                                    document.body.classList.remove('no-scroll')
                                }}
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            ) : items !== null && userInfo !== null && isEmpty === false && isPurchased === false ? (
                <div
                    className={`${props.isCart ? 'cart-anim' : ''} cart`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2>Cart</h2>
                    <div className="cart-items">
                        {items !== null && userInfo !== null && items.map(item => (
                            userInfo.cart.some(cart => cart.itemId === item.id) ? (
                                <div className="cart-card" key={item.id}>
                                    <img src={item.imagePath} alt="sneakers"/>
                                    <div className="card-additional">
                                        <div className="card-text">
                                            <p>{item.name}</p>
                                            <h3>{item.price} USD</h3>
                                        </div>
                                        <button
                                            className="card-button"
                                            onClick={() => removeCart(item.id)}
                                        ></button>
                                    </div>
                                </div>
                            ) : null
                        ))}
                    </div>
                    <div className="cart-purchase">
                        <div className="price">
                            <p className={'text'}>Summary:</p>
                            <p className="price-summary">{summary} USD</p>
                        </div>
                        <button
                            className={'confirm-purchase'}
                            onClick={purchase}
                        >
                            Confirm purchase
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className={`${props.isCart ? 'cart-anim' : ''} cart-purchased`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <h2>Cart</h2>
                    <div className="purchased">
                        <div className="purchased-inner">
                            <img src={purchased} alt=""/>
                            <div className="purchased-text">
                                <h3>Purchased!</h3>
                                <p>You purchase will be soon send to delivery company</p>
                            </div>
                            <button
                                className={'empty-button'}
                                onClick={() => {
                                    props.setIsCart(false)
                                    document.body.classList.remove('no-scroll')
                                }}
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Cart;