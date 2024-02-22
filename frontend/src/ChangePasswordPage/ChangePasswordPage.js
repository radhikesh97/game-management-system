/* eslint-disable */
import "./ChangePasswordPage.css";
import { LoadingOutlined} from '@ant-design/icons';
import { Space,Input,Button,message, Typography,notification} from 'antd';
import { useState ,useEffect} from 'react';
import axios from  'axios';



// this page allow users to access only when they have logged in
export default function ChangePasswordPage({logInState, setLogInState,setUserName,navigate}){

        // if user not logged in
        useEffect(()=>{

            const notificationConfig={
                message:"You Have Not Signed In",
                description: "You have not signed in, to change password, please sign in first",
                placement:"top",
                duration:2.5,
                onClose:()=>{
                    navigate(-1);
                }
    
            }
            if(!logInState)
            {
                notification.info(notificationConfig);
            }
        });

    return(
        <ChangePasswordFrom setLogInState={setLogInState} setUserName={setUserName} navigate={navigate}/>
    );

}

function ChangePasswordFrom({setLogInState,setUserName,navigate}){

    const [isLoading,setIsLoading] = useState(false);
    const [isPasswordConfirmed, setIsPasswordConfirmed] = useState(true);

    const buttonOnClick = ()=>{
        const oldPassword = document.getElementById("changepasswordoldpassword").value;
        const newPassword = document.getElementById("changepasswordnewpassword").value;
        const token = localStorage.getItem("token");
        
        if(oldPassword==""||newPassword=="")
        {
            message.warning("Please fill all required field");
            return;
        }

        if(hasWhiteSpace(oldPassword)||hasWhiteSpace(newPassword))
        {
            message.warning("All fields shoud not contain whitespace");
            return;
        }

        /*
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
        if(!regex.test(newPassword))
        {
            message.warning("Weak Password, your password should have at least one Uppercase letter, one Lowercase letter, one number and length of at least 8");
            return;
        }
        */

        const data = {
            old_password:oldPassword,
            new_password:newPassword,
        };

        const config = {
            headers:{
                Authorization:token,
            }
        }

        setIsLoading(true)
        axios.patch("https://game.norgannon.cn:8848/api/user/password/change",data,config).then(function(response){
            // reset successful
            console.log("response",response);
            //log out
            localStorage.removeItem('username');
            localStorage.removeItem('user_id');
            localStorage.removeItem('token');
            setLogInState(false);
            setUserName("");

            const notifiactionConfig={
                placement:"top",
                message:"Reset Successful",
            };
            notification.success(notifiactionConfig);
            navigate("/signin");


        }).catch(function(error){
            console.log("error",error);
            // unauthorized
            if(error.response.status==401)
            {
                const notifiactionConfig={
                    placement:"top",
                    message:"Please Sign In to Your Account First",
                };
                notification.warning(notifiactionConfig);
            }
            //incorrect password
            else if(error.response.status==400)
            {
                const notifiactionConfig={
                    placement:"top",
                    message:"Incorrect Password",
                };
                notification.warning(notifiactionConfig);
            }
        }).then(function(){
            setIsLoading(false)
        });





    };

    const onPasswordChange = ()=>{
        const newPassword = document.getElementById("changepasswordnewpassword").value;
        const confirmedNewPassword = document.getElementById("changepasswordconfirmnewpassword").value;
        const warning = document.getElementById("changepasswordnotmatch");

        if(newPassword==confirmedNewPassword)
        {
            setIsPasswordConfirmed(true);
            warning.style.display="none";
        }
        else{
            setIsPasswordConfirmed(false);
            warning.style.display="block";
        }
        

    }

    


    return(

        <Space direction="vertical" className="formStyle" size={40} align="center">
        <h1 className="textStyle">Change Password</h1>
        <Input.Password  id='changepasswordoldpassword' className="inputStyle" placeholder='Enter Old Password' size='large'/>
        <Input.Password  id="changepasswordnewpassword" className="inputStyle" onChange={onPasswordChange} placeholder='Enter New Password' size='large'/>
        <Input.Password  id="changepasswordconfirmnewpassword" className="inputStyle" onChange={onPasswordChange} placeholder='Confirm New Password' size='large'/>
        <Typography.Text id="changepasswordnotmatch" type='warning' strong={true}  style={{display:'none'}} >The confirmed password does not match the new password </Typography.Text>
        <Button size="large" type='primary' disabled={isPasswordConfirmed?(false):(true)} onClick={buttonOnClick} icon={isLoading?(<LoadingOutlined spin={true} />):(<></>)}> {isLoading?(" Loading..."):("Reset")} </Button>
      </Space>

    );

}

function hasWhiteSpace(s) {
    return /\s/g.test(s);
  }
  /* eslint-disable */