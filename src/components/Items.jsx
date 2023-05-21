import React, {useEffect, useRef, useState} from 'react';
import '../style/Items.css'
import {collection, getDocs, updateDoc, query, where, arrayUnion, onSnapshot} from 'firebase/firestore'
import { db } from '../firebase';
import Loader from "./Loader";

const Items = (props) => {
    const [items, setItems] = useState(null)
    const [sortedItems, setSortedItems] = useState(null)
    const [sort, setSort] = useState('')

    const propsRef = useRef(props);

    useEffect(() => {
        const fetchItems = async () => {
            const querySnapshot = await getDocs(collection(db, 'items'));
            const queryData = querySnapshot.docs.map((doc) => doc.data());
            setItems(queryData);
            setSortedItems(queryData);
        };

        const changeItems = onSnapshot(
            query(collection(db, 'userinfo'), where("uid", "==", propsRef.current.user.uid)),
            (querySnapshot) => {
                const queryData = querySnapshot.docs.map((doc) => doc.data());
                propsRef.current.setUserInfo(queryData[0]);
            }
        );

        fetchItems();

        return () => {
            changeItems();
        };
    }, []);

    const handleCart = async (e, itemId, itemCost) => {
        const querySnapshot = await getDocs(query(collection(db, "userinfo"), where("uid", "==", props.user.uid)));

        if (!e.target.classList.contains('card-added')) {
            querySnapshot.forEach((doc) => {
                updateDoc(doc.ref, {
                    cart: arrayUnion({
                        itemId: itemId,
                        itemCost: itemCost,
                    })
                });
            });
            e.target.classList.add('card-added')
        } else {
            querySnapshot.forEach((doc) => {
                const cart = doc.data().cart;
                const updatedCart = cart.filter(item => item.itemId !== itemId);
                updateDoc(doc.ref, {
                    cart: updatedCart
                });
            });
            e.target.classList.remove('card-added')
        }
    }

    const handleFav = async (e, itemId) => {
        const querySnapshot = await getDocs(query(collection(db, 'userinfo'), where('uid', '==', props.user.uid)))

        if(!e.target.classList.contains('fav-added')){
            querySnapshot.docs.forEach(doc => {
                updateDoc(doc.ref, {
                    favorites: arrayUnion({
                        itemId: itemId
                    })
                })
            })
            e.target.classList.add('fav-added')
        } else {
            querySnapshot.forEach(doc => {
                const favs = doc.data().favorites
                const updatedFavs = favs.filter(fav => fav.itemId !== itemId)
                updateDoc(doc.ref, {
                    favorites: updatedFavs
                })
            })
            e.target.classList.remove('fav-added')
        }

    }

    const handleSearch = (e) => {
        setSort(e.target.value);
        const filteredItems = items.filter(item => item.name.toLowerCase().includes(e.target.value.toLowerCase()));
        setSortedItems(filteredItems);
    };

    if (sortedItems === null) {
        return <Loader/>
    }

    return (
        <div className="items">
            <div className="items-heading">
                <h1>All Sneakers</h1>
                <input
                    type="search"
                    placeholder="Search..."
                    onChange={(e) => handleSearch(e)}
                    value={sort}
                />
            </div>
            <div className="items-list">
                {props.userInfo && sortedItems !== null && sortedItems.map((item, index) => (
                    <div className="item-card" key={index}>
                        <div className="item-image">
                            <button
                                className={`${props.userInfo.favorites.some(fav => fav.itemId === item.id) ? 'fav-added' : ''} item-like`}
                                onClick={(e) => handleFav(e, item.id)}
                            ></button>
                            <img src={item.imagePath} alt=""/>
                        </div>
                        <p className="card-name">{item.name}</p>
                        <div className="card-bottom">
                            <div className="card-pricing">
                                <p className="pricing-title">
                                    price:
                                </p>
                                <h4 className="card-price">
                                    {item.price} USD
                                </h4>
                            </div>
                            <button
                                className={`${props.userInfo.cart.some(cart => cart.itemId === item.id) ? 'card-added' : ''} card-add`}
                                onClick={(e) => handleCart(e, item.id, item.price)}
                            >

                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Items;