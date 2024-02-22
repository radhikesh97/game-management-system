/* eslint-disable */
import { useState,useEffect } from 'react';
import './SignUpPage.css';
import {Space, Input, Button, message, Typography,notification, Descriptions} from 'antd';
import {LoadingOutlined, UserOutlined, MailOutlined,} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


// this page allow users to acess only when they are not logged in
export default function SignUpPage({logInState,setLogInState,setUserName,navigate})
{
    // if user already logged in
    useEffect(()=>{

        const notificationConfig={
            message:"You Have Already Signed In",
            description: "You have alread signed in, to register a new account, please sign out first",
            placement:"top",
            duration:2.5,
            onClose:()=>{
                navigate(-1);
            }

        }
        if(logInState)
        {
            notification.info(notificationConfig);
        }
    });
      
    return(
        <Space className="singupPage" direction='vertical'>
        <SignUpForm setLogInState={setLogInState} setUserName={setUserName} navigate={navigate}/>
        <SignUpFooter  navigate={navigate}/>
        </Space>
    );

}


function SignUpForm({setLogInState,setUserName,navigate})
{
    const[isLoading, setIsLoading] = useState(false);
    const[isPasswordConfirmed, setIsPasswordConfirmed] = useState(true);

    const buttonOnClick = ()=>{
        const userName = document.getElementById("signupusername").value;
        const emailPrefix = document.getElementById("signupemailprefix").value;
        const emailSuffix = document.getElementById("signupemailsuffix").value;
        const password = document.getElementById("signuppassword").value;
        const confirmedPassword = document.getElementById("confirmpassword").value;
        const email = emailPrefix+"@"+emailSuffix;
        
        if(userName==""||password==""||email=="")
        {
            message.warning("Please fill All the Required Field");
            return;
        }

        if(hasWhiteSpace(userName)||hasWhiteSpace(email)||hasWhiteSpace(password))
        {
            message.warning("All fields shoud not contain whitespace");
            return;
        }
    
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
        if(!regex.test(password))
        {
            message.warning("Weak Password, your password should have at least one Uppercase letter, one Lowercase letter, one number and length of at least 8");
            return;
        }
        setIsLoading(true);
        axios.post('https://game.norgannon.cn:8848/api/user/register',
        {
            username:userName,
            password:password,
            email:email,
        }
        ).then(function(response){
            console.log("response",response);
            message.success("Registration successful");
            setUserName(userName);
            setLogInState(true);
            localStorage.setItem("username",userName);
            localStorage.setItem("token",response.data.token);
            navigate('/');
        }).catch(function(error){
            console.log("error",error);
            const errorMessage = error.response.data.message;
            if(errorMessage=="Email exists")
            {
                message.warning("The email is already exist, please try anohter one");
            }
            if(errorMessage=="Username exists")
            {
                message.warning("The user name is already exist, please try another one");
            }
        }).then(function(){
            setIsLoading(false);
        });


        
        

    };

    const onPasswordChange = () =>{
        const password = document.getElementById("signuppassword").value;
        const confirmedPassword = document.getElementById("confirmpassword").value;
        const notMatchWarning = document.getElementById("signupnotmatchwanring");
        if(password==confirmedPassword)
        {
            setIsPasswordConfirmed(true);
            notMatchWarning.style.display='none';
        }
        else 
        {
            setIsPasswordConfirmed(false);
            notMatchWarning.style.display='block';
        }
    };

    return(
    <Space direction="vertical"  size={40} align="center">
    <h1 className="textStyle">Sign Up</h1>
    <Input className='inputSize' prefix={<UserOutlined/>} id="signupusername" size='large' maxLength={40}  placeholder='Enter User Name'/>
    <Space.Compact direction='horizontal' size={0}>
        <Input  className='emailInputSize' prefix={<MailOutlined/>}  id="signupemailprefix" size="large" placeholder='Enter Email'/>
        <Input  className='emailInputSize' addonBefore="@" size='large' id='signupemailsuffix'/>   
    </Space.Compact>
    <Input.Password className='inputSize' onChange={onPasswordChange} id='signuppassword' placeholder='Enter Password' size='large'/>
    <Input.Password className='inputSize' onChange={onPasswordChange} id="confirmpassword" placeholder='Confirm Your Password' size='large'/>
    <Typography.Text type='warning' strong={true} id="signupnotmatchwanring" style={{display:'none'}} >The confirmed password does not match the original password </Typography.Text>
    <Button disabled={isPasswordConfirmed?(false):(true)} size="large" type='primary' id='signupbutton' onClick={buttonOnClick} icon={isLoading?(<LoadingOutlined spin={true} />):(<></>)}> {isLoading?(" Loading..."):("Sign Up")} </Button>
  </Space>
    );
}

function SignUpFooter({navigate})
{

   const signin=()=>{
        navigate("/signin");
   };

    return(
        <Space direction='horizontal'  size={150}>
        <h3 className="textStyle">Already have an Account?</h3>
         <Button className="buttonStyle" type="text" size='large' onClick={signin} >Sign In</Button>
      </Space> 
    );
}

function hasWhiteSpace(s) {
    return /\s/g.test(s);
  }