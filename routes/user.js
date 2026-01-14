const { Router } = require("express");
const User = require("../models/user");

const router = Router();

router.get("/signin", (req, res) => {
    res.render("signin");
});

router.get("/signup", (req, res) => {
    res.render("signup");
});

// router.post("/signup", async (req, res) => {
//     const { fullName, email, password } = req.body;
//     await User.create({
//         fullName,
//         email,
//         password,
//     });
//     return res.redirect("/");
// });

router.post("/signup", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).send("All fields are required.");
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("Email already registered. Please sign in.");
        }
        await User.create({
            fullName,
            email,
            password,
        });
        return res.redirect("/");
    } 
    catch (error) {
        console.log("Signup Error:", error);
        if (error.code === 11000) {
            return res.status(400).send("Email already exists.");
        }
        return res.status(500).send("Something went wrong. Please try again.");
    }
});


router.post("/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);

        return res.cookie("token", token).redirect("/");
    }
    catch (error) {
        return res.render("signin", {
            error: "Incorrect Email or Password",
        });
    }
});

router.get("/logout", (req, res) => {
    res.clearCookie("token").redirect("/");
});

module.exports = router;