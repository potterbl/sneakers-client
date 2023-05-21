import React, {useEffect, useState} from 'react';
import Navbar from "../components/Navbar";
import '../style/Favorites.css'
import {arrayUnion, collection, getDocs, onSnapshot, query, updateDoc, where} from "firebase/firestore";
import {db} from "../firebase";
import {useNavigate} from "react-router-dom";
import Loader from "../components/Loader";
import sad from "../images/sad.png"
const Favorites = (props) => {
    const navigate = useNavigate()
    const [items, setItems] = useState(null)
    const [userInfo, setUserInfo] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            const querySnapshotItems = await getDocs(collection(db, 'items'))
            const queryDataItems = querySnapshotItems.docs.map((doc) => doc.data())

            setItems(queryDataItems)
        }
        const fetchUser = onSnapshot(query(collection(db, 'userinfo'), where('uid', '==', props.user.uid)),
            (querySnapshot) => {
                const queryDataUser = querySnapshot.docs.map((doc) => doc.data())

                setUserInfo(queryDataUser[0])
            })

        fetchData()
        return () => {
            fetchUser()
        }
    }, [props.user.uid])

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

    if((items || userInfo) === null){
        return <Loader/>
    }

    return (
        <div>
            <Navbar user={props.user} setIsLoggedIn={props.setIsLoggedIn}/>
            <hr/>
            <div className="favorites">
                {items && userInfo && userInfo.favorites.length > 0 ? <div className="fav-heading">
                    <button
                        className="back-fav"
                        onClick={() => navigate('/')}
                    >

                    </button>
                    <h2>My favorites</h2>
                </div> : null}

                <div className="favs-wrapper">
                    {items && userInfo && userInfo.favorites.length > 0 ? (items.map(item => (
                        userInfo.favorites.some(fav => fav.itemId === item.id) ? (
                            <div className="fav-card" key={item.id}>
                                <div className="item-image">
                                    <button
                                        className={`${userInfo.favorites.some(fav => fav.itemId === item.id) ? 'fav-added' : ''} item-like`}
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
                                        className={`${userInfo.cart.some(cart => cart.itemId === item.id) ? 'card-added' : ''} card-add`}
                                        onClick={(e) => handleCart(e, item.id, item.price)}
                                    >

                                    </button>
                                </div>
                            </div>
                        ) : (null)

                    ))) : items && userInfo && userInfo.favorites.length <= 0 ? (
                        <div className="empty-favs">
                            <div className="empty-favs-inner">
                                <div className="empty-header">
                                    <img src={sad} alt=""/>
                                    <h3>Here is no favorites ;(</h3>
                                    <p>You added nothing yet here</p>
                                </div>
                                <button
                                    className="back-empty"
                                    onClick={() => navigate('/')}
                                >
                                    Go back
                                </button>
                            </div>
                        </div>
                        ) : (null)}
                </div>
            </div>
        </div>
    );
};

export default Favorites;