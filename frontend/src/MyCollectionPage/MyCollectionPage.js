/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Space ,Typography,Divider, Col,Row,Image,Pagination,Card,Tag, Skeleton,Button,Input, Upload,Popover, InputNumber,notification} from "antd";
import { PlusOutlined, MinusOutlined, DeleteOutlined, UploadOutlined} from "@ant-design/icons";
import axios from "axios";
import "./MyCollectionPage.css";
import { useParams} from "react-router-dom";


export default function MyCollectionPage({logInState, navigate})
{
    // collection id
    const params = useParams();
    //access control
    useEffect(()=>{
        if(!logInState)
        {
            navigate('/resourcesnotfound');
        }
    });

    return(
        <div>
        <CollectionInfo params={params} navigate={navigate}/>
        <Divider style={{borderWidth: "2px"}}/>
        <PaginationComponents params={params}/>
        </div>
    );
}


function CollectionInfo({params,navigate})
{
    const [collectionData, setCollectionData] = useState(null);
    const [note, setNote] = useState("");
    const [playTime, setPlayTime] = useState(0);

    //reqest collection data
    useEffect(()=>{
        const fetchData = async () =>{
            //setIsCollectionInfoLoading(true);
            const response = await requestCollectionData(params.id);
            //setIsCollectionInfoLoading(false);
            setCollectionData(response.data)
            setNote(response.data.data.note);
            setPlayTime(response.data.data.play_time);

        };
        fetchData();
    },[1]);

    const plusCliked = ()=>{
        
        updateCollection(params.id,note,playTime+1);
        setPlayTime(playTime+1);
    };

    const minusClicked = ()=>{
        updateCollection(params.id,note,playTime-1);
        setPlayTime(playTime-1);
    }
    
    const directToGamePage = ()=>{
        navigate("/gameinfo/"+collectionData.data.game_id);
    }

    const onNoteChange = (value) =>{
        setNote(value);
        updateCollection(params.id,value,playTime);
    }

    if(collectionData==null)
    {
        return(
            <Skeleton active={true} avatar paragraph={{rows:12}}></Skeleton>
        );
    }
    else 
    {
        return(
            <div >
            <Typography.Title style={{paddingLeft:"5%"}} onClick={directToGamePage} level={1} underline={true}>{collectionData.data.game_name}</Typography.Title>
            <Divider style={{borderWidth: "2px"}}/>
            <div style={{paddingLeft:"5%"}}>
                    <Space direction="vertical" size={20}>
                    <Typography.Title  mark level={2}>Game Note</Typography.Title>
                    <Typography.Text  editable={{onChange:onNoteChange}} style={{fontSize:"20px", fontFamily:"cursive"}}>{note}</Typography.Text>
                    <Typography.Title  mark level={2}>Play Times</Typography.Title>
                    <Space.Compact>
                    <Button type="primary" icon={<PlusOutlined />} onClick={plusCliked} />
                    <Input style={{width:"40px"}} disabled={true} value={playTime} />
                    <Button type="primary" icon={<MinusOutlined />} onClick={minusClicked}/>
                    </Space.Compact>
                    </Space>
            </div>
            </div>
        )
    }
}

function PaginationComponents({params})
{
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [numComponents,setNumComponents] = useState(0);
    const [currentPage,setCurrentPage] = useState(1);
    const [pageSize,setPageSize] = useState(3);
    const [visiable, setVisiable] = useState(false);

    const pageChangeHandler = (pageNumber)=>{
        setCurrentPage(pageNumber);
    };

    const pageSizeChangeHandler=(page,size)=>{
        setPageSize(size);
    };

    // fetch current page component data
    useEffect(()=>{
        const fetchData = async ()=>{
            setIsLoading(true);
            const response = await getComponentList(params.id,currentPage,pageSize);
            console.log(response);
            setIsLoading(false);
            setData(response);
            setNumComponents(pageSize*response.max_page);
        }
        fetchData();
    },[currentPage,pageSize]);


    return(
        <div style={{width:"100%"}}>
        <Space  style={{width:"100%"}} direction="vertical" size={30}>
        <ComponentGallery data={data} isLoading={isLoading}/>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "50%",
        }}>
        <Popover content={<PopoverAddComponentForm setVisiable={setVisiable} collectionID={params.id}/>} visible={visiable} >
        <Button  style={{marginLeft:"100%"}} type="primary" onClick={()=>{setVisiable(true)}} icon={<UploadOutlined/>}> Add Component</Button>
        </Popover>
        </div>
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
        }}>
        <Pagination current={currentPage} pageSize={pageSize} onShowSizeChange={pageSizeChangeHandler} onChange={pageChangeHandler} pageSizeOptions={[3,6,9,12]}  showSizeChanger={true} total={numComponents}  />
        </div>
        </Space>
        </div>
    )
}

function PopoverAddComponentForm({setVisiable,collectionID})
{
    const onAddClick = ()=>{
        const componentName = document.getElementById("addcomponentname").value;
        const componentType = document.getElementById("addcomponenttype").value;
        const componentCount = document.getElementById("addcomponentnumber").value;
        const componentDescription = document.getElementById("addcomponentdescription").value;
        if(componentName==""||componentType==""||componentDescription=="")
        {
            const config = {
                placement:"top",
                duration:3,
                message:"Please Fill In All the Field"
            };
            notification.info(config);
            return;
        }
        addComponent(collectionID,componentType,componentCount,componentName,componentDescription);
        location.reload([true]);
    }

    const onCloseClick = () =>{
        setVisiable(false);
    }

    return(
    <div>
       <Space direction="vertical" size={5}>
    <Input placeholder="Component Name" id="addcomponentname"/>
    <Input placeholder="Component Type" id="addcomponenttype"/>
    <Space.Compact direction="horizontal" align="center">
    
    <InputNumber addonBefore={<Typography.Text>Count: </Typography.Text>} defaultValue={1} id="addcomponentnumber"/>
    </Space.Compact>
    <Input.TextArea rows={4} placeholder="Componet description" id="addcomponentdescription"/>
    <div>
        <Space direction="horizontal" size={110}>
            <Button onClick={onAddClick}>Add</Button>
            <Button onClick={onCloseClick}>Close</Button>
        </Space>
    </div>
    </Space>
    </div>
    );

}


function ComponentGallery({data, isLoading})
{
       //console.log(data);
       if(isLoading)
       {
           ///return skeleton 
           return(
               <Skeleton className="skeletonStyle" active avatar paragraph={{rows:4}}></Skeleton>
           )
       }
       else 
       {
        const componentCount = data.data.length;
        const componentList = data.data;
        // the list of rows
        const numOfRows = parseInt(componentCount/3);
        const remainder = componentCount%3;
        const rowList = [];
        // 0     1     2     3 
        // 0 1 2 3  4 5 6 7 8 9 10 11
        for(var i=0; i<numOfRows; i++)
        {
            const startIndex = i*3;
            rowList.push(<Row  wrap={false} key={"row"+i} justify="space-evenly">
                 <Col span={8}><ComponentCard componentData={componentList[startIndex]} /></Col> 
                 <Col span={8}><ComponentCard componentData={componentList[startIndex+1]}/></Col>
                 <Col spab={8}><ComponentCard componentData={componentList[startIndex+2]}/></Col>
                 </Row>);
        }

        switch(remainder)
        {
            case 0:
                break;
            case 1:
                rowList.push(<Row  wrap={false} key={"lastrow"} justify="space-evenly" >
                <Col span={8}><ComponentCard componentData={componentList[componentCount-1]}/></Col> 
                </Row>);
                break;
            case 2:
                rowList.push(<Row  wrap={false} key={"lastrow"} justify="space-evenly">
                <Col span={8}><ComponentCard componentData={componentList[componentCount-2]} /></Col> 
                <Col span={8}><ComponentCard componentData={componentList[componentCount-1]}/></Col>
                </Row>);
                break;
        }
        return(
            <div className="containerStyle">
                {rowList}
            </div>
        );
       }

}


function ComponentCard({componentData})
{
    const [componentName, setComponentName] = useState(componentData.name);
    const [componentDescription, setComponentDescription] = useState(componentData.description);
    const [componentType, setComponentType] = useState(componentData.type);
    const [componetCount, setComponentCount] = useState(componentData.number);
    const [componentImage, setComponentImage] = useState(componentData.image);
    const handleComponenttNameChange =  async (value) =>{
        setComponentName(value);
        updateComponet(componentData.id,componentType,componetCount,value,componentDescription,componentImage);
    }

    const onComponentDescriptionChange = (value) =>{
        setComponentDescription(value);
        updateComponet(componentData.id,componentType,componetCount,componentName,value,componentImage);
    }

    const onComponentTypeChange = (value) =>{
        setComponentType(value);
        updateComponet(componentData.id,value,componetCount,componentName,componentDescription,componentImage);
    }

    const onComponentCountChange = (value) =>{
        setComponentCount(value);
        updateComponet(componentData.id,componentType,value,componentName,componentDescription,componentImage);
    }
   
    const handleComponentDeletion =  async () =>{
        await deleteComponent(componentData.id);
        location.reload([true]);
    }


    const actions = [<DeleteOutlined onClick={handleComponentDeletion}/>];
     
    
    const typeTag = <div>
                    <Typography.Text>Count: </Typography.Text>
                    <Tag><Typography.Text editable={{onChange:onComponentCountChange}}>{componetCount}</Typography.Text></Tag>
                    <br/>
                    <Typography.Text>Type: </Typography.Text>
                    <Tag><Typography.Text editable={{onChange:onComponentTypeChange}}>{componentType}</Typography.Text></Tag>
                    </div>

    const cardTitle = <Typography.Title level={5} editable={{onChange:handleComponenttNameChange}}>{componentName}</Typography.Title>
    const metaDescription= <Typography.Text editable={{onChange:onComponentDescriptionChange}}>{componentDescription}</Typography.Text>


    return(
         <Card  style={{width:"300px"}} cover={<EditableImage image={componentImage} setImage={setComponentImage} componentID={componentData.id}/>} actions={actions} title={cardTitle}>
            <Card.Meta title={typeTag} description={metaDescription}/>
        </Card>
    )
}


function EditableImage({image,setImage,componentID})
{
    // check the file type
    const beforeUpload = (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
          message.error('You can only upload JPG/PNG file!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
      };

      const updataImage = async ({file, onSuccess, onError})=>{
        const base64 = await getBase64(file);
        setImage(base64);
        const config = {
            method:"patch",
            url:"https://game.norgannon.cn:8848/api/collection/component/",
            headers:{
                Authorization:localStorage.getItem("token")
            },
            params:{
                component_id:componentID
            },
            data:{
                image:base64
            }
        };
        axios(config).then((response)=>{
            console.log(response);
            onSuccess();
        }).catch((err)=>{
            alert("an unexpected error occured when updating component image");
            console.log(err);
            onError();
        })
        

      }

      return (
        <div className="edtiableImage">
        <Upload beforeUpload={beforeUpload} showUploadList={false} customRequest={updataImage}>
      <Image src={image} width={200} height={200} preview={false}></Image>
      </Upload>
      </div>
      );
}

async function addComponent(collectionID, type,number,name,description)
{
    const config = {
        method:"post",
        url:"https://game.norgannon.cn:8848/api/collection/component/",
        headers:{
            Authorization:localStorage.getItem("token")
        },
        data:{
            collection_id:collectionID,
            type:type,
            number:number,
            name:name,
            description:description,
        }

    };

    try{
        const response = await axios(config);
        console.log(response);
    }
    catch(err)
    {
        alert("un expected error happesn when add new component");
        console.log(err);
    }

}





async function updateComponet(componentID, type,number,name,description,image)
{
    const config = {
        method:"patch",
        url:"https://game.norgannon.cn:8848/api/collection/component/",
        headers:{
            Authorization:localStorage.getItem("token")
        },
        params:{
            component_id:componentID
        },
        data:{
            type:type,
            number:number,
            name:name,
            description:description,
            image:image
        }
    }

    console.log(config);

    try{
        const response = await axios(config);
    }
    catch(err)
    {
        alert("an unexpected error happens when update component");
        console.log(err);
    }

}

const deleteComponent= async (componentID) =>
{
    
    
    const config = {
        method:"delete",
        url:"https://game.norgannon.cn:8848/api/collection/component/",
        headers:{
            Authorization:localStorage.getItem("token")
        },
        params:{
            component_id:componentID
        }
    }

    try{
            const response =  await axios(config);
            console.log(response);
    }
    catch(err)
    {
        alert("an unexpted error happen when trying to delete a component");
        console.log(err);
    }
    

}


async function getComponentList(collectionID, currentPage,pagesize)
{
    const config = {
        method:"get",
        url:"https://game.norgannon.cn:8848/api/collection/component/list",
        headers:{
            Authorization:localStorage.getItem("token")
        },
        params:{
            collection_id:collectionID,
            page:currentPage,
            page_size:pagesize
        }
    }

    try{
        const response = await axios(config);
        return response.data;
    }
    catch(err)
    {
        alert("unpexted error when try to request componets list");
        console.log(err);
    }
}


async function updateCollection(id,note,playtime)
{
    const config={
        method:"patch",
        url:"https://game.norgannon.cn:8848/api/collection/",
        headers:{
            Authorization:localStorage.getItem("token")
        },
        params:{
            collection_id:id
        },
        data:{
            note:note,
            play_time:playtime
        }
    };

    try{
        await axios(config);
    }
    catch(err)
    {
        alert("unpexted error when try to request collection detailed data");
        console.log(err);
    }
}

//function that request collection data by id
async function requestCollectionData(collectionId)
{
    
    const config={
        method:"get",
        url:"https://game.norgannon.cn:8848/api/collection/",
        headers:{
            Authorization:localStorage.getItem("token")
        },
        params:{
            collection_id:collectionId,
        },
        
        
    };
    try{
        const response = await axios(config);
        return response;
    }
    catch(err)
    {
        alert("unpexted error when try to request collection detailed data");
        console.log(err);
    }

    

}

function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }


/* eslint-disable */