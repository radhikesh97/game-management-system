/* eslint-disable */
import "./ForgotPasswordPage.css"
import { LoadingOutlined, MailOutlined} from '@ant-design/icons';
import { Space,Input,Button,message,notification} from 'antd';
import { useState,useEffect } from 'react';
import axios from  'axios';



//this page allow user to access no matter logged or not logged in
//but if user has logged in, after retrive temporary password, the current account will be signed out
export default function ForgotPasswordPage({logInState,navigate,setUserName, setLogInState})
{

    return(
        <Space className="forgotPasswordPage" direction="vertical">
            <ForgotPasswordForm navigate={navigate} logInState={logInState} setUserName={setUserName} setLogInState={setLogInState}/>
        </Space>
    );
}


function ForgotPasswordForm({navigate,logInState,setUserName, setLogInState})
{
    const[isLoading, setIsLoading] = useState(false);

    const buttonOnClick=()=>{
        const userName = document.getElementById("forgotpasswordusername").value;
        const emailPrefix = document.getElementById("forgotpasswordemailprefix").value;
        const emailSuffix = document.getElementById("forgotpasswordemailsuffix").value;
        const email = emailPrefix+"@"+emailSuffix;

        if(userName==""||email=="")
        {
            message.warning("Please fill All the Required Field");
            return;
        }

        setIsLoading(true);
        axios.post('https://game.norgannon.cn:8848/api/user/password/forget',
        {
            username:userName,
            email:email
        }
        ).then(function(response){
            console.log("response",response);
            if(logInState)
            {
                //log out
                setLogInState(false);
                setUserName("");
                localStorage.removeItem("username");
                localStorage.removeItem('user_id');
                localStorage.removeItem("token");
            }
            const newPassword = response.data.date.password;
            const config={
                placement:"top",
                message:"Temporary passwaord is generated",
                description:"Your temporary password is "+newPassword+", please change the password as soon as possible",
                duration:null,
                onClose: ()=>{
                    navigate('/signin');
                },
            };
            notification.success(config);
            

        }).catch(function(error){
            if(error.response.data.message=="User info does not match")
            {
                message.warning("The user name or email are incorrect");
                setIsLoading(false);
                return;
            }

        }).then(function(){
            setIsLoading(false);

        })
          
        


    };


    return(
        <Space direction="vertical" size={40} align="center">
        <h1 className="textStyle">Enter Your User Name and Email to Retrieve Password</h1>
        <Input id="forgotpasswordusername" className="inputSize" size='large' maxLength={40}  placeholder='Enter User Name'/>
        <Space.Compact direction='horizontal' size={0}>
        <Input  className='emailInputSize' prefix={<MailOutlined/>}  id="forgotpasswordemailprefix" size="large" placeholder='Enter Email'/>
        <Input  className='emailInputSize' addonBefore="@" size='large' id='forgotpasswordemailsuffix'/>   
       </Space.Compact>

        
        <Button size="large" type='primary' onClick={buttonOnClick} icon={isLoading?(<LoadingOutlined spin={true} />):(<></>)}> {isLoading?(" Loading..."):("Retrieve")} </Button>
      </Space>
    );


}
/* eslint-disable */