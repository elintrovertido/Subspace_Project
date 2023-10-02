import express from "express";
import axios from "axios";
import _ from "lodash";
import fs from "fs";


// import array from "lodash/array";
// import object from "lodash/fp/object";

const app = express();
const port = 3000;
app.use(express.json());

let blogs = null;

const response = async (req, res) => {

    try {
        const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
            headers: {
                'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
            }
        });

        blogs = response.data.blogs;
    } catch (error) {
        console.error(error);
        blogs = {
            blogs: "NOT FOUND",
            errormessage: "CANT RETRIEVE DATA",
        }
    }
}

response();


app.get('/api/blog-stats', async (req, res) => {
    try {

        // const response = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
        //     headers: {
        //         'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6'
        //     }
        // });

        // blogs = response.data.blogs;

        // 1. number of blogs
        let blogs_size = _.size(blogs);
        console.log("blogs size is " + blogs_size);

        // blogs.forEach(blog =>{
        //     if(blog.title.length > temp.length){
        //         temp = blog.title.length;
        //     }
        // })


        // 2. max length title
        const title = blogs.reduce((max, blog) => {
            let name = blog.title;
            return name.length > max.length ? name : max;
        }, "")

        console.log(title);


        // 3.  number of blogs that contain word "privacy".
        let count = 0;
        blogs.forEach((blog) => {
            // console.log(blog.title)
            if (blog.title.includes("Privacy")) (
                count = count + 1
            )
        })
        console.log("number of times word \"privacy\" is " + count);

        // 4. Generate No Duplicates in blogs.

        // let noduplicates = []
        // blogs.forEach((blog)=>{
        //     if(!noduplicates.includes(blog.title)){
        //         noduplicates.push(blog.title)
        //     }
        // })

        const noduplicates = _.uniqBy(blogs, 'title');
        // console.log(noduplicates);
        console.log("count of no duplicates titles " + noduplicates.length);

        const result = {
            // "Blogs" : blogs,
            "Total number of blogs": blogs_size,
            "The title of the longest blog": title,
            "Number of blogs with \"privacy\" in the title": count,
            "An array of unique blog titles": noduplicates
        }

        res.json(result)

        const resultsaved = JSON.stringify(result, null, 2)
        const filepath = "data-stats.json"

        fs.writeFile(filepath, resultsaved, 'utf-8', (err) => {
            if (err) {
                console.error(err)
            } else {
                console.log("saved succesfully")
            }
        })

    }
    catch (error) {
        res.send(error);
        console.log(error);
    }
})

const getBlogBySearch = _.memoize((blogs, query) => {
    let data = [];
    _.forEach(blogs, (value) => {
        let title = _.toLower(value.title);
        if (title.includes(query)) {
            data.push(value)
        }
    })

    return data;
})

app.get("/api/blog-search", async (req, res) => {

    let query = req.query.query;
    query = _.toLower(query);

    // let data = [];
    // _.forEach(blogs,(value)=>{

    //     let title = _.toLower(value.title);
    //     if(title.includes(query)){
    //         data.push(value)
    //     }
    //     //console.log(value);
    // })

    const data = getBlogBySearch(blogs, query);

    if (data.length == 0) {
        data.push("NO RESULT FOUND")
    }

    res.send(data);

})


app.listen(port, () => {
    // console.log("hello world ");
    // console.log(blogs);

})