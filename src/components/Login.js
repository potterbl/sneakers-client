import React, {useEffect, useState} from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential, createUserWithEmailAndPassword, signInWithEmailAndPassword  } from 'firebase/auth';
import { app, db } from '../firebase';
import {getFirestore, collection, addDoc, getDocs, query, where} from "firebase/firestore"
import '../style/Login.css'
import { AES, enc } from 'crypto-js';

const Login = (props) => {
    const encryptArray = (data, key) => {
        const encryptedData = AES.encrypt(JSON.stringify(data), key).toString();
        return encryptedData;
    };
    const decryptArray = (encryptedData, key) => {
        const decryptedData = AES.decrypt(encryptedData, key).toString(enc.Utf8);
        const parsedData = JSON.parse(decryptedData);
        return parsedData;
    };

    const auth = getAuth(app);
    const [isRegister, setIsRegister] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rePassword, setRePassword] = useState('')
    const [isExist, setIsExist] = useState(false)
    const [isPass, setIsPass] = useState(false)
    const [isWeak, setIsWeak] = useState(false)
    const [isValid, setIsValid] = useState(false)
    async function fetchData(uid) {
        const querySnapshot = await getDocs(query(collection(db, "userinfo"), where("uid", "==", uid)));

        const userInfoData = querySnapshot.docs.map((doc) => doc.data());
        props.setUserInfo(userInfoData[0]);
    }

    (function () {
        if(localStorage.getItem('auth') && localStorage.getItem('accessToken')){
            const authMethod = localStorage.getItem('auth')
            const accessToken = localStorage.getItem('accessToken')
            if (accessToken && authMethod && authMethod === 'google') {
                const credential = GoogleAuthProvider.credential(null, accessToken);
                signInWithCredential(auth, credential)
                    .then(async (res) => {
                        const user = res.user;
                        props.setIsLoggedIn(true)
                        props.setUser(user);
                        await fetchData(res.user.uid)
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } else if (accessToken && authMethod && authMethod === 'email'){
                const token = decryptArray(accessToken, process.env.REACT_APP_SECRET_KEY)
                const [email, password] = token
                signInWithEmailAndPassword(auth, email, password)
                    .then( async (res) => {
                        const user = res.user;
                        props.setIsLoggedIn(true);
                        props.setUser(user);
                        await fetchData(res.user.uid)
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            }
        }
    })()

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();

        signInWithPopup(auth, provider)
            .then( async(result) => {
                const user = result.user
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                localStorage.setItem('accessToken', token)
                localStorage.setItem('auth', 'google')
                const db = getFirestore(app)
                if(result._tokenResponse.isNewUser === true){
                    await addDoc(collection(db, 'userinfo'), {
                        cart: [],
                        favorites: [],
                        uid: user.uid,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                    })
                }
                props.setIsLoggedIn(true)
                props.setUser(user)
                await fetchData(result.user.uid)
            })
            .catch((error) => {
                // Обработка ошибки входа в систему
            });
    };

    const loginEmail = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then( async (res) => {
                const user = res.user
                const token = encryptArray([email, password], process.env.REACT_APP_SECRET_KEY)
                localStorage.setItem('accessToken', token)
                localStorage.setItem('auth', 'email')
                props.setIsLoggedIn(true)
                props.setUser(user)
                await fetchData(res.user.uid)
            })
            .catch(err => {
                console.log(err)
                setIsValid(true)
            })
    }

    const registerEmail = async () => {
        if(!isPass){
            createUserWithEmailAndPassword(auth, email, password)
                .then(async(userCredential) => {
                    const user = userCredential.user
                    const token = encryptArray([email, password], process.env.REACT_APP_SECRET_KEY)
                    localStorage.setItem('accessToken', token)
                    localStorage.setItem('auth', 'email')
                    await addDoc(collection(db, 'userinfo'), {
                        cart: [],
                        favorites: [],
                        uid: user.uid,
                    })
                    props.setIsLoggedIn(true)
                    props.setUser(user)
                    await fetchData(userCredential.user.uid)
                })
                .catch((err) => {
                    if (err.code === 'auth/email-already-in-use') {
                        console.log('Аккаунт уже существует');
                        setIsExist(true)
                    } else {
                        console.log(err);
                    }
                });
        }
    }
    useEffect(() => {
        if(password !== rePassword && password.length > 0){
            setIsPass(true)
            if(password.length < 6){
                setIsWeak(true)
            } else {
                setIsWeak(false)
            }
        } else {
            setIsPass(false)
        }
    }, [rePassword, password])

    return (
        <div>
            <div className="login">
                <div className={'login'}>
                    <div className="login-inner">
                        <button
                            onClick={loginWithGoogle}
                            className={'google'}
                        >
                            Login with Google
                        </button>
                        {isRegister ? (
                            <div className="register-form">
                                {isExist ? (
                                    <h5 style={{color: 'red'}}>User already exist</h5>
                                ) : null}
                                <input
                                    type="email"
                                    placeholder={'Input your email...'}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {isWeak ? (
                                    <h5 style={{color: 'red'}}>Passwords can't <br/> be less than 6 characters</h5>
                                ) : null}
                                <input
                                    type="password"
                                    placeholder={'Input your password...'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {isPass ? (
                                    <h5 style={{color: 'red'}}>Passwords must match</h5>
                                ) : null}
                                <input
                                    type="password"
                                    placeholder={'Re-enter your password...'}
                                    value={rePassword}
                                    onChange={(e) => setRePassword(e.target.value)}
                                />
                                <button onClick={registerEmail}>
                                    Create an account
                                </button>
                                <h5>Already have an account?</h5>
                                <p onClick={() => setIsRegister(!isRegister)}>Log in</p>
                            </div>
                        ) : (
                            <div className="login-form">
                                {isValid ? (
                                    <h5 style={{color: 'red'}}>Wrong email or password</h5>
                                ) : null}
                                <input
                                    type="email"
                                    placeholder={'Input your email...'}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder={'Input your password...'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    className="login-button"
                                    onClick={loginEmail}
                                >
                                    Log in
                                </button>
                                <h5>Doesn't have an account?</h5>
                                <p onClick={() => setIsRegister(!isRegister)}>Register</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
