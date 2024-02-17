import React, { useState, useEffect } from 'react';
import './Register.css';
import { post } from "../../utilities";

/**
 * @param {string} username
 * @param {string} mail
 * @param {string} phone
 * @param {string} identificationCard
 * @param {string} password
 * @param {string} registerCode
 * @param {boolean} step
 * @param {string} email
 * @param {string} loginpassword
 * @param {string} warning
 * @param {string} step_
 * @param {string} userId
 */
const Register = ({ upload }) => {
    useEffect(() => {
        document.title = "Register";
    }, []);

    const [registerWarning, setRegisterWarning] = useState(false);
    const [loginWarning, setLoginWarning] = useState(false);
    const [codeCDWarning, setCodeCDWarning] = useState(false);
    const [codeInvalidWarning, setCodeInvalidWarning] = useState(false);
    const [username, setUsername] = useState('');
    const [mail, setMail] = useState('');
    const [phone, setPhone] = useState('');
    const [identificationCard, setIdentificationCard] = useState('');
    const [password, setPassword] = useState('');
    const [registerCode, setRegisterCode] = useState('');
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const [loginpassword, setLoginpassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);

    const handleUsernameChange = (e) => {
        setRegisterWarning(false);
        setUsername(e.target.value);
    };

    const handleMailChange = (e) => {
        setRegisterWarning(false);
        setMail(e.target.value);
    };

    const handlePhoneChange = (e) => {
        setRegisterWarning(false);
        setPhone(e.target.value);
    };

    const handleIndentificationCardChange = (e) => {
        setRegisterWarning(false);
        setIdentificationCard(e.target.value);
    };

    const handlePasswordChange = (e) => {
        setRegisterWarning(false);
        setPassword(e.target.value);
    };

    const handleRegisterCodeChange = (e) => {
        setRegisterCode(e.target.value);
    };

    const handleLoginEmailChange = (e) => {
        setLoginWarning(false);
        setEmail(e.target.value);
    };

    const handleLoginPasswordChange = (e) => {
        setLoginWarning(false);
        setLoginpassword(e.target.value);
    };

    const handleLoginVerificationCodeChange = (e) => {
        setLoginWarning(false);
        setCodeCDWarning(false);
        setCodeInvalidWarning(false);
        setVerificationCode(e.target.value);
    };

    const handleRegister = (e) => {
        e.preventDefault();
        const newUser = {
            name: username,
            u_id: mail,
            phone_number: phone,
            id_number: identificationCard,
            password: password,
        };
        post("/api/register", newUser).then(() => {
            setStep(0);
            alert("注册成功！请登录。");
        }).catch((error) => {
            setRegisterWarning(true);
            alert(error);
        });
    };

    const handleLogin = (event) => {
        event.preventDefault();
        if (step === 0) {
            post("/api/login", { u_id: email, password: loginpassword }).then((response) => {
                if (response.message === "验证码已发送！") {
                    setCodeSent(true);
                    setStep(1);
                } else {
                    setLoginWarning(true);
                }
            }).catch((error) => {
                console.error(error);
                setLoginWarning(true);
            });
        } else if (step === 1) {
            post("/api/login/verifyCode", { u_id: email, code: verificationCode }).then((useremailObj) => {
                if (useremailObj) {
                    upload(useremailObj);
                    setStep(2);
                }
            }).catch((error) => {
                console.error(error);
                setCodeInvalidWarning(true);
            });
        }
    };

    const handleSendCode = (e) => {
        e.preventDefault();
        setCodeCDWarning(false);
        post("/api/login/requestCode", { u_id: email }).then((response) => {
            if (response.message === "验证码已重新发送！") {
                setCodeSent(true);
            }
            if (response.message === "距离上次发送验证码还不足一分钟，请稍后再试。") {
                setCodeCDWarning(true);
                setCodeSent(false);
            }
        }).catch((error) => {
            console.error(error);
            setCodeSent(false);
            setCodeCDWarning(false);
            setLoginWarning(true);
        });
    };

    const renderStep0 = () => {
        return (
            <div>
                <div className="Register">
                    <form onSubmit={handleRegister}>
                        <input type="text" placeholder="姓名" value={username} onChange={handleUsernameChange} required />
                        <input type="email" placeholder="邮箱" value={mail} onChange={handleMailChange} required />
                        <input type="tel" placeholder="电话" value={phone} onChange={handlePhoneChange} required />
                        <input type="text" placeholder="身份证" value={identificationCard} onChange={handleIndentificationCardChange} required />
                        <input type="password" placeholder="设置密码" value={password} onChange={handlePasswordChange} required />
                        <button type="submit">注册</button>
                        {registerWarning ? <p className='warning-message'>注册失败，可能是因为邮箱等信息已经被用于注册。请重试。</p> : null}
                    </form>
                </div>
                <div className="Register">
                    <form onSubmit={handleLogin}>
                        <input type="email" placeholder="邮箱" value={email} onChange={handleLoginEmailChange} required />
                        <input type="password" placeholder="密码" value={loginpassword} onChange={handleLoginPasswordChange} required />
                        <button type="submit">登录</button>
                        {loginWarning ? <p className='warning-message'>登录失败，请重试。</p> : null}
                    </form>
                </div>
            </div>
        );
    };

    const renderStep1 = () => {
        return (
            <div className="Register">
                <form onSubmit={handleLogin}>
                    {codeCDWarning ? <p className='warning-message'>发送验证码过于频繁，请稍后再试。</p> : <p>二步认证验证码已发送，请验证。验证码5分钟内有效。</p>}
                    <input type="text" placeholder="验证码" value={verificationCode} onChange={handleLoginVerificationCodeChange} required />
                    <button type="submit">提交</button>
                    <button onClick={handleSendCode}>重新获取验证码</button>
                    {loginWarning ? <p className='warning-message'>登录失败，请重试。</p> : null}
                    {codeInvalidWarning ? <p className='warning-message'>验证码无效。</p> : null}
                </form>
            </div>
        );
    };

    const renderStep2 = () => {
        return (
            <div>您已登录！</div>
        );
    };

    return (
        <div>
            {step === 0 ? renderStep0() : null}
            {step === 1 ? renderStep1() : null}
            {step === 2 ? renderStep2() : null}
        </div>
    );
};

export default Register;
