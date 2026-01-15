const { Router } = require("express");
//const multer = require("multer");
const upload = require("../services/cloudinary");

const path = require("path");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.resolve(`./public/images/uploads/`)); //folder
//   },
//   filename: function (req, file, cb) {
//     const fileName = `${Date.now()}-${file.originalname}`;
//     cb(null, fileName);
//   }
// });

//const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
    return res.render("addBlog", {
        user: req.user,
        title: "",
        body: "",
    });
});

router.get("/:id", async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
    console.log("blog", blog);
    return res.render("blog", {
      user: req.user,
      blog,
      comments,
    });
});

router.post("/comment/:blogId", async (req, res) => {
    const { content } = req.body;

    if (!content) {
      return res.redirect(`/blog/${req.params.blogId}?error=Comment is required`);
    }
    const comment = await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
});

router.post("/", (req, res, next) => {
  upload.single("coverImage") (req, res, function (err) {
        if (err) {
            console.log("❌ Multer/Cloudinary Error:", err);
            return res.status(500).send("Upload failed.");
        }
        console.log("🔥 ROUTE REACHED — POST /blog");
        next();
    })}
    , async (req, res) => {
    try {
      console.log("➡️ POST /blog route hit");
    const { title, body } = req.body;
    console.log("Title:", title, "Body:", body);

    console.log("Uploaded file info:", req.file);

    const coverImageURL = req.file?.path;

    if (!title || !body) {
      console.log("❌ Missing title/body");
      return res.render("addBlog", {
        error: "Title and Body are required",
        user: req.user,
        title,
        body,
      });
    }

    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.render("addBlog", {
        error: "Cover Image is required",
        user: req.user,
        title,
        body,
      });
    }

    const blog = await Blog.create({
        title,
        body,
        createdBy: req.user._id,
        coverImageURL,
    });

    console.log("✅ Blog Created:", blog);
    console.log("Redirecting to: /blog/" + blog._id);

    console.log(`blogid`, blog._id);
    return res.redirect(`/blog/${blog._id}`);
    }
    catch (err) {
        console.error("Error while creating blog:", err);
        res.status(500).send("Something went wrong!");
    }

});

module.exports = router;