import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Register.css';
import { post } from "../../utilities";
import PasswordChecklist from "react-password-checklist";

/**
 * @param {string} registrationCode
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
    const [confirmPassword, setConfirmPassword] = useState('');
    const [registrationCode, setRegistrationCode] = useState('');
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const [loginpassword, setLoginpassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);

    const handleRegistrationCodeChange = (e) => {
        setRegisterWarning(false);
        setRegistrationCode(e.target.value);
    };

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

    const handleConfirmPasswordChange = (e) => {
        setRegisterWarning(false);
        setConfirmPassword(e.target.value);
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
        setRegisterWarning(false);
        const usernamePattern = /^[\u4e00-\u9fa5A-Za-z]+$/;
        const phoneNumberPattern = /^\d{11}$/;
        const idPattern = /^\d{17}[\dXx]$/
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=])[A-Za-z\d@#$%^&+=]{8,20}$/;
        if (password !== confirmPassword) {
            alert("两次输入的密码不一致！");
            return;
        }
        if (!usernamePattern.test(username)) {
            alert("姓名格式错误。");
            return;
        }
        if (!phoneNumberPattern.test(phone)) {
            alert("电话号码格式错误。");
            return;
        }
        if (!idPattern.test(identificationCard)) {
            alert("身份证号码格式错误。");
            return;
        }
        if (!passwordPattern.test(password)) {
            alert("您设置的密码不符合要求。");
            return;
        }
        const newUser = {
            registration_code: registrationCode,
            name: username,
            u_id: mail,
            phone_number: phone,
            id_number: identificationCard,
            password: password,
        };
        axios.post("/api/register", newUser)
            .then((response) => {
                setStep(0);
                alert("注册成功！请登录。");
            })
            .catch((error) => {
                setRegisterWarning(true);
                if (error.response) {
                    alert(error.response.data.message); // 获取并显示 message
                } else {
                    alert(error);
                }
            });
    };

    const handleLogin = (event) => {
        event.preventDefault();
        setLoginWarning(false);
        if (step === 0) {
            axios.post("/api/login", { u_id: email, password: loginpassword }).then((response) => {
                if (response.data.message === "验证码已发送！") {
                    setCodeSent(true);
                    setStep(1);
                } else {
                    console.log(response.data.message);
                    setLoginWarning(true);
                }
            }).catch((error) => {
                setLoginWarning(true);
                if (error.response) {
                    alert(error.response.data.message); // 获取并显示 message
                } else {
                    alert(error);
                }
            });
        } else if (step === 1) {
            post("/api/login/verifyCode", { u_id: email, code: verificationCode }).then((useremailObj) => {
                if (useremailObj) {
                    upload(useremailObj);
                    // 将useremailObj保存到本地
                    // localStorage.setItem("user", JSON.stringify(useremailObj));
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
        axios.post("/api/login/requestCode", { u_id: email }).then((response) => {
            if (response.data.message === "验证码已重新发送！") {
                setCodeSent(true);
            }
            if (response.data.message === "距离上次发送验证码还不足1分钟，请稍后再试。") {
                setCodeCDWarning(true);
                // setCodeSent(false);
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
                    <form onSubmit={handleLogin}>
                        <input type="email" placeholder="邮箱" value={email} onChange={handleLoginEmailChange} required />
                        <input type="password" placeholder="密码" value={loginpassword} onChange={handleLoginPasswordChange} required />
                        <button type="submit">登录</button>
                        {loginWarning ? <p className='warning-message'>登录失败，请重试。</p> : null}
                    </form>
                </div>
                <div className="Register">
                    <form onSubmit={handleRegister}>
                        <input type="text" placeholder="注册码" value={registrationCode} onChange={handleRegistrationCodeChange} required />
                        <input type="text" placeholder="姓名" value={username} onChange={handleUsernameChange} required />
                        <input type="email" placeholder="邮箱" value={mail} onChange={handleMailChange} required />
                        <input type="tel" placeholder="电话号码" value={phone} onChange={handlePhoneChange} required />
                        <small>请填写您常用的手机号码，应为11位数字。</small>
                        <input type="text" placeholder="身份证" value={identificationCard} onChange={handleIndentificationCardChange} required />
                        <input
                            type="password"
                            placeholder="设置密码"
                            value={password}
                            onChange={handlePasswordChange}
                            maxLength="20"
                            required
                        />
                        <input
                            type="password"
                            placeholder="确认密码"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            maxLength="20"
                            required
                        />
                        <PasswordChecklist
                            rules={["match", "minLength", "maxLength", "capital", "lowercase", "number"]}
                            minLength={8}
                            maxLength={20}
                            value={password}
                            valueAgain={confirmPassword}
                            messages={{
                                minLength: "密码应包含至少8个字符。",
                                maxLength: "密码不应超过20个字符。",
                                number: "密码应包含至少一个数字。",
                                capital: "密码应包含至少一个大写字母。",
                                match: "两次输入的密码应当一致。",
                                lowercase: "密码应包含至少一个小写字母。",
                            }}
                        />
                        <button type="submit">注册</button>
                        {registerWarning ? <p className='warning-message'>注册失败，请重试。</p> : null}
                    </form>
                </div>
            </div>
        );
    };

    const renderStep1 = () => {
        return (
            <div className="Register">
                <form onSubmit={handleLogin}>
                    {codeSent ? <p>二步认证验证码已发送，请验证。<br />验证码5分钟内有效。</p> : null}
                    {codeCDWarning ? <p className='warning-message'>距离上次发送验证码还不足1分钟，请稍后再试。</p> : null}
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
