/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Space ,Typography,Divider, Col,Row,Select,Table,Pagination,Card,Tag, Skeleton,Button,Input, Image} from "antd";
import { DeleteOutlined , SettingOutlined} from "@ant-design/icons";
import axios from "axios";
import "./UserCollectionPage.css";





//Access Control:
//This pasges can be accessed only when user has logged in
export default function UserCollectionPage({logInState,navigate})
{

    //access control
    useEffect(()=>{
        if(!logInState)
        {
            navigate('/resourcesnotfound');
        }
    });


    // the data object of current page
    const [data,setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [numCollections,setNumCollections] = useState(0);
    const [currentPage,setCurrentPage] = useState(1);
    const [pageSize,setPageSize] = useState(3);
    const [type, setType] = useState("all");
    const [keyword, setKeyWord] = useState("--A-L-L--");
    

    //fetch data of current page, invoked when the currentPage and pageSize is changed
    useEffect(()=>{
        const fetchData = async () => {
            setIsLoading(true);
            const response = await requestPageContent(currentPage, pageSize, null, null,type ,keyword);
            console.log("response",response);
            setIsLoading(false);
            setData(response);
            setNumCollections(pageSize*response.max_page);
          };
          fetchData();
    },[currentPage,pageSize,type,keyword]);


    const pageChangeHandler = (pageNumber)=>{
        setCurrentPage(pageNumber);
    };

    const pageSizeChangeHandler=(page,size)=>{
        setPageSize(size);
    };

    const onInputChange =()=>{
        setKeyWord(document.getElementById("usercollectionsearchkeyword").value);
    };

    const typeOptions=[
        {
            value: "all", 
            label: "all",
        },
        {
            value: "Board/Card Game",
            label: "Board/Card Game",
        },
        {
            value: "RPG Game",
            label: "RPG Game"
        }
    ]

    const onTypeChange = (value)=>{
        setType(value);
    };

    




    return(
        <div className="containerStyle">
        <Space style={{width:"100%"}}  direction="vertical" size={40}>
            <Typography.Title style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}  >My Collection</Typography.Title>
            <Space  style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}direction="horizontal" size={10}>
                <Input placeholder="Search Key Words By Enter Press" id="usercollectionsearchkeyword" onPressEnter={onInputChange}/>
                <Typography.Text keyboard>Game Type</Typography.Text>
                <Select defaultValue="all" options={typeOptions} id="usercollectiongametype" style={{width:120}} onChange={onTypeChange}/>
            </Space>
            <CollectionCardGallery data={data} isLoading={isLoading} navigate={navigate}/>
            <Pagination style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }} current={currentPage} pageSize={pageSize} onShowSizeChange={pageSizeChangeHandler} onChange={pageChangeHandler} pageSizeOptions={[3,6,9,12]}  showSizeChanger={true} total={numCollections}  />
        </Space>
        </div>
    );
}


export function CollectionCardGallery({data,isLoading,navigate})
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
        const collectionCount = data.data.length;
        const collectionList = data.data;
        // the list of rows
        const numOfRows = parseInt(collectionCount/3);
        const remainder = collectionCount%3;
        const rowList = [];
        // 0     1     2     3 
        // 0 1 2 3  4 5 6 7 8 9 10 11
        for(var i=0; i<numOfRows; i++)
        {
            const startIndex = i*3;
            rowList.push(<Row   wrap={false} key={"row"+i} justify="space-evenly">
                 <Col span={8}><CollectionCard collectionData={collectionList[startIndex]} navigate={navigate}/></Col> 
                 <Col span={8}><CollectionCard collectionData={collectionList[startIndex+1]} navigate={navigate}/></Col>
                 <Col spab={8}><CollectionCard collectionData={collectionList[startIndex+2]} navigate={navigate}/></Col>
                 </Row>);
        }

        switch(remainder)
        {
            case 0:
                break;
            case 1:
                rowList.push(<Row justify="space-evenly" wrap={false} key={"lastrow"}>
                <Col span={8}><CollectionCard collectionData={collectionList[collectionCount-1]} navigate={navigate}/></Col> 
                </Row>);
                break;
            case 2:
                rowList.push(<Row  justify="space-evenly" wrap={false} key={"lastrow"}>
                <Col span={8}><CollectionCard collectionData={collectionList[collectionCount-2]} navigate={navigate}/></Col> 
                <Col span={8}><CollectionCard collectionData={collectionList[collectionCount-1]} navigate={navigate}/></Col>
                </Row>);
                break;
        }

        
        return(
            <div style={{
                width: "100%",
              }}>
                {rowList}
            </div>
        );
        

    }
}

/*
style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "50%",
      }} 
*/



// the game title, game image, game type, gameid(hidden)
// remove collection button, browse collecton button
export function CollectionCard({collectionData,navigate}){

    const onBrowsingClikced=()=>{
        const id = collectionData.id;
        navigate("/mycollection/"+id);

    }
    
    const onDeletingClikced= async ()=>{
        await deleteCollection(collectionData.id);
        location.reload([true]);
    }

    const actions = [<SettingOutlined onClick={onBrowsingClikced}/>,<DeleteOutlined onClick={onDeletingClikced}/>];
    const cover = <Image style={{marginLeft:"25%"}} width={200} height={200} preview={false} alt="game picture" src={collectionData.game_image}/>;
    
    const typeTag = <Tag>{collectionData.game_type}</Tag>

    return(
         <Card style={{width:"300px"}} cover={cover} actions={actions}>
            <Card.Meta title={collectionData.game_name} description={typeTag}/>
        </Card>
    )
}


//function that request collection list based on parameters
// parameter {page, pagseSize, is_DESC, sort_by, type, keyword}
async function requestPageContent(page, pagseSize, is_DESC, sort_by, type, keyword)
{
    const config={
        method:"get",
        url:"https://game.norgannon.cn:8848/api/collection/list",
        headers:{
            Authorization:localStorage.getItem("token")
        },
        params:{
            page:page,
            page_size:pagseSize,
            is_DESC:is_DESC,
            sort_by:sort_by,
            type:type,
            keyword:keyword,
        },
    };
    
    try {
        const response = await axios(config);
        //console.log(response);
        return response.data;
      } catch (err) {
        console.log(err);
      }
}

async function deleteCollection(collectionId)
{
    const config={
        method:"delete",
        url:"https://game.norgannon.cn:8848/api/collection/",
        headers:{
            Authorization:localStorage.getItem("token")
        },
        params:{
            collection_id:collectionId,
        }
    };

    try{
        const response = await axios(config);
    }
    catch(err)
    {
        console.log(err);
    }
    
}

/* eslint-disable */