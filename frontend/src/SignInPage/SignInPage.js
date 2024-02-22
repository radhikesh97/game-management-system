/* eslint-disable */
import { LoadingOutlined} from '@ant-design/icons';
import { Space,Input,Button,message,notification} from 'antd';
import { useState,useEffect} from 'react';
import axios from  'axios';
import './SignInPage.css';








// SignInPage allow user to access only when they are not logged in
function SignInPage({logInState,setLogInState, setUserName,navigate})
{
    // if user already logged in
    useEffect(()=>{

        const notificationConfig={
            message:"You Have Already Signed In",
            description: "You have alread signed in, to switch to another account, please sign out first",
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
     <Space className='singinPage' direction="vertical" key="signinpage">
        <SignInForm setUserName={setUserName} setLogInState={setLogInState} navigate={navigate} />
        <SignInFooter navigate={navigate} />
     </Space>
    );
   
}

//
function SignInFooter({navigate}){

  

  const forgetNameOrPassword = ()=>{
    
    navigate('/forgetpassword');
  };

  const signUp = () =>{
    navigate('/signup');
  };
  

  return(
    <Space direction='vertical' align="left">
      <Space direction='horizontal'  size={150}>
        <h3 className="textStyle">Forgot UserName or Password?</h3>
         <Button className="buttonStyle" type="text" size='large' onClick={forgetNameOrPassword}>Click Here</Button>
      </Space>
      <Space direction='horizontal' size={300}>
        <h3 className="textStyle">New User?</h3>
         <Button className="buttonStyle" type="text" size='large' onClick={signUp}>Sign Up</Button>
      </Space>
    </Space>
  );

}

// the form of sign in page, consists of two input fields and a button
function SignInForm({setUserName,setLogInState,navigate})
{
   const[isLoading, setIsLoading] = useState(false);


   const buttonOnClick = ()=>{
    const userName = document.getElementById("username").value;
    const userPassword = document.getElementById("userpassword").value;
    // send http request
    setIsLoading(true);
    axios.post("https://game.norgannon.cn:8848/api/user/login",
    {
      username:userName,
      password:userPassword
    }

    ).then((response) => {
      // log in sucessful
      console.log("get response",response);
      const {id, token} = response.data;
      setUserName(userName);
      setLogInState(true);
      localStorage.setItem("username",userName);
      localStorage.setItem("user_id", id);
      localStorage.setItem("token",token);
      navigate("/");


    }).catch(function (error){
      // log in failed
      if(error.response.status==400)
      {
        message.error("Incorrect User Name or Password, Please Try Again",[1]);
      }
      
    }).then(function(){
      setIsLoading(false);
    })

   }


   
    return(
      <Space direction="vertical" key="signinform" className ="signInInputForm" size={40} align="center">
        <h1 className="textStyle">Sign In</h1>
        <Input className="userNameInput" key="username" id="username" size='large' maxLength={40}  placeholder='Enter User Name'/>
        <Input.Password className ="userPasswordInput" id='userpassword' placeholder='Enter User Password' key='userpassword' size='large'/>
        <Button size="large" type='primary' onClick={buttonOnClick} icon={isLoading?(<LoadingOutlined spin={true} />):(<></>)}> {isLoading?(" Loading..."):("Sign In")} </Button>
      </Space>
    );
}

export default SignInPage;
/* eslint-disable */