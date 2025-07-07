import Query from "../Models/Query.js";


export const getQueries = {
    controller :async(req,res)=>{

        try{

            const queries = await Query.find();

            return res.send(queries);
            
        }
        catch(e){
            return res.status(500).send("Error Occured");
        }

    }
}

export const addQuery = {
    validator:(req,res,next)=>{
        if ( !req.body.title || !req.body.description) {
            return res.status(400).send("Please Fill all the Fields");
        }

        next();
    },
    controller:async(req,res)=>{

        try{
            await Query.create({
                username:req.currUser.username,
                userid:req.currUser._id,
                avatar:req.currUser.avatar,
                title:req.body.title,
                description:req.body.description
            })


            return res.send("Successfully Added the query !!")
        }
        catch(e){
            return res.status(401).send("Query not added")
        }

    }
}